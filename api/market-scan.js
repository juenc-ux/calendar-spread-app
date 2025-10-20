// Vercel Serverless Function: Market-Wide FF Scanner
// Scans stocks with market cap >= $500M for best FF without earnings conflicts

const POLYGON_API_KEY = process.env.POLYGON_API_KEY || '';
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

let cache = null;
let lastScanTime = null;

export default async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return cached results if fresh
  if (cache && lastScanTime && Date.now() - lastScanTime < CACHE_TTL) {
    return res.status(200).json({
      success: true,
      cached: true,
      lastScan: new Date(lastScanTime).toISOString(),
      results: cache
    });
  }

  try {
    console.log('🔍 Starting market scan...');
    
    // 1. Fetch all US stocks with market cap >= 500M
    const tickersUrl = `https://api.polygon.io/v3/reference/tickers?market=stocks&active=true&limit=1000&apiKey=${POLYGON_API_KEY}`;
    const tickersRes = await fetch(tickersUrl);
    const tickersData = await tickersRes.json();
    
    const stocks = tickersData.results
      .filter(t => t.market_cap >= 500000000 && t.locale === 'us')
      .slice(0, 200); // Limit to top 200 by market cap for reasonable scan time

    console.log(`📊 Scanning ${stocks.length} stocks...`);

    // 2. For each stock, fetch earnings and calculate best FF
    const results = [];
    
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      try {
        const symbol = stock.ticker;
        console.log(`[${i + 1}/${stocks.length}] Scanning ${symbol}...`);
        
        // Get earnings calendar
        const earningsRes = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/earnings?symbol=${symbol}`);
        const earningsData = await earningsRes.json();
        const earningsDate = earningsData.success ? new Date(earningsData.earningsDate) : null;
        
        // Get available expirations
        const expsRes = await fetch(`https://api.polygon.io/v3/snapshot/options/${symbol}?limit=250&apiKey=${POLYGON_API_KEY}`);
        const expsData = await expsRes.json();
        
        if (!expsData.results || expsData.results.length === 0) {
          console.log(`  ✗ No options data for ${symbol}`);
          continue;
        }
        
        // Extract unique expirations
        const expirations = [...new Set(expsData.results.map(o => o.details?.expiration_date))].filter(Boolean).sort();
        
        // Get spot price
        const spotRes = await fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${POLYGON_API_KEY}`);
        const spotData = await spotRes.json();
        const spotPrice = spotData.results?.[0]?.c || null;
        
        if (!spotPrice || expirations.length < 2) {
          console.log(`  ✗ No price or insufficient expirations for ${symbol}`);
          continue;
        }
        
        // Calculate FF for first few expiration combinations
        let bestFF = 0;
        let bestSpread = null;
        
        for (let j = 0; j < Math.min(10, expirations.length - 1); j++) {
          const exp1 = expirations[j];
          const exp2 = expirations[j + 1];
          
          // Check for earnings conflicts (1 week before front or back)
          if (earningsDate) {
            const date1 = new Date(exp1);
            const date2 = new Date(exp2);
            const oneWeekBefore1 = new Date(date1);
            const oneWeekBefore2 = new Date(date2);
            oneWeekBefore1.setDate(oneWeekBefore1.getDate() - 7);
            oneWeekBefore2.setDate(oneWeekBefore2.getDate() - 7);
            
            if (earningsDate >= oneWeekBefore1 && earningsDate <= date2) {
              continue; // Skip spreads with earnings conflicts
            }
          }
          
          // Fetch IV for both expirations
          const [iv1Data, iv2Data] = await Promise.all([
            fetch(`https://api.polygon.io/v3/snapshot/options/${symbol}?expiration_date=${exp1}&contract_type=call&limit=50&apiKey=${POLYGON_API_KEY}`),
            fetch(`https://api.polygon.io/v3/snapshot/options/${symbol}?expiration_date=${exp2}&contract_type=call&limit=50&apiKey=${POLYGON_API_KEY}`)
          ]).then(responses => Promise.all(responses.map(r => r.json())));
          
          const atmStrike = Math.round(spotPrice / 5) * 5;
          
          // Find strike with delta closest to 0.5 (for calls)
          const findBestStrike = (options) => {
            if (!options?.results) return null;
            
            const calls = options.results.filter(opt => 
              opt.details?.strike_price && 
              opt.details?.contract_type === 'call' &&
              opt.implied_volatility > 0
            );
            
            if (calls.length === 0) return null;
            
            // First try: Delta-based selection
            const callsWithDelta = calls.filter(opt => opt.greeks?.delta !== undefined);
            if (callsWithDelta.length > 0) {
              return callsWithDelta.sort((a, b) => {
                const deltaA = Math.abs(a.greeks.delta - 0.5);
                const deltaB = Math.abs(b.greeks.delta - 0.5);
                return deltaA - deltaB;
              })[0];
            }
            
            // Fallback: closest to ATM
            return calls.sort((a, b) => {
              const distA = Math.abs(a.details.strike_price - atmStrike);
              const distB = Math.abs(b.details.strike_price - atmStrike);
              return distA - distB;
            })[0];
          };
          
          const atm1 = findBestStrike(iv1Data);
          const atm2 = findBestStrike(iv2Data);
          
          if (!atm1?.implied_volatility || !atm2?.implied_volatility) continue;
          
          const iv1 = atm1.implied_volatility;
          const iv2 = atm2.implied_volatility;
          
          const T1 = (new Date(exp1) - new Date()) / (365.25 * 24 * 60 * 60 * 1000);
          const T2 = (new Date(exp2) - new Date()) / (365.25 * 24 * 60 * 60 * 1000);
          
          const numerator = (T2 * iv2 * iv2) - (T1 * iv1 * iv1);
          const denominator = T2 - T1;
          
          if (numerator > 0 && denominator > 0) {
            const forwardVol = Math.sqrt(numerator / denominator);
            const ff = ((iv1 / forwardVol) - 1) * 100;
            
            if (ff > bestFF) {
              bestFF = ff;
              bestSpread = { exp1, exp2, iv1, iv2, ff };
            }
          }
        }
        
        if (bestFF > 10) { // Only include stocks with FF > 10%
          console.log(`  ✓ Found FF ${bestFF.toFixed(2)}% for ${symbol}`);
          results.push({
            symbol,
            name: stock.name,
            price: spotPrice,
            marketCap: stock.market_cap,
            bestFF: bestFF.toFixed(2),
            spread: bestSpread,
            hasEarnings: earningsDate !== null,
            earningsDate: earningsDate?.toISOString().split('T')[0]
          });
        } else {
          console.log(`  ✗ Low FF ${bestFF.toFixed(2)}% for ${symbol}`);
        }
        
      } catch (error) {
        console.error(`  ✗ Error scanning ${stock.ticker}:`, error.message);
      }
    }
    
    // Sort by FF descending
    results.sort((a, b) => parseFloat(b.bestFF) - parseFloat(a.bestFF));
    
    // Cache results
    cache = results.slice(0, 50); // Keep top 50
    lastScanTime = Date.now();
    
    console.log(`✅ Market scan complete! Found ${results.length} opportunities`);
    
    return res.status(200).json({
      success: true,
      cached: false,
      lastScan: new Date(lastScanTime).toISOString(),
      scanned: stocks.length,
      results: cache
    });
    
  } catch (error) {
    console.error('❌ Market scan error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
