// Local development proxy for earnings API
// Mimics Vercel serverless function locally
// Run with: node api/dev-proxy.js

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for localhost:3000
app.use(cors());

const FINNHUB_API_KEY = 'd3r3mvpr01qopgh6r57gd3r3mvpr01qopgh6r580';
const POLYGON_API_KEY = process.env.POLYGON_API_KEY || 'your_polygon_api_key_here';

// Simple in-memory cache (60s TTL)
const cache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds

app.get('/api/earnings', async (req, res) => {
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
    console.log('📊 Fetching earnings for:', upperSymbol);

    // Berechne Zeitraum: heute bis +90 Tage
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 90);

    const fromDate = today.toISOString().split('T')[0];
    const toDate = futureDate.toISOString().split('T')[0];

    // Finnhub Earnings Calendar API
    const finnhubUrl = `https://finnhub.io/api/v1/calendar/earnings?from=${fromDate}&to=${toDate}&symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    
    console.log('Fetching from Finnhub:', finnhubUrl.replace(FINNHUB_API_KEY, 'KEY_HIDDEN'));

    const response = await fetch(finnhubUrl);

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Finnhub response:', data);

    // Finnhub gibt ein Object mit "earningsCalendar" array zurück
    if (data.earningsCalendar && data.earningsCalendar.length > 0) {
      // Finde das nächste Earnings Date für dieses Symbol
      const earningsEvents = data.earningsCalendar
        .filter(e => e.symbol === symbol.toUpperCase())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (earningsEvents.length > 0) {
        const nextEarnings = earningsEvents[0];
        
        // Bestimme Timing (Before/After Market)
        let timeInfo = 'Scheduled';
        if (nextEarnings.hour) {
          const hour = nextEarnings.hour.toLowerCase();
          if (hour.includes('bmo') || hour.includes('before')) {
            timeInfo = 'Before Market Open';
          } else if (hour.includes('amc') || hour.includes('after')) {
            timeInfo = 'After Market Close';
          } else {
            timeInfo = nextEarnings.hour;
          }
        }

        const responseData = {
          success: true,
          earningsDate: nextEarnings.date,
          earningsTime: timeInfo,
          quarter: nextEarnings.quarter,
          year: nextEarnings.year
        };
        
        // Cache the result
        cache.set(upperSymbol, { data: responseData, timestamp: Date.now() });
        
        return res.status(200).json(responseData);
      }
    }

    // Keine Earnings gefunden
    const noEarningsData = {
      success: false,
      message: 'No upcoming earnings found'
    };
    
    // Cache "no earnings" result too (avoid repeated API calls)
    cache.set(upperSymbol, { data: noEarningsData, timestamp: Date.now() });
    
    return res.status(200).json(noEarningsData);

  } catch (error) {
    console.error('❌ Error fetching earnings:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Market Scanner endpoint (simplified for local dev)
app.get('/api/market-scan', async (req, res) => {
  console.log('🔍 Market scan requested...');
  
  try {
    // For local dev, return a simple mock response
    const mockResults = [
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        price: 180.50,
        marketCap: 580000000000,
        bestFF: '25.3',
        spread: { exp1: '2025-10-24', exp2: '2025-10-31' },
        hasEarnings: true,
        earningsDate: '2025-10-22'
      },
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 195.20,
        marketCap: 3000000000000,
        bestFF: '18.7',
        spread: { exp1: '2025-10-24', exp2: '2025-10-31' },
        hasEarnings: false,
        earningsDate: null
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        price: 450.80,
        marketCap: 1100000000000,
        bestFF: '22.1',
        spread: { exp1: '2025-10-24', exp2: '2025-10-31' },
        hasEarnings: true,
        earningsDate: '2025-11-20'
      }
    ];

    res.json({
      success: true,
      cached: false,
      lastScan: new Date().toISOString(),
      scanned: 3,
      results: mockResults
    });
  } catch (error) {
    console.error('Market scan error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Dev proxy running on http://localhost:${PORT}`);
  console.log(`   API endpoints:`);
  console.log(`   - GET /api/earnings?symbol=TSLA`);
  console.log(`   - GET /api/market-scan`);
});

