// Vercel Serverless Function: Earnings via Finnhub API
// Finnhub ist speziell für Entwickler - kein CORS, keine Rate-Limits!

const FINNHUB_API_KEY = 'd3r3mvpr01qopgh6r57gd3r3mvpr01qopgh6r580';

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

        return res.status(200).json({
          success: true,
          earningsDate: nextEarnings.date,
          earningsTime: timeInfo,
          quarter: nextEarnings.quarter,
          year: nextEarnings.year
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
