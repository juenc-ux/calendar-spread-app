// Vercel Serverless Function: Live Stock Quotes via Tradier API
// Provides real-time stock quotes for the calendar spread calculator

const TRADIER_ACCESS_TOKEN = 'bZKTXmHHRXsq1RdeyfKjQXahGyHu';

// Simple in-memory cache (30s TTL for live data)
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

export default async (req, res) => {
  // CORS-Header erlauben
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Hole Symbol aus Query-Parameter
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter required' });
  }

  const upperSymbol = symbol.toUpperCase();
  
  // Check cache first
  const cached = cache.get(upperSymbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('✅ Cache hit for:', upperSymbol);
    return res.status(200).json(cached.data);
  }

  try {
    console.log('📊 Fetching live quote for:', upperSymbol);

    // Tradier Market Data API - Real-time quotes
    const tradierUrl = `https://api.tradier.com/v1/markets/quotes?symbols=${upperSymbol}`;
    
    const response = await fetch(tradierUrl, {
      headers: {
        'Authorization': `Bearer ${TRADIER_ACCESS_TOKEN}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Tradier API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Tradier response:', data);

    // Tradier gibt ein Object mit "quotes" array zurück
    if (data.quotes && data.quotes.quote) {
      const quote = Array.isArray(data.quotes.quote) ? data.quotes.quote[0] : data.quotes.quote;
      
      if (quote && quote.last) {
        const responseData = {
          success: true,
          symbol: quote.symbol,
          price: parseFloat(quote.last),
          change: quote.change ? parseFloat(quote.change) : null,
          changePercentage: quote.change_percentage ? parseFloat(quote.change_percentage) : null,
          volume: quote.volume ? parseInt(quote.volume) : null,
          high: quote.high ? parseFloat(quote.high) : null,
          low: quote.low ? parseFloat(quote.low) : null,
          open: quote.open ? parseFloat(quote.open) : null,
          previousClose: quote.prevclose ? parseFloat(quote.prevclose) : null,
          timestamp: new Date().toISOString()
        };
        
        // Cache the result
        cache.set(upperSymbol, { data: responseData, timestamp: Date.now() });
        
        return res.status(200).json(responseData);
      }
    }

    // Keine Quote gefunden
    const noQuoteData = {
      success: false,
      message: 'No quote data available for this symbol'
    };
    
    return res.status(200).json(noQuoteData);

  } catch (error) {
    console.error('❌ Error fetching quote:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};