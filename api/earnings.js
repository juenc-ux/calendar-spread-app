// Vercel Serverless Function: Proxy für Yahoo Finance Earnings
// Umgeht CORS-Probleme durch Server-Side Fetch

// Import fetch for Node.js environments that don't have it natively
import fetch from 'node-fetch';

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

  try {
    console.log('📊 Fetching earnings for:', symbol);

    // Yahoo Finance API aufrufen (Server-Side, kein CORS!)
    const yahooUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=calendarEvents`;
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();

    // Earnings-Daten extrahieren
    if (data.quoteSummary?.result?.[0]?.calendarEvents?.earnings) {
      const earnings = data.quoteSummary.result[0].calendarEvents.earnings;
      
      if (earnings.earningsDate && earnings.earningsDate.length > 0) {
        const timestamp = earnings.earningsDate[0].raw;
        const earningsDate = new Date(timestamp * 1000).toISOString().split('T')[0];
        
        // Timing bestimmen (Before/After Market)
        let timeInfo = '';
        if (earnings.earningsTime) {
          const time = earnings.earningsTime.toLowerCase();
          if (time.includes('bmo') || time.includes('before')) {
            timeInfo = 'Before Market Open';
          } else if (time.includes('amc') || time.includes('after')) {
            timeInfo = 'After Market Close';
          } else {
            timeInfo = earnings.earningsTime;
          }
        }

        return res.status(200).json({
          success: true,
          earningsDate,
          earningsTime: timeInfo || 'Scheduled'
        });
      }
    }

    // Keine Earnings gefunden
    return res.status(200).json({
      success: false,
      message: 'No upcoming earnings found'
    });

  } catch (error) {
    console.error('❌ Error fetching earnings:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
