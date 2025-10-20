import React, { useState, useEffect } from 'react';
import { Calendar, Download, Moon, Sun } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

export default function ForwardVolCalculator() {
  const [date1, setDate1] = useState('2025-10-24');
  const [date2, setDate2] = useState('2025-10-31');
  const [iv1, setIv1] = useState('50');
  const [iv2, setIv2] = useState('40');
  const [spotPrice, setSpotPrice] = useState('100');
  const [strikePrice, setStrikePrice] = useState('100');
  const [riskFreeRate, setRiskFreeRate] = useState('4');
  const [dividend, setDividend] = useState('0');
  const [showCalendar1, setShowCalendar1] = useState(false);
  const [showCalendar2, setShowCalendar2] = useState(false);
  const [result, setResult] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [callPriceSlider, setCallPriceSlider] = useState(null);
  const [putPriceSlider, setPutPriceSlider] = useState(null);
  const [adjustedFFCall, setAdjustedFFCall] = useState(null);
  const [adjustedFFPut, setAdjustedFFPut] = useState(null);
  const [pricingModel, setPricingModel] = useState('blackscholes');
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('polygonKey') || '');
  const [fmpApiKey, setFmpApiKey] = useState(localStorage.getItem('fmpKey') || 'FjOgXW2EKCdlZWfAQTwkxja7WGS8RERD');
  const [showTickerDropdown, setShowTickerDropdown] = useState(false);
  const [filteredTickers, setFilteredTickers] = useState([]);
  const [volumeCallT1, setVolumeCallT1] = useState(null);
  const [volumeCallT2, setVolumeCallT2] = useState(null);
  const [oiCallT1, setOiCallT1] = useState(null);
  const [oiCallT2, setOiCallT2] = useState(null);
  const [availableExpirations, setAvailableExpirations] = useState(() => {
    // Default: next 50 Fridays
    const today = new Date();
    const fridays = [];
    let currentDate = new Date(today);

    while (fridays.length < 50) {
      currentDate.setDate(currentDate.getDate() + 1);
      if (currentDate.getDay() === 5) {
        fridays.push(currentDate.toISOString().split('T')[0]);
      }
    }

    return fridays;
  });
  const [marketCap, setMarketCap] = useState(null);
  const [avgOptionsVolume, setAvgOptionsVolume] = useState(null);
  const [recommendedSpreads, setRecommendedSpreads] = useState([]);
  const [scanningForSpreads, setScanningForSpreads] = useState(false);
  const [nextEarningsDate, setNextEarningsDate] = useState(null);
  const [earningsTime, setEarningsTime] = useState(null);
  const [earningsConflict, setEarningsConflict] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('currentUser') || 'Nils';
  });
  const [hidePostEarningsSpreads, setHidePostEarningsSpreads] = useState(false);
  const [marketScanResults, setMarketScanResults] = useState([]);
  const [loadingMarketScan, setLoadingMarketScan] = useState(false);
  const [lastMarketScan, setLastMarketScan] = useState(null);
  const [recentTickers, setRecentTickers] = useState(() => {
    const saved = localStorage.getItem(`recentTickers_${currentUser}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem(`watchlist_${currentUser}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Reload user-specific data when user changes
  useEffect(() => {
    const savedWatchlist = localStorage.getItem(`watchlist_${currentUser}`);
    const savedRecent = localStorage.getItem(`recentTickers_${currentUser}`);
    setWatchlist(savedWatchlist ? JSON.parse(savedWatchlist) : []);
    setRecentTickers(savedRecent ? JSON.parse(savedRecent) : []);
  }, [currentUser]);

  // Popular US stocks for autocomplete
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'MA', name: 'Mastercard Inc.' },
    { symbol: 'PG', name: 'Procter & Gamble Co.' },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.' },
    { symbol: 'HD', name: 'Home Depot Inc.' },
    { symbol: 'DIS', name: 'Walt Disney Co.' },
    { symbol: 'BAC', name: 'Bank of America Corp.' },
    { symbol: 'ADBE', name: 'Adobe Inc.' },
    { symbol: 'CRM', name: 'Salesforce Inc.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    { symbol: 'CMCSA', name: 'Comcast Corporation' },
    { symbol: 'XOM', name: 'Exxon Mobil Corporation' },
    { symbol: 'COST', name: 'Costco Wholesale Corp.' },
    { symbol: 'PEP', name: 'PepsiCo Inc.' },
    { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.' },
    { symbol: 'ABT', name: 'Abbott Laboratories' },
    { symbol: 'NKE', name: 'Nike Inc.' },
    { symbol: 'CSCO', name: 'Cisco Systems Inc.' },
    { symbol: 'ORCL', name: 'Oracle Corporation' },
    { symbol: 'AMD', name: 'Advanced Micro Devices Inc.' },
    { symbol: 'INTC', name: 'Intel Corporation' },
    { symbol: 'QCOM', name: 'Qualcomm Inc.' },
    { symbol: 'TXN', name: 'Texas Instruments Inc.' },
    { symbol: 'AVGO', name: 'Broadcom Inc.' },
    { symbol: 'CVX', name: 'Chevron Corporation' },
    { symbol: 'KO', name: 'Coca-Cola Co.' },
    { symbol: 'MCD', name: 'McDonald\'s Corporation' },
    { symbol: 'PYPL', name: 'PayPal Holdings Inc.' },
    { symbol: 'UBER', name: 'Uber Technologies Inc.' },
    { symbol: 'BA', name: 'Boeing Co.' },
    { symbol: 'CAT', name: 'Caterpillar Inc.' },
    { symbol: 'GE', name: 'General Electric Co.' },
    { symbol: 'F', name: 'Ford Motor Co.' },
    { symbol: 'GM', name: 'General Motors Co.' },
    { symbol: 'SBUX', name: 'Starbucks Corporation' },
    { symbol: 'PLTR', name: 'Palantir Technologies Inc.' },
    { symbol: 'COIN', name: 'Coinbase Global Inc.' },
    { symbol: 'SQ', name: 'Block Inc.' },
    { symbol: 'SNOW', name: 'Snowflake Inc.' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
    { symbol: 'IWM', name: 'iShares Russell 2000 ETF' },
    { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF' },
    { symbol: 'GLD', name: 'SPDR Gold Trust' },
    { symbol: 'SLV', name: 'iShares Silver Trust' },
    { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF' },
    { symbol: 'XLE', name: 'Energy Select Sector SPDR Fund' },
    { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund' },
    { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund' },
  ];

  const handleTickerChange = (value) => {
    const upper = value.toUpperCase();
    setTicker(upper);

    if (upper.length > 0) {
      const matches = popularStocks.filter(stock =>
        stock.symbol.startsWith(upper) ||
        stock.name.toUpperCase().includes(upper)
      ).slice(0, 10);
      setFilteredTickers(matches);
      setShowTickerDropdown(matches.length > 0);
    } else {
      setFilteredTickers([]);
      setShowTickerDropdown(false);
    }
  };

  const selectTicker = (symbol) => {
    setTicker(symbol);
    setShowTickerDropdown(false);
    setFilteredTickers([]);
  };

  const loadDemoData = () => {
    // Demo data for SPY
    setTicker('SPY');
    setSpotPrice('580.25');
    setStrikePrice('580');
    setDate1('2025-10-24');
    setDate2('2025-10-31');
    setIv1('12.5');
    setIv2('11.8');
    setRiskFreeRate('4.5');
    setDividend('1.2');

    // Auto-calculate
    setTimeout(() => calculateResults(), 100);
  };

  // Add ticker to recent tickers list
  const addToRecentTickers = (symbol) => {
    const upperSymbol = symbol.toUpperCase().trim();
    const updated = [upperSymbol, ...recentTickers.filter(t => t !== upperSymbol)].slice(0, 6);
    setRecentTickers(updated);
    localStorage.setItem(`recentTickers_${currentUser}`, JSON.stringify(updated));
  };

  const addToWatchlist = (symbol, bestFF, hasEarnings, earningsDate, price, spreadData = null) => {
    const upperSymbol = symbol.toUpperCase().trim();
    const updated = [
      {
        symbol: upperSymbol,
        bestFF: bestFF,
        hasEarnings: hasEarnings,
        earningsDate: earningsDate,
        price: price,
        spreadData: spreadData, // Calendar spread details if applicable
        lastUpdated: new Date().toISOString()
      },
      ...watchlist.filter(item => item.symbol !== upperSymbol)
    ].slice(0, 10); // Keep max 10 items
    setWatchlist(updated);
    localStorage.setItem(`watchlist_${currentUser}`, JSON.stringify(updated));
  };

  const addSpreadToWatchlist = (spread) => {
    const spreadId = `${spread.date1}-${spread.date2}-${spread.strike}`;
    const updated = [
      {
        id: spreadId,
        type: 'spread',
        symbol: ticker,
        date1: spread.date1,
        date2: spread.date2,
        dte1: spread.dte1,
        dte2: spread.dte2,
        ff: spread.ff,
        strike: spread.strike,
        iv1: spread.iv1,
        iv2: spread.iv2,
        callSpread: spread.callSpread,
        lastUpdated: new Date().toISOString()
      },
      ...watchlist.filter(item => item.id !== spreadId)
    ].slice(0, 10); // Keep max 10 items
    setWatchlist(updated);
    localStorage.setItem(`watchlist_${currentUser}`, JSON.stringify(updated));
  };

  const fetchMarketScan = async () => {
    setLoadingMarketScan(true);
    try {
      const response = await fetch('/api/market-scan');
      const data = await response.json();
      if (data.success) {
        setMarketScanResults(data.results);
        setLastMarketScan(data.lastScan);
      }
    } catch (error) {
      console.error('Error fetching market scan:', error);
    }
    setLoadingMarketScan(false);
  };

  const fetchOptionData = async (tickerSymbol) => {
    if (!tickerSymbol || tickerSymbol.trim() === '') {
      setLoadError('Please enter a ticker symbol');
      return;
    }

    if (!apiKey || apiKey.trim() === '') {
      setLoadError('Please enter your Polygon.io API key');
      return;
    }

    setLoading(true);
    setLoadError(null);
    
    // Reset earnings data when loading new ticker
    setNextEarningsDate(null);
    setEarningsTime(null);

    try {
      const symbol = tickerSymbol.toUpperCase().trim();
      console.log('Fetching data for:', symbol);

      // Save API key to localStorage
      localStorage.setItem('polygonKey', apiKey);

      // 1. Get previous close (most recent available data)
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      const quoteUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`;
      console.log('Fetching quote from Polygon.io...');

      const quoteResponse = await fetch(quoteUrl);

      if (!quoteResponse.ok) {
        throw new Error(`API Error (${quoteResponse.status}). Check your API key.`);
      }

      const quoteData = await quoteResponse.json();
      console.log('Quote data:', quoteData);

      if (quoteData.status === 'ERROR') {
        throw new Error(quoteData.error || 'Invalid ticker symbol');
      }

      if (!quoteData.results || quoteData.results.length === 0) {
        throw new Error('No price data available for this ticker');
      }

      const result = quoteData.results[0];
      const currentPrice = result.c; // closing price

      if (!currentPrice || currentPrice <= 0) {
        throw new Error('No valid price data available');
      }

      setSpotPrice(currentPrice.toFixed(2));

      // 2. Get ticker details (market cap)
      try {
        const tickerDetailsUrl = `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${apiKey}`;
        const tickerDetailsResponse = await fetch(tickerDetailsUrl);
        if (tickerDetailsResponse.ok) {
          const tickerDetailsData = await tickerDetailsResponse.json();
          if (tickerDetailsData.results?.market_cap) {
            setMarketCap(tickerDetailsData.results.market_cap);
          }
        }
      } catch (error) {
        console.log('Could not load market cap:', error);
      }

      // 3. Load available expiration dates using Options Contracts Reference API
      let expirationDates = [];
      try {
        console.log('Fetching available expiration dates...');
        let contractsUrl = `https://api.polygon.io/v3/reference/options/contracts?underlying_ticker=${symbol}&expired=false&limit=1000&apiKey=${apiKey}`;
        const allDates = new Set();

        // Fetch all pages (pagination)
        while (contractsUrl) {
          const contractsResponse = await fetch(contractsUrl);
          if (contractsResponse.ok) {
            const contractsData = await contractsResponse.json();

            if (contractsData.results && contractsData.results.length > 0) {
              contractsData.results.forEach(contract => {
                if (contract.expiration_date) {
                  allDates.add(contract.expiration_date);
                }
              });
            }

            // Check for next page
            contractsUrl = contractsData.next_url ? `${contractsData.next_url}&apiKey=${apiKey}` : null;
          } else {
            break;
          }
        }

        // Sort dates and filter future dates only
        expirationDates = Array.from(allDates)
          .sort()
          .filter(date => new Date(date) > today);

        setAvailableExpirations(expirationDates);
        console.log(`Found ${expirationDates.length} available expiration dates`);
      } catch (error) {
        console.log('Could not load expiration dates:', error);
      }

      // 4. Set default dates (use first two available, or calculate Fridays as fallback)
      let exp1Date, exp2Date;

      if (expirationDates.length >= 2) {
        exp1Date = expirationDates[0];
        exp2Date = expirationDates[1];
        setDate1(exp1Date);
        setDate2(exp2Date);
      } else {
        // Fallback: Calculate next two Fridays
        const fridays = [];
        let currentDate = new Date(today);

        while (fridays.length < 2) {
          if (currentDate.getDay() === 5 && currentDate > today) {
            fridays.push(new Date(currentDate));
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        exp1Date = fridays[0].toISOString().split('T')[0];
        exp2Date = fridays[1].toISOString().split('T')[0];
        setDate1(exp1Date);
        setDate2(exp2Date);
      }

      // 4.5. Calculate average options volume (20 trading days)
      const avgVol = await calculateAvgOptionsVolume(symbol, apiKey);
      if (avgVol !== null) {
        setAvgOptionsVolume(avgVol);
      }

      // 4.6. Fetch earnings date
      console.log('About to fetch earnings date...');
      await fetchEarningsDate(symbol, apiKey);
      console.log('Earnings fetch completed');

      // 5. Set ATM strike (rounded to nearest $5)
      const roundedStrike = Math.round(currentPrice / 5) * 5;
      setStrikePrice(roundedStrike.toFixed(2));

      // 6. Try to get options data using Option Chain Snapshot API with date filters
      let gotRealIV1 = false;
      let gotRealIV2 = false;
      let totalVolume = 0;
      let volumeCount = 0;

      try {
        // Fetch expiration 1 options with date filter
        const chain1Url = `https://api.polygon.io/v3/snapshot/options/${symbol}?expiration_date.gte=${exp1Date}&expiration_date.lte=${exp1Date}&contract_type=call&limit=250&apiKey=${apiKey}`;
        console.log('Fetching options chain for expiration 1...');

        const chain1Response = await fetch(chain1Url);

        if (chain1Response.ok) {
          const chain1Data = await chain1Response.json();
          console.log('Expiration 1 options data:', chain1Data);

          if (chain1Data.status === 'OK' && chain1Data.results && chain1Data.results.length > 0) {
            // Find ATM call option - closest to rounded strike
            const atmCall = chain1Data.results
              .filter(opt => opt.details?.strike_price && Math.abs(opt.details.strike_price - roundedStrike) < 20)
              .sort((a, b) => Math.abs(a.details.strike_price - roundedStrike) - Math.abs(b.details.strike_price - roundedStrike))[0];

            if (atmCall) {
              if (atmCall.implied_volatility !== undefined && atmCall.implied_volatility > 0) {
                const iv1Value = (atmCall.implied_volatility * 100).toFixed(2);
                setIv1(iv1Value);
                gotRealIV1 = true;
              }
              if (atmCall.day?.volume !== undefined) {
                setVolumeCallT1(atmCall.day.volume);
                totalVolume += atmCall.day.volume;
                volumeCount++;
              }
              if (atmCall.open_interest !== undefined) {
                setOiCallT1(atmCall.open_interest);
              }
            }

            // Calculate average volume from all options in this expiration
            chain1Data.results.forEach(opt => {
              if (opt.day?.volume !== undefined && opt.day.volume > 0) {
                totalVolume += opt.day.volume;
                volumeCount++;
              }
            });
          }
        }

        // Fetch expiration 2 options with date filter
        const chain2Url = `https://api.polygon.io/v3/snapshot/options/${symbol}?expiration_date.gte=${exp2Date}&expiration_date.lte=${exp2Date}&contract_type=call&limit=250&apiKey=${apiKey}`;
        console.log('Fetching options chain for expiration 2...');

        const chain2Response = await fetch(chain2Url);

        if (chain2Response.ok) {
          const chain2Data = await chain2Response.json();
          console.log('Expiration 2 options data:', chain2Data);

          if (chain2Data.status === 'OK' && chain2Data.results && chain2Data.results.length > 0) {
            // Find ATM call option - closest to rounded strike
            const atmCall = chain2Data.results
              .filter(opt => opt.details?.strike_price && Math.abs(opt.details.strike_price - roundedStrike) < 20)
              .sort((a, b) => Math.abs(a.details.strike_price - roundedStrike) - Math.abs(b.details.strike_price - roundedStrike))[0];

            if (atmCall) {
              if (atmCall.implied_volatility !== undefined && atmCall.implied_volatility > 0) {
                const iv2Value = (atmCall.implied_volatility * 100).toFixed(2);
                setIv2(iv2Value);
                gotRealIV2 = true;
              }
              if (atmCall.day?.volume !== undefined) {
                setVolumeCallT2(atmCall.day.volume);
                totalVolume += atmCall.day.volume;
                volumeCount++;
              }
              if (atmCall.open_interest !== undefined) {
                setOiCallT2(atmCall.open_interest);
              }
            }

            // Calculate average volume from all options in this expiration
            chain2Data.results.forEach(opt => {
              if (opt.day?.volume !== undefined && opt.day.volume > 0) {
                totalVolume += opt.day.volume;
                volumeCount++;
              }
            });
          }
        }

        // Calculate and set average options volume
        if (volumeCount > 0) {
          const avgVol = Math.round(totalVolume / volumeCount);
          setAvgOptionsVolume(avgVol);
          console.log(`Average options volume: ${avgVol} (from ${volumeCount} contracts)`);
        }

        // If we didn't get real IV data, use defaults
        if (!gotRealIV1 || !gotRealIV2) {
          console.log('Options data not available (expected with free tier), using defaults');
          if (!gotRealIV1) setIv1('30');
          if (!gotRealIV2) setIv2('28');
        }

      } catch (optError) {
        console.log('Error fetching options data:', optError);
        // Use reasonable defaults based on historical volatility
        setIv1('30');
        setIv2('28');
      }

      setLoading(false);
      setLoadError(null);

      if (gotRealIV1 && gotRealIV2) {
        console.log('✅ Stock price and real IV data loaded from Polygon.io!');
      } else {
        console.log('✅ Stock price loaded! IV values are estimates (upgrade for real IV data)');
      }

      // Auto-calculate after loading data
      setTimeout(() => calculateResults(), 100);

      // Scan for best calendar spreads
      setTimeout(() => scanCalendarSpreads(), 500);

      // Add to recent tickers on successful load
      addToRecentTickers(symbol);

    } catch (error) {
      console.error('Error fetching option data:', error);
      setLoadError(error.message || 'Failed to load option data');
      setLoading(false);
    }
  };

  // Fetch next earnings date using our serverless API (bypasses CORS)
  const fetchEarningsDate = async (symbol, apiKey) => {
    try {
      console.log('📊 Fetching earnings date for:', symbol);
      
      // Use our serverless API endpoint (works both locally and deployed)
      const apiUrl = `/api/earnings?symbol=${symbol}`;
      console.log('Fetching from API:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API data received:', data);
        
        if (data.success && data.earningsDate) {
          setNextEarningsDate(data.earningsDate);
          setEarningsTime(data.earningsTime || 'Scheduled');
          console.log('✅ Successfully set earnings date:', data.earningsDate, data.earningsTime);
          return;
        } else {
          console.log('No earnings data in response');
        }
      } else {
        const errorData = await response.json();
        console.error('API error:', response.status, errorData);
      }
      
      // If no earnings found
      setNextEarningsDate(null);
      setEarningsTime(null);
      console.log('ℹ️ No upcoming earnings found for', symbol);
      
    } catch (error) {
      console.error('❌ Error fetching earnings date:', error);
      setNextEarningsDate(null);
      setEarningsTime(null);
    }
  };

  // Calculate average TOTAL options volume (puts + calls) over last 20 trading days
  const calculateAvgOptionsVolume = async (symbol, apiKey) => {
    try {
      console.log('Calculating average TOTAL options volume (puts + calls, 20 days)...');

      // Calculate last 20 trading days (skip weekends)
      const tradingDays = [];
      let currentDate = new Date();

      while (tradingDays.length < 20) {
        currentDate.setDate(currentDate.getDate() - 1);
        const dayOfWeek = currentDate.getDay();
        // Skip weekends (0 = Sunday, 6 = Saturday)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          tradingDays.push(currentDate.toISOString().split('T')[0]);
        }
      }

      // Fetch snapshots for all 20 days in parallel (no rate limit!)
      const promises = tradingDays.map(date =>
        fetch(`https://api.polygon.io/v3/snapshot/options/${symbol}?date=${date}&limit=1000&apiKey=${apiKey}`)
          .then(res => res.json())
          .catch(err => {
            console.log(`Failed to fetch snapshot for ${date}:`, err);
            return null;
          })
      );

      const responses = await Promise.all(promises);

      // Calculate total volume per day, then average across days
      const dailyVolumes = [];

      responses.forEach((data, index) => {
        if (data?.results && data.results.length > 0) {
          let dayTotal = 0;
          data.results.forEach(opt => {
            if (opt.day?.volume && opt.day.volume > 0) {
              dayTotal += opt.day.volume;
            }
          });
          if (dayTotal > 0) {
            dailyVolumes.push(dayTotal);
          }
        }
      });

      if (dailyVolumes.length > 0) {
        const totalVolume = dailyVolumes.reduce((sum, vol) => sum + vol, 0);
        const avgDailyVol = Math.round(totalVolume / dailyVolumes.length);
        console.log(`Average daily TOTAL options volume (puts + calls): ${avgDailyVol.toLocaleString()} (from ${dailyVolumes.length} days)`);
        return avgDailyVol;
      }

      return null;
    } catch (error) {
      console.error('Error calculating avg options volume:', error);
      return null;
    }
  };

  // Scan all expiration combinations to find highest FF spreads
  const scanCalendarSpreads = async () => {
    if (!ticker || !apiKey || availableExpirations.length < 2) return;

    setScanningForSpreads(true);
    setRecommendedSpreads([]);

    try {
      const symbol = ticker.toUpperCase().trim();
      const S = parseFloat(spotPrice);
      const K = Math.round(S / 5) * 5; // ATM strike
      const r = parseFloat(riskFreeRate) / 100;
      const q = parseFloat(dividend) / 100;

      // Fetch IV data for up to first 20 expirations (to avoid too many API calls)
      const expsToScan = availableExpirations.slice(0, 20);
      
      console.log('=== SCAN START ===');
      console.log('Ticker:', symbol);
      console.log('Spot Price:', S);
      console.log('ATM Strike:', K);
      console.log('Available expirations:', availableExpirations.length);
      console.log('Will scan first:', expsToScan.length);
      console.log('Expirations to scan:', expsToScan);

      // Fetch IV for all expirations in parallel
      const ivPromises = expsToScan.map(async (expDate, index) => {
        try {
          console.log(`[${index + 1}/${expsToScan.length}] Fetching IV for ${expDate}...`);
          const chainUrl = `https://api.polygon.io/v3/snapshot/options/${symbol}?expiration_date.gte=${expDate}&expiration_date.lte=${expDate}&contract_type=call&limit=250&apiKey=${apiKey}`;
          const response = await fetch(chainUrl);

          console.log(`  → Response status: ${response.status}`);

          if (response.ok) {
            const data = await response.json();
            console.log(`  → API Status: ${data.status}, Results: ${data.results?.length || 0}`);
            
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              const atmCall = data.results
                .filter(opt => opt.details?.strike_price && Math.abs(opt.details.strike_price - K) < 20)
                .sort((a, b) => Math.abs(a.details.strike_price - K) - Math.abs(b.details.strike_price - K))[0];

              if (atmCall && atmCall.implied_volatility > 0) {
                console.log(`  ✓ Found ATM call at strike ${atmCall.details.strike_price}, IV: ${(atmCall.implied_volatility * 100).toFixed(2)}%`);
                return { date: expDate, iv: atmCall.implied_volatility };
              } else {
                console.log(`  ✗ No ATM call found near strike ${K}`);
              }
            } else {
              console.log(`  ✗ No valid results in response`);
            }
          } else {
            console.warn(`  ✗ HTTP Error: ${response.status} ${response.statusText}`);
          }
        } catch (error) {
          console.error(`  ✗ Exception for ${expDate}:`, error.message);
        }
        return null;
      });

      const ivResults = (await Promise.all(ivPromises)).filter(r => r !== null);

      console.log('=== IV FETCH COMPLETE ===');
      console.log(`Successfully fetched IV for ${ivResults.length}/${expsToScan.length} expirations`);
      console.log('IV Results:', ivResults);

      if (ivResults.length < 2) {
        console.warn('❌ NOT ENOUGH IV DATA');
        console.warn(`Only ${ivResults.length} expirations had valid IV data`);
        console.warn('Expirations scanned:', expsToScan);
        console.warn('IV Results:', ivResults);
        setLoadError(`Scanner found IV data for only ${ivResults.length}/${expsToScan.length} expirations. Check console for details.`);
        setScanningForSpreads(false);
        return;
      }

      // Calculate FF for all combinations
      const spreads = [];
      const now = new Date();

      for (let i = 0; i < ivResults.length - 1; i++) {
        for (let j = i + 1; j < ivResults.length; j++) {
          const exp1 = ivResults[i];
          const exp2 = ivResults[j];

          const d1 = new Date(exp1.date + 'T16:00:00-04:00');
          const d2 = new Date(exp2.date + 'T16:00:00-04:00');

          const daysToExp1 = (d1 - now) / (1000 * 60 * 60 * 24);
          const daysToExp2 = (d2 - now) / (1000 * 60 * 60 * 24);

          if (daysToExp1 <= 0 || daysToExp2 <= 0) continue;

          const T1 = daysToExp1 / 365;
          const T2 = daysToExp2 / 365;

          const v1 = exp1.iv;
          const v2 = exp2.iv;

          const numerator = (T2 * v2 * v2) - (T1 * v1 * v1);
          const denominator = T2 - T1;

          if (numerator > 0 && denominator > 0) {
            const forwardVol = Math.sqrt(numerator / denominator);
            const ff = ((v1 / forwardVol) - 1) * 100;

            // Calculate call spread price
            const callT1 = getOptionPrice(S, K, T1, r, v1, q, true);
            const callT2 = getOptionPrice(S, K, T2, r, v2, q, true);
            const callSpread = callT2 - callT1;

            // Check if front expiration is after earnings
            let isPostEarnings = false;
            if (nextEarningsDate) {
              const earningsDate = new Date(nextEarningsDate);
              const frontExpDate = new Date(exp1.date);
              // Post-earnings if front exp is after earnings
              isPostEarnings = frontExpDate > earningsDate;
            }

            spreads.push({
              date1: exp1.date,
              date2: exp2.date,
              dte1: Math.floor(daysToExp1),
              dte2: Math.floor(daysToExp2),
              ff: ff,
              iv1: (v1 * 100).toFixed(2),
              iv2: (v2 * 100).toFixed(2),
              callSpread: callSpread.toFixed(2),
              strike: K,
              isPostEarnings: isPostEarnings
            });
          }
        }
      }

      console.log('=== CALCULATING SPREADS ===');
      console.log(`Calculating spreads from ${ivResults.length} expirations...`);
      console.log(`Generated ${spreads.length} total spreads`);

      // Filter out post-earnings spreads if requested
      let filteredSpreads = spreads;
      if (hidePostEarningsSpreads) {
        filteredSpreads = spreads.filter(s => !s.isPostEarnings);
        console.log(`Filtered to ${filteredSpreads.length} spreads (removed post-earnings)`);
      }

      // Sort by FF descending and take top 10
      filteredSpreads.sort((a, b) => b.ff - a.ff);
      const topSpreads = filteredSpreads.slice(0, 10);

      console.log('=== SCAN COMPLETE ===');
      console.log(`Found ${filteredSpreads.length} valid spreads, showing top ${Math.min(10, topSpreads.length)}`);
      console.log('Top 10 spreads:', topSpreads);
      setRecommendedSpreads(topSpreads);

      // Add to watchlist with best FF
      if (topSpreads.length > 0) {
        const bestSpread = topSpreads[0];
        addToWatchlist(
          symbol,
          bestSpread.ff.toFixed(2),
          nextEarningsDate !== null,
          nextEarningsDate,
          S.toFixed(2)
        );
      }

    } catch (error) {
      console.error('=== SCAN ERROR ===');
      console.error('Error scanning calendar spreads:', error);
      console.error('Error stack:', error.stack);
      setLoadError(`Scan failed: ${error.message}`);
    }

    setScanningForSpreads(false);
  };

  // Calculate DTE (Days to Expiration) for a given date
  const calculateDTE = (expirationDate) => {
    const expDate = new Date(expirationDate + 'T16:00:00-04:00'); // 4 PM EST
    const now = new Date();
    const diffMs = expDate - now;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.floor(diffDays));
  };

  // Function to update IV based on selected expiration date
  const updateIVForDate = async (expirationDate, isFirstDate) => {
    if (!ticker || !apiKey || !expirationDate) return;

    try {
      const symbol = ticker.toUpperCase().trim();
      const roundedStrike = Math.round(parseFloat(spotPrice) / 5) * 5;

      const chainUrl = `https://api.polygon.io/v3/snapshot/options/${symbol}?expiration_date.gte=${expirationDate}&expiration_date.lte=${expirationDate}&contract_type=call&limit=250&apiKey=${apiKey}`;
      console.log(`Fetching IV for ${expirationDate}...`);

      const chainResponse = await fetch(chainUrl);

      if (chainResponse.ok) {
        const chainData = await chainResponse.json();

        if (chainData.status === 'OK' && chainData.results && chainData.results.length > 0) {
          // Find ATM call option - closest to rounded strike
          const atmCall = chainData.results
            .filter(opt => opt.details?.strike_price && Math.abs(opt.details.strike_price - roundedStrike) < 20)
            .sort((a, b) => Math.abs(a.details.strike_price - roundedStrike) - Math.abs(b.details.strike_price - roundedStrike))[0];

          if (atmCall) {
            if (atmCall.implied_volatility !== undefined && atmCall.implied_volatility > 0) {
              const ivValue = (atmCall.implied_volatility * 100).toFixed(2);
              if (isFirstDate) {
                setIv1(ivValue);
              } else {
                setIv2(ivValue);
              }
            }
            if (atmCall.day?.volume !== undefined) {
              if (isFirstDate) {
                setVolumeCallT1(atmCall.day.volume);
              } else {
                setVolumeCallT2(atmCall.day.volume);
              }
            }
            if (atmCall.open_interest !== undefined) {
              if (isFirstDate) {
                setOiCallT1(atmCall.open_interest);
              } else {
                setOiCallT2(atmCall.open_interest);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating IV:', error);
    }
  };

  const getNextFridays = () => {
    const today = new Date();
    let fridays = [];
    let currentDate = new Date(today);

    while (fridays.length < 50) {
      if (currentDate.getDay() === 5) {
        fridays.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return fridays;
  };

  const normDist = (x) => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x));

    return 0.5 * (1.0 + sign * y);
  };

  const blackScholesCall = (S, K, T, r, sigma, q = 0) => {
    if (T <= 0 || sigma <= 0) return Math.max(S - K, 0);
    
    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;
    
    const callPrice = S * Math.exp(-q * T) * normDist(d1) - K * Math.exp(-r * T) * normDist(d2);
    return Math.max(callPrice, 0);
  };

  const blackScholesPut = (S, K, T, r, sigma, q = 0) => {
    if (T <= 0 || sigma <= 0) return Math.max(K - S, 0);
    
    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;
    
    const putPrice = K * Math.exp(-r * T) * normDist(-d2) - S * Math.exp(-q * T) * normDist(-d1);
    return Math.max(putPrice, 0);
  };

  const black76Call = (F, K, T, r, sigma) => {
    if (T <= 0 || sigma <= 0) return Math.max(F - K, 0);
    
    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(F / K) + (0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;
    
    const callPrice = Math.exp(-r * T) * (F * normDist(d1) - K * normDist(d2));
    return Math.max(callPrice, 0);
  };

  const black76Put = (F, K, T, r, sigma) => {
    if (T <= 0 || sigma <= 0) return Math.max(K - F, 0);
    
    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(F / K) + (0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;
    
    const putPrice = Math.exp(-r * T) * (K * normDist(-d2) - F * normDist(-d1));
    return Math.max(putPrice, 0);
  };

  const binomialCall = (S, K, T, r, sigma, q = 0, steps = 50) => {
    const dt = T / steps;
    const u = Math.exp(sigma * Math.sqrt(dt));
    const d = 1 / u;
    const p = (Math.exp((r - q) * dt) - d) / (u - d);
    
    // Stock prices at maturity
    const prices = [];
    for (let i = 0; i <= steps; i++) {
      prices[i] = S * Math.pow(u, steps - i) * Math.pow(d, i);
    }
    
    // Option values at maturity
    const values = prices.map(price => Math.max(price - K, 0));
    
    // Backward induction
    for (let j = steps - 1; j >= 0; j--) {
      for (let i = 0; i <= j; i++) {
        values[i] = Math.exp(-r * dt) * (p * values[i] + (1 - p) * values[i + 1]);
      }
    }
    
    return values[0];
  };

  const binomialPut = (S, K, T, r, sigma, q = 0, steps = 50) => {
    const dt = T / steps;
    const u = Math.exp(sigma * Math.sqrt(dt));
    const d = 1 / u;
    const p = (Math.exp((r - q) * dt) - d) / (u - d);
    
    // Stock prices at maturity
    const prices = [];
    for (let i = 0; i <= steps; i++) {
      prices[i] = S * Math.pow(u, steps - i) * Math.pow(d, i);
    }
    
    // Option values at maturity
    const values = prices.map(price => Math.max(K - price, 0));
    
    // Backward induction
    for (let j = steps - 1; j >= 0; j--) {
      for (let i = 0; i <= j; i++) {
        values[i] = Math.exp(-r * dt) * (p * values[i] + (1 - p) * values[i + 1]);
      }
    }
    
    return values[0];
  };

  const getOptionPrice = (S, K, T, r, sigma, q, isCall) => {
    switch(pricingModel) {
      case 'black76':
        const F = S * Math.exp((r - q) * T);
        return isCall ? black76Call(F, K, T, r, sigma) : black76Put(F, K, T, r, sigma);
      case 'binomial':
        return isCall ? binomialCall(S, K, T, r, sigma, q) : binomialPut(S, K, T, r, sigma, q);
      case 'blackscholes':
      default:
        return isCall ? blackScholesCall(S, K, T, r, sigma, q) : blackScholesPut(S, K, T, r, sigma, q);
    }
  };

  const handlePriceSlider = (newPrice, isCallSpread) => {
    if (!result) return;

    const S = parseFloat(spotPrice);
    const K = parseFloat(strikePrice);
    const v1 = parseFloat(iv1) / 100;
    const r = parseFloat(riskFreeRate) / 100;
    const q = parseFloat(dividend) / 100;
    
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const now = new Date();
    
    const d1_16NY = new Date(d1);
    d1_16NY.setHours(22, 0, 0, 0);
    
    const d2_16NY = new Date(d2);
    d2_16NY.setHours(22, 0, 0, 0);

    const msPerDay = 24 * 60 * 60 * 1000;
    const daysToExp1 = (d1_16NY - now) / msPerDay;
    const daysToExp2 = (d2_16NY - now) / msPerDay;
    
    const T1 = daysToExp1 / 365;
    const T2 = daysToExp2 / 365;
    
    const frontPrice = isCallSpread 
      ? getOptionPrice(S, K, T1, r, v1, q, true)
      : getOptionPrice(S, K, T1, r, v1, q, false);
    
    // Target Back-Option Preis basierend auf neuer Spread-Preis
    const targetBackPrice = newPrice + frontPrice;
    
    // Binäre Suche nach der IV2, die zu targetBackPrice führt
    let v2Low = 0.001;
    let v2High = 3.0;
    let v2Mid = 1.0;
    
    for (let iteration = 0; iteration < 100; iteration++) {
      v2Mid = (v2Low + v2High) / 2;
      const backPrice = isCallSpread 
        ? getOptionPrice(S, K, T2, r, v2Mid, q, true)
        : getOptionPrice(S, K, T2, r, v2Mid, q, false);
      
      const diff = backPrice - targetBackPrice;
      
      if (Math.abs(diff) < 0.00001) break;
      
      if (diff > 0) {
        v2High = v2Mid;
      } else {
        v2Low = v2Mid;
      }
    }
    
    // Mit dieser gefundenen IV2 berechne den echten FF
    const numerator = (T2 * v2Mid * v2Mid) - (T1 * v1 * v1);
    const denominator = T2 - T1;
    
    let newFF;
    if (numerator >= 0 && denominator > 0) {
      const forwardVol = Math.sqrt(numerator / denominator);
      newFF = ((v1 / forwardVol) - 1) * 100;
    } else {
      newFF = parseFloat(result.forwardFactor);
    }
    
    if (isCallSpread) {
      setCallPriceSlider(newPrice);
      setAdjustedFFCall(newFF);
    } else {
      setPutPriceSlider(newPrice);
      setAdjustedFFPut(newFF);
    }
  };

  const calculateResults = () => {
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      if (d2 <= d1) {
        setResult({ error: 'Expiration 2 muss nach Expiration 1 liegen' });
        return;
      }

      // Berechne verbleibende Zeit mit Berücksichtigung der NY-Schließzeit (16:00 EST = 22:00 Berlin)
      const now = new Date();
      const d1_16NY = new Date(d1);
      d1_16NY.setHours(22, 0, 0, 0); // 16:00 EST = 22:00 Berlin (CET)
      
      const d2_16NY = new Date(d2);
      d2_16NY.setHours(22, 0, 0, 0); // 16:00 EST = 22:00 Berlin (CET)

      // Berechne verbleibende Tage mit Dezimalgenauigkeit (keine Rundung)
      const msPerDay = 24 * 60 * 60 * 1000;
      const daysToExp1 = (d1_16NY - now) / msPerDay;
      const daysToExp2 = (d2_16NY - now) / msPerDay;

      if (daysToExp1 <= 0 || daysToExp2 <= 0) {
        setResult({ error: 'Ablaufdatum liegt in der Vergangenheit' });
        return;
      }

      // Zeitberechnung in Jahren - KEINE Rundung!
      const T1 = daysToExp1 / 365;
      const T2 = daysToExp2 / 365;

      const v1 = parseFloat(iv1) / 100;
      const v2 = parseFloat(iv2) / 100;
      const S = parseFloat(spotPrice);
      const K = parseFloat(strikePrice);
      const r = parseFloat(riskFreeRate) / 100;
      const q = parseFloat(dividend) / 100;

      if (v1 <= 0 || v2 <= 0 || S <= 0 || K <= 0) {
        setResult({ error: 'Bitte überprüfe deine Eingaben' });
        return;
      }

      const numerator = (T2 * v2 * v2) - (T1 * v1 * v1);
      const denominator = T2 - T1;
      
      if (numerator < 0) {
        setResult({ error: 'Ungültige IV Kombination - Forward Vol wäre imaginär' });
        return;
      }
      
      const forwardVol = Math.sqrt(numerator / denominator);
      const forwardVolPct = forwardVol * 100;
      const forwardFactor = (v1 / forwardVol) - 1;

      const callT1 = getOptionPrice(S, K, T1, r, v1, q, true);
      const callT2 = getOptionPrice(S, K, T2, r, v2, q, true);
      const callCalendarSpread = callT2 - callT1;

      const putT1 = getOptionPrice(S, K, T1, r, v1, q, false);
      const putT2 = getOptionPrice(S, K, T2, r, v2, q, false);
      const putCalendarSpread = putT2 - putT1;

      // FF = 30%
      const targetForwardFactor30 = 0.30;
      const requiredForwardVol30 = v1 / (1 + targetForwardFactor30);
      const iv2Squared30 = (requiredForwardVol30 * requiredForwardVol30 * (T2 - T1) + T1 * v1 * v1) / T2;
      const requiredIV230 = Math.sqrt(Math.max(0, iv2Squared30));
      
      const callT2At30 = getOptionPrice(S, K, T2, r, requiredIV230, q, true);
      const maxCallCalendarPrice30 = callT2At30 - callT1;
      
      const putT2At30 = getOptionPrice(S, K, T2, r, requiredIV230, q, false);
      const maxPutCalendarPrice30 = putT2At30 - putT1;

      // FF = 0%
      const targetForwardFactor0 = 0;
      const requiredForwardVol0 = v1 / (1 + targetForwardFactor0);
      const iv2Squared0 = (requiredForwardVol0 * requiredForwardVol0 * (T2 - T1) + T1 * v1 * v1) / T2;
      const requiredIV20 = Math.sqrt(Math.max(0, iv2Squared0));
      
      const callT2At0 = getOptionPrice(S, K, T2, r, requiredIV20, q, true);
      const callCalendarSpreadAt0 = callT2At0 - callT1;
      
      const putT2At0 = getOptionPrice(S, K, T2, r, requiredIV20, q, false);
      const putCalendarSpreadAt0 = putT2At0 - putT1;

      const newResult = {
        forwardVolPct: parseFloat(forwardVolPct).toFixed(2),
        forwardFactor: (parseFloat(forwardFactor) * 100).toFixed(2),
        daysToExp1: parseFloat(daysToExp1).toFixed(2),
        daysToExp2: parseFloat(daysToExp2).toFixed(2),
        callT1: parseFloat(callT1).toFixed(2),
        callT2: parseFloat(callT2).toFixed(2),
        callCalendarSpread: parseFloat(callCalendarSpread).toFixed(2),
        putT1: parseFloat(putT1).toFixed(2),
        putT2: parseFloat(putT2).toFixed(2),
        putCalendarSpread: parseFloat(putCalendarSpread).toFixed(2),
        maxCallCalendarPrice30: Math.max(0, parseFloat(maxCallCalendarPrice30)).toFixed(2),
        maxPutCalendarPrice30: Math.max(0, parseFloat(maxPutCalendarPrice30)).toFixed(2),
        callCalendarSpreadAt0: parseFloat(callCalendarSpreadAt0).toFixed(2),
        putCalendarSpreadAt0: parseFloat(putCalendarSpreadAt0).toFixed(2),
        error: null,
        timestamp: new Date().toLocaleString('de-DE')
      };

      setResult(newResult);
      
      const historyEntry = {
        ticker: ticker || 'N/A',
        date: date1,
        ff: parseFloat(newResult.forwardFactor),
        callSpreadCurrent: newResult.callCalendarSpread,
        putSpreadCurrent: newResult.putCalendarSpread,
        callSpreadFF30: newResult.maxCallCalendarPrice30,
        putSpreadFF30: newResult.maxPutCalendarPrice30,
        callSpreadFF0: newResult.callCalendarSpreadAt0,
        putSpreadFF0: newResult.putCalendarSpreadAt0,
        timestamp: newResult.timestamp
      };
      setTradeHistory([historyEntry, ...tradeHistory.slice(0, 9)]);

    } catch (err) {
      setResult({ error: 'Fehler bei der Berechnung: ' + err.message });
    }
  };

  const renderCalendar = (value, onChange, show, setShow) => {
    if (!show) return null;

    const today = new Date();
    let fridays = [];
    let currentDate = new Date(today);
    
    while (fridays.length < 50) {
      if (currentDate.getDay() === 5) {
        fridays.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return (
      <div className={`absolute ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-blue-300'} border-2 rounded-lg p-4 z-50 shadow-lg max-h-96 overflow-y-auto w-64`}>
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-inherit">
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Next 50 Fridays</h3>
          <button onClick={() => setShow(false)} className={`hover:opacity-70 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>✕</button>
        </div>

        <div className="space-y-1">
          {fridays.map(friday => {
            const dateStr = friday.toISOString().split('T')[0];
            const isSelected = dateStr === value;
            const daysAway = Math.floor((friday - today) / (1000 * 60 * 60 * 24));
            
            return (
              <button
                key={dateStr}
                onClick={() => {
                  onChange(dateStr);
                  setShow(false);
                }}
                className={`w-full text-left px-3 py-2 rounded text-sm font-semibold transition-all ${
                  isSelected 
                    ? 'bg-blue-600 text-white' 
                    : darkMode
                    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
                    : 'bg-yellow-100 text-gray-900 hover:bg-yellow-200'
                }`}
              >
                {friday.toLocaleDateString('de-DE')} ({daysAway}d)
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const getFFColor = (ff) => {
    const ffNum = parseFloat(ff);
    if (ffNum >= 30) return 'bg-green-100 border-green-500 text-green-900';
    if (ffNum >= 16) return 'bg-yellow-100 border-yellow-500 text-yellow-900';
    return darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-900';
  };

  const chartData = [
    { dte: 0, iv: (parseFloat(iv1)).toFixed(2) },
    { dte: (parseFloat(result?.daysToExp1) || 7) / 2, iv: (parseFloat(iv1) * 0.7 + parseFloat(iv2) * 0.3).toFixed(2) },
    { dte: parseFloat(result?.daysToExp2) || 14, iv: (parseFloat(iv2)).toFixed(2) }
  ];

  const exportCSV = () => {
    if (!result || result.error) return;
    
    const csv = [
      ['Calendar Spread Trade'],
      ['Datum', new Date().toLocaleString('de-DE')],
      [],
      ['Expiration 1', date1],
      ['Expiration 2', date2],
      ['IV Exp 1', iv1 + '%'],
      ['IV Exp 2', iv2 + '%'],
      ['Aktienkurs', spotPrice],
      ['Strike', strikePrice],
      [],
      ['Forward Volatility', result.forwardVolPct + '%'],
      ['Forward Faktor', result.forwardFactor + '%'],
      ['Call Calendar Spread', result.callCalendarSpread],
      ['Put Calendar Spread', result.putCalendarSpread],
      ['Max Call für FF +30%', result.maxCallCalendarPrice30],
      ['Max Put für FF +30%', result.maxPutCalendarPrice30]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar-trade-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Auto-calculate when parameters change
  useEffect(() => {
    // Only auto-calculate if we have all required values
    if (date1 && date2 && iv1 && iv2 && spotPrice && strikePrice) {
      const timeoutId = setTimeout(() => {
        calculateResults();
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [date1, date2, iv1, iv2, spotPrice, strikePrice, riskFreeRate, dividend, pricingModel]);

  // Check if earnings overlaps with strategy dates
  useEffect(() => {
    if (!nextEarningsDate || !date1 || !date2) {
      setEarningsConflict(null);
      return;
    }

    const earningsDate = new Date(nextEarningsDate);
    const strategyStart = new Date(date1);
    const strategyEnd = new Date(date2);

    // Check if earnings falls within strategy window (inclusive)
    if (earningsDate >= strategyStart && earningsDate <= strategyEnd) {
      const daysUntilEarnings = Math.ceil((earningsDate - new Date()) / (1000 * 60 * 60 * 24));
      setEarningsConflict({
        date: nextEarningsDate,
        timing: earningsTime,
        daysAway: daysUntilEarnings
      });
    } else {
      setEarningsConflict(null);
    }
  }, [nextEarningsDate, earningsTime, date1, date2]);

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100';
  const cardClass = darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgClass} p-6`}>
      <div className="max-w-[1800px] mx-auto">
        <div className={`${cardClass} rounded-lg shadow-lg p-8`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">Calendar Spread Calculator</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-200 text-yellow-800'
                }`}>
                  v1.0 BETA
                </span>
              </div>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Forward Volatility, Forward Factor & Calendar Spread Pricing</p>
            </div>
            <div className="flex gap-3">
              <select
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  darkMode
                    ? 'bg-gray-700 border border-gray-600 text-white'
                    : 'bg-white border border-blue-300 text-gray-900'
                }`}
              >
                <option value="blackscholes">Black-Scholes</option>
                <option value="black76">Black-76</option>
                <option value="binomial">Binomial</option>
              </select>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-800'}`}
              >
                {darkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </div>
          </div>

          {/* User Profile Selector */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-sm opacity-75">User:</span>
              <div className="flex gap-2">
                {['Nils', 'Mr. FF'].map((user) => (
                  <button
                    key={user}
                    onClick={() => {
                      setCurrentUser(user);
                      localStorage.setItem('currentUser', user);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      currentUser === user
                        ? darkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : darkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    {user}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm opacity-50">
              Welcome, {currentUser}!
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-bold mb-4">Parameters</h2>

              <div>
                <label className="block text-sm font-semibold mb-2">Polygon.io API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 focus:border-blue-400'
                      : 'bg-white border-blue-300 focus:border-blue-500'
                  }`}
                  placeholder="Paste your Polygon.io API key"
                />
                <a
                  href="https://polygon.io/dashboard/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline mt-1 block"
                >
                  Get free API key → (End-of-Day data)
                </a>
              </div>


              <div className="relative">
                <label className="block text-sm font-semibold mb-2">Ticker Symbol</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={ticker}
                      onChange={(e) => handleTickerChange(e.target.value)}
                      onFocus={() => {
                        if (ticker.length > 0) {
                          handleTickerChange(ticker);
                        }
                      }}
                      onBlur={() => {
                        // Delay to allow click on dropdown
                        setTimeout(() => setShowTickerDropdown(false), 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setShowTickerDropdown(false);
                          fetchOptionData(ticker);
                        } else if (e.key === 'Escape') {
                          setShowTickerDropdown(false);
                        } else if (e.key === 'ArrowDown') {
                          if (ticker.length > 0) {
                            handleTickerChange(ticker);
                          }
                        }
                      }}
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 focus:border-blue-400'
                          : 'bg-white border-blue-300 focus:border-blue-500'
                      }`}
                      placeholder="e.g. AAPL, SPY, TSLA..."
                      disabled={loading}
                    />
                    {showTickerDropdown && filteredTickers.length > 0 && (
                      <div className={`absolute z-50 w-full mt-1 max-h-64 overflow-y-auto rounded-lg shadow-lg border-2 ${
                        darkMode
                          ? 'bg-gray-800 border-gray-600'
                          : 'bg-white border-gray-300'
                      }`}>
                        {filteredTickers.map((stock) => (
                          <button
                            key={stock.symbol}
                            onClick={() => selectTicker(stock.symbol)}
                            className={`w-full text-left px-4 py-2 hover:bg-opacity-80 transition-colors ${
                              darkMode
                                ? 'hover:bg-gray-700 text-white'
                                : 'hover:bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="font-bold">{stock.symbol}</div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {stock.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fetchOptionData(ticker)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : darkMode
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    {loading ? '...' : 'Load'}
                  </button>
                </div>
                {loadError && (
                  <p className="text-red-500 text-xs mt-1">{loadError}</p>
                )}
                {loading && (
                  <p className={`text-xs mt-1 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Loading stock data...
                  </p>
                )}
                
                {/* Recent Tickers */}
                {recentTickers.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs opacity-75 mb-1">Recent:</p>
                    <div className="flex flex-wrap gap-1">
                      {recentTickers.map((recentTicker) => (
                        <button
                          key={recentTicker}
                          onClick={() => {
                            setTicker(recentTicker);
                            fetchOptionData(recentTicker);
                          }}
                          className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                            darkMode
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                        >
                          {recentTicker}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={loadDemoData}
                  className={`w-full mt-2 px-4 py-2 rounded-lg font-semibold text-xs ${
                    darkMode
                      ? 'bg-green-700 hover:bg-green-800 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  Load Demo Data (SPY)
                </button>

                {/* Market Info Display */}
                {(marketCap !== null || avgOptionsVolume !== null || nextEarningsDate !== null) && (
                  <div className={`mt-3 p-3 rounded-lg border-2 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <p className="text-xs font-semibold mb-2">Market Info</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {marketCap !== null && (
                        <div>
                          <p className="opacity-75">Market Cap</p>
                          <p className="font-bold">
                            ${(marketCap / 1e9).toFixed(2)}B
                          </p>
                        </div>
                      )}
                      {avgOptionsVolume !== null && (
                        <div>
                          <p className="opacity-75">Total Opt Vol (20d)</p>
                          <p className="font-bold">
                            {avgOptionsVolume.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    {nextEarningsDate !== null && (
                      <div className={`mt-2 p-2 rounded border ${
                        darkMode
                          ? 'bg-yellow-900 border-yellow-600'
                          : 'bg-yellow-100 border-yellow-400'
                      }`}>
                        <p className="text-xs font-semibold mb-1">📊 Next Earnings</p>
                        <p className="font-bold">
                          {new Date(nextEarningsDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        {earningsTime && (
                          <p className="text-xs opacity-75 mt-1">
                            {earningsTime}
                          </p>
                        )}
                        {(() => {
                          const daysAway = Math.floor((new Date(nextEarningsDate) - new Date()) / (1000 * 60 * 60 * 24));
                          return (
                            <p className="text-xs opacity-75 mt-1">
                              {daysAway > 0 
                                ? `${daysAway} days away` 
                                : daysAway === 0 
                                  ? 'Today!' 
                                  : `${Math.abs(daysAway)} days ago`}
                            </p>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Earnings Overlap Warning */}
                {earningsConflict && (
                  <div className={`mt-3 p-3 rounded-lg border-2 ${
                    darkMode
                      ? 'bg-red-900 border-red-600'
                      : 'bg-red-50 border-red-400'
                  }`}>
                    <p className="text-xs font-semibold mb-1">⚠️ Earnings During Strategy</p>
                    <p className="text-xs">
                      Earnings on <span className="font-bold">{new Date(earningsConflict.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span> falls within your selected dates.
                    </p>
                    {earningsConflict.timing && (
                      <p className="text-xs opacity-75 mt-1">
                        {earningsConflict.timing}
                      </p>
                    )}
                    <p className="text-xs opacity-75 mt-1">
                      {earningsConflict.daysAway > 0 
                        ? `${earningsConflict.daysAway} days away` 
                        : earningsConflict.daysAway === 0 
                          ? 'Today!' 
                          : `${Math.abs(earningsConflict.daysAway)} days ago`}
                    </p>
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold mb-2">Expiration 1</label>
                <select
                  value={date1}
                  onChange={(e) => {
                    setDate1(e.target.value);
                    updateIVForDate(e.target.value, true);
                  }}
                  className={`w-full px-4 py-2 border-2 rounded-lg ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-blue-300 text-gray-900'
                  }`}
                >
                  {availableExpirations.length > 0 ? (
                    availableExpirations.map(date => {
                      const dte = calculateDTE(date);
                      return (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} ({dte} DTE)
                        </option>
                      );
                    })
                  ) : (
                    <option value={date1}>{new Date(date1).toLocaleDateString('en-US')}</option>
                  )}
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold mb-2">Expiration 2</label>
                <select
                  value={date2}
                  onChange={(e) => {
                    setDate2(e.target.value);
                    updateIVForDate(e.target.value, false);
                  }}
                  className={`w-full px-4 py-2 border-2 rounded-lg ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-blue-300 text-gray-900'
                  }`}
                >
                  {availableExpirations.length > 0 ? (
                    availableExpirations.map(date => {
                      const dte = calculateDTE(date);
                      return (
                        <option key={date} value={date}>
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} ({dte} DTE)
                        </option>
                      );
                    })
                  ) : (
                    <option value={date2}>{new Date(date2).toLocaleDateString('en-US')}</option>
                  )}
                </select>
              </div>

              {[
                { label: 'IV Exp 1 (%)', value: iv1, setter: setIv1 },
                { label: 'IV Exp 2 (%)', value: iv2, setter: setIv2 },
                { label: 'Stock Price', value: spotPrice, setter: setSpotPrice },
                { label: 'Strike', value: strikePrice, setter: setStrikePrice },
                { label: 'Risk-Free Rate (%)', value: riskFreeRate, setter: setRiskFreeRate },
                { label: 'Dividend (%)', value: dividend, setter: setDividend }
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-semibold mb-2">{field.label}</label>
                  <input
                    type="number"
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 focus:border-blue-400'
                        : 'bg-white border-blue-300 focus:border-blue-500'
                    }`}
                    step="0.01"
                  />
                </div>
              ))}

              <button
                onClick={calculateResults}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
              >
                Calculate
              </button>
            </div>

            <div className="lg:col-span-5 space-y-4">
              {result && !result.error && (
                <div className={`sticky top-0 z-40 px-4 py-2 rounded-lg shadow-md flex items-center justify-between ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-4">
                    {ticker && (
                      <div className="flex items-center gap-2">
                        <img
                          src={`https://img.logokit.com/ticker/${ticker}?token=pk_fr93b6bfb5c425f6e3db62&format=png`}
                          alt={ticker}
                          className="w-8 h-8 rounded-lg object-contain"
                          onError={(e) => {
                            // Fallback to colored circle with letter if logo fails
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div className={`w-8 h-8 rounded-full hidden items-center justify-center font-bold text-white ${
                          ticker[0] <= 'F' ? 'bg-blue-500' :
                          ticker[0] <= 'L' ? 'bg-purple-500' :
                          ticker[0] <= 'R' ? 'bg-green-500' :
                          ticker[0] <= 'W' ? 'bg-orange-500' : 'bg-red-500'
                        }`}>
                          {ticker[0]}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold">{ticker}</span>
                            {spotPrice && (
                              <span className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                ${parseFloat(spotPrice).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] opacity-50">Data delayed 15 min</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-xs opacity-75">Forward Vol:</span>
                      <span className="ml-2 text-lg font-bold text-green-600">{result.forwardVolPct}%</span>
                    </div>
                    <div className={`px-3 py-1 rounded ${
                      parseFloat(result.forwardFactor) >= 30
                        ? 'bg-green-100 text-green-900'
                        : parseFloat(result.forwardFactor) >= 16
                        ? 'bg-yellow-100 text-yellow-900'
                        : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-900'
                    }`}>
                      <span className="text-xs opacity-75">FF:</span>
                      <span className="ml-2 text-xl font-bold">{result.forwardFactor}%</span>
                    </div>
                  </div>
                  <div className="text-xs opacity-75">
                    {result.daysToExp1}-{result.daysToExp2} DTE
                  </div>
                </div>
              )}

              {/* Recommended Calendar Spreads */}
              {(scanningForSpreads || recommendedSpreads.length > 0) && (
                <div className={`border-2 ${borderClass} p-4 rounded-lg ${
                  darkMode ? 'bg-purple-900' : 'bg-purple-50'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-semibold text-lg">
                      📊 Recommended Calendar Spreads
                      {ticker && ` for ${ticker}`}
                    </p>
                    {scanningForSpreads && (
                      <span className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        Scanning...
                      </span>
                    )}
                  </div>

                  {/* Filter Toggle */}
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-opacity-30" style={{ borderColor: darkMode ? '#ffffff40' : '#00000020' }}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hidePostEarningsSpreads}
                        onChange={(e) => {
                          setHidePostEarningsSpreads(e.target.checked);
                          // Re-trigger scan with new filter
                          setTimeout(() => scanCalendarSpreads(), 100);
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">
                        Hide post-earnings front expirations
                      </span>
                    </label>
                    <span className="text-xs opacity-50" title="For pure forward volatility plays, avoid spreads where the front leg expires after earnings">
                      ℹ️
                    </span>
                  </div>

                  {scanningForSpreads ? (
                    <p className="text-sm opacity-75">Analyzing expiration combinations...</p>
                  ) : recommendedSpreads.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {recommendedSpreads.map((spread, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setDate1(spread.date1);
                            setDate2(spread.date2);
                            setIv1(spread.iv1);
                            setIv2(spread.iv2);
                            setStrikePrice(spread.strike.toString());
                          }}
                          className={`w-full text-left p-3 rounded transition-all hover:scale-[1.02] ${
                            parseFloat(spread.ff) >= 30
                              ? darkMode ? 'bg-green-900 hover:bg-green-800' : 'bg-green-100 hover:bg-green-200'
                              : parseFloat(spread.ff) >= 16
                              ? darkMode ? 'bg-yellow-900 hover:bg-yellow-800' : 'bg-yellow-100 hover:bg-yellow-200'
                              : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-bold text-lg">#{idx + 1}</span>
                              <span className="ml-3 font-semibold">
                                {new Date(spread.date1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(spread.date2).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="ml-2 text-xs opacity-75">
                                ({spread.dte1} → {spread.dte2} DTE)
                              </span>
                              {spread.isPostEarnings && (
                                <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold rounded bg-orange-500 text-white" title="Front expiration is after earnings">
                                  POST-📊
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">
                                FF: {spread.ff.toFixed(2)}%
                              </div>
                              <div className="text-xs opacity-75">
                                Call Spread: ${spread.callSpread}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addSpreadToWatchlist(spread);
                                }}
                                className="mt-2 px-2 py-1 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                title="Add to Watchlist"
                              >
                                + Watch
                              </button>
                            </div>
                          </div>
                          <div className="text-xs mt-2 opacity-75 flex gap-4">
                            <span>IV: {spread.iv1}% → {spread.iv2}%</span>
                            <span>Strike: ${spread.strike}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm opacity-75">No spreads found</p>
                  )}

                  <button
                    onClick={scanCalendarSpreads}
                    disabled={scanningForSpreads || !ticker || !apiKey}
                    className={`w-full mt-3 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      scanningForSpreads || !ticker || !apiKey
                        ? 'bg-gray-400 cursor-not-allowed'
                        : darkMode
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    {scanningForSpreads ? 'Scanning...' : 'Rescan for Best Spreads'}
                  </button>
                </div>
              )}

              {/* Market-Wide FF Scanner */}
              <div className={`border-2 ${borderClass} p-4 rounded-lg ${
                darkMode ? 'bg-indigo-900' : 'bg-indigo-50'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <p className="font-semibold text-lg">
                    🔍 Market Scanner: Top FF Opportunities
                  </p>
                  <button
                    onClick={fetchMarketScan}
                    disabled={loadingMarketScan}
                    className={`text-xs px-3 py-1 rounded transition-all ${
                      loadingMarketScan
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                    }`}
                  >
                    {loadingMarketScan ? 'Scanning...' : 'Start Market Scan'}
                  </button>
                </div>
                
                {lastMarketScan && (
                  <p className="text-xs opacity-75 mb-3">
                    Last scan: {new Date(lastMarketScan).toLocaleString()}
                  </p>
                )}
                
                {loadingMarketScan && (
                  <div className="text-center py-4">
                    <p className="text-sm opacity-75">Scanning market for best FF opportunities...</p>
                    <p className="text-xs opacity-50 mt-1">This may take 2-5 minutes</p>
                  </div>
                )}
                
                {!loadingMarketScan && marketScanResults.length > 0 && (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {marketScanResults.slice(0, 20).map((stock, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTicker(stock.symbol);
                          fetchOptionData(stock.symbol);
                        }}
                        className={`w-full text-left p-3 rounded transition-all hover:scale-[1.01] ${
                          parseFloat(stock.bestFF) >= 30
                            ? darkMode ? 'bg-green-900 hover:bg-green-800' : 'bg-green-100 hover:bg-green-200'
                            : parseFloat(stock.bestFF) >= 20
                            ? darkMode ? 'bg-yellow-900 hover:bg-yellow-800' : 'bg-yellow-100 hover:bg-yellow-200'
                            : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold">#{idx + 1} {stock.symbol}</span>
                            <span className="ml-2 text-xs opacity-75">{stock.name}</span>
                            {stock.hasEarnings && (
                              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-yellow-500 text-black" title="Has upcoming earnings">
                                📊
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">FF: {stock.bestFF}%</div>
                            <div className="text-xs opacity-75">${stock.price?.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="text-xs mt-1 opacity-75 flex gap-3">
                          <span>MC: ${(stock.marketCap / 1e9).toFixed(1)}B</span>
                          {stock.spread && (
                            <span>{stock.spread.exp1} → {stock.spread.exp2}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {!loadingMarketScan && marketScanResults.length === 0 && lastMarketScan && (
                  <p className="text-sm opacity-75 text-center py-4">
                    No opportunities found. Try running a market scan.
                  </p>
                )}
              </div>

              {result && (
                <>
                  {result.error ? (
                    <div className={`border-2 border-red-500 p-6 rounded-lg ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-50 text-red-900'}`}>
                      <p className="font-semibold">{result.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className={`border-2 border-green-500 p-4 rounded-lg ${darkMode ? 'bg-green-900 text-green-100' : 'bg-green-50 text-green-900'}`}>
                          <p className="text-xs mb-1 opacity-75">Forward Volatility</p>
                          <p className="text-3xl font-bold">{result.forwardVolPct}%</p>
                          <p className="text-xs mt-2 opacity-75">{result.daysToExp1}-{result.daysToExp2} DTE</p>
                        </div>

                        <div className={`border-4 p-4 rounded-lg ${getFFColor(result.forwardFactor)}`}>
                          <p className="text-xs mb-1 opacity-75">Forward Faktor</p>
                          <p className="text-3xl font-bold">{result.forwardFactor}%</p>
                          <p className="text-xs mt-2 opacity-75">
                            {parseFloat(result.forwardFactor) >= 30 ? '✓ Excellent' : parseFloat(result.forwardFactor) >= 16 ? '✓ Good' : 'Below threshold'}
                          </p>
                        </div>
                      </div>

                      {/* Große Box mit Preisen */}
                      <div className={`border-4 border-red-600 p-6 rounded-lg ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-50 text-red-900'}`}>
                        <p className="text-lg font-bold mb-4">TARGET PRICE FOR FF 30%</p>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="border-2 border-red-400 p-4 rounded">
                            <p className="text-sm font-semibold mb-2">CALL SPREAD</p>
                            <div className="text-center">
                              <p className="text-5xl font-bold text-red-600">${result.maxCallCalendarPrice30}</p>
                              <p className="text-xs opacity-75 mt-2">Max Entry Price</p>
                            </div>
                          </div>

                          <div className="border-2 border-red-400 p-4 rounded">
                            <p className="text-sm font-semibold mb-2">PUT SPREAD</p>
                            <div className="text-center">
                              <p className="text-5xl font-bold text-red-600">${result.maxPutCalendarPrice30}</p>
                              <p className="text-xs opacity-75 mt-2">Max Entry Price</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Große Box mit aktuellen Preisen */}
                      <div className={`border-4 border-blue-600 p-6 rounded-lg ${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-50 text-blue-900'}`}>
                        <p className="text-lg font-bold mb-4">CURRENT CALENDAR SPREADS</p>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="border-2 border-blue-400 p-4 rounded">
                            <p className="text-sm font-semibold mb-2">CALL SPREAD</p>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Current Price:</span>
                                <span className="font-bold text-2xl text-blue-600">${result.callCalendarSpread}</span>
                              </div>
                              <div className="flex justify-between text-xs opacity-75">
                                <span>For FF 0%:</span>
                                <span className="font-semibold">${result.callCalendarSpreadAt0}</span>
                              </div>
                            </div>
                          </div>

                          <div className="border-2 border-pink-400 p-4 rounded">
                            <p className="text-sm font-semibold mb-2">PUT SPREAD</p>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Current Price:</span>
                                <span className="font-bold text-2xl text-pink-600">${result.putCalendarSpread}</span>
                              </div>
                              <div className="flex justify-between text-xs opacity-75">
                                <span>For FF 0%:</span>
                                <span className="font-semibold">${result.putCalendarSpreadAt0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className={`border-2 border-blue-500 p-4 rounded-lg ${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-50 text-blue-900'}`}>
                          <p className="font-semibold mb-3">Call Calendar Spread</p>
                          <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                            <div>
                              <p className="text-xs opacity-75">Front (T1)</p>
                              <p className="font-bold">${result.callT1}</p>
                              {volumeCallT1 !== null && (
                                <p className="text-xs opacity-60">Vol: {volumeCallT1.toLocaleString()}</p>
                              )}
                              {oiCallT1 !== null && (
                                <p className="text-xs opacity-60">OI: {oiCallT1.toLocaleString()}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs opacity-75">Back (T2)</p>
                              <p className="font-bold">${result.callT2}</p>
                              {volumeCallT2 !== null && (
                                <p className="text-xs opacity-60">Vol: {volumeCallT2.toLocaleString()}</p>
                              )}
                              {oiCallT2 !== null && (
                                <p className="text-xs opacity-60">OI: {oiCallT2.toLocaleString()}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs opacity-75">Spread</p>
                              <p className="font-bold text-lg">${result.callCalendarSpread}</p>
                            </div>
                          </div>
                          <div className={`p-2 rounded text-xs opacity-75 mb-3`}>Max für FF +30%: <span className="font-bold">${result.maxCallCalendarPrice30}</span></div>
                          
                          <div className="space-y-2">
                            <p className="text-xs font-semibold">Preis-Simulator</p>
                            <input
                              type="range"
                              min="0"
                              max={parseFloat(result.callCalendarSpread) * 4}
                              step="0.01"
                              defaultValue={result.callCalendarSpread}
                              onChange={(e) => handlePriceSlider(parseFloat(e.target.value), true)}
                              className="w-full h-2 bg-blue-300 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs">
                              <span>${(parseFloat(result.maxCallCalendarPrice30)).toFixed(2)} (FF 30%)</span>
                              <span className="font-bold">${callPriceSlider !== null ? callPriceSlider.toFixed(2) : result.callCalendarSpread}</span>
                              <span>${(parseFloat(result.callCalendarSpread) * 4).toFixed(2)} (max)</span>
                            </div>
                            {callPriceSlider !== null && adjustedFFCall !== null && (
                              <div className={`p-2 rounded text-center text-sm font-bold border-2 ${
                                adjustedFFCall >= 30 ? 'border-green-500 bg-green-200' : 
                                adjustedFFCall >= 16 ? 'border-yellow-500 bg-yellow-200' : 
                                'border-gray-400 bg-gray-200'
                              }`}>
                                Angepasster FF: {adjustedFFCall.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={`border-2 border-pink-500 p-4 rounded-lg ${darkMode ? 'bg-pink-900 text-pink-100' : 'bg-pink-50 text-pink-900'}`}>
                          <p className="font-semibold mb-3">Put Calendar Spread</p>
                          <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                            <div>
                              <p className="text-xs opacity-75">Front (T1)</p>
                              <p className="font-bold">${result.putT1}</p>
                            </div>
                            <div>
                              <p className="text-xs opacity-75">Back (T2)</p>
                              <p className="font-bold">${result.putT2}</p>
                            </div>
                            <div>
                              <p className="text-xs opacity-75">Spread</p>
                              <p className="font-bold text-lg">${result.putCalendarSpread}</p>
                            </div>
                          </div>
                          <div className={`p-2 rounded text-xs opacity-75 mb-3`}>Max für FF +30%: <span className="font-bold">${result.maxPutCalendarPrice30}</span></div>
                          
                          <div className="space-y-2">
                            <p className="text-xs font-semibold">Preis-Simulator</p>
                            <input
                              type="range"
                              min="0"
                              max={parseFloat(result.putCalendarSpread) * 4}
                              step="0.01"
                              defaultValue={result.putCalendarSpread}
                              onChange={(e) => handlePriceSlider(parseFloat(e.target.value), false)}
                              className="w-full h-2 bg-pink-300 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs">
                              <span>${(parseFloat(result.maxPutCalendarPrice30)).toFixed(2)} (FF 30%)</span>
                              <span className="font-bold">${putPriceSlider !== null ? putPriceSlider.toFixed(2) : result.putCalendarSpread}</span>
                              <span>${(parseFloat(result.putCalendarSpread) * 4).toFixed(2)} (max)</span>
                            </div>
                            {putPriceSlider !== null && adjustedFFPut !== null && (
                              <div className={`p-2 rounded text-center text-sm font-bold border-2 ${
                                adjustedFFPut >= 30 ? 'border-green-500 bg-green-200' : 
                                adjustedFFPut >= 16 ? 'border-yellow-500 bg-yellow-200' : 
                                'border-gray-400 bg-gray-200'
                              }`}>
                                Angepasster FF: {adjustedFFPut.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={exportCSV}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2"
                      >
                        <Download size={20} /> Ergebnis als CSV exportieren
                      </button>

                      {tradeHistory.length > 0 && (
                        <div className={`border-2 ${borderClass} p-4 rounded-lg`}>
                          <p className="font-semibold mb-3">Trade History (letzte 10)</p>
                          <div className="text-sm space-y-2 max-h-96 overflow-y-auto">
                            {tradeHistory.map((trade, idx) => (
                              <div key={idx} className={`p-3 rounded ${
                                parseFloat(trade.ff) >= 30
                                  ? darkMode ? 'bg-green-900' : 'bg-green-100'
                                  : parseFloat(trade.ff) >= 16
                                  ? darkMode ? 'bg-yellow-900' : 'bg-yellow-100'
                                  : darkMode ? 'bg-gray-700' : 'bg-gray-100'
                              }`}>
                                <div className="flex items-center gap-2 font-semibold mb-2">
                                  {trade.ticker && trade.ticker !== 'N/A' && (
                                    <>
                                      <img
                                        src={`https://img.logokit.com/ticker/${trade.ticker}?token=pk_fr93b6bfb5c425f6e3db62&format=png`}
                                        alt={trade.ticker}
                                        className="w-6 h-6 rounded object-contain"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                          e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                      />
                                      <div className={`w-6 h-6 rounded-full hidden items-center justify-center text-xs font-bold text-white ${
                                        trade.ticker[0] <= 'F' ? 'bg-blue-500' :
                                        trade.ticker[0] <= 'L' ? 'bg-purple-500' :
                                        trade.ticker[0] <= 'R' ? 'bg-green-500' :
                                        trade.ticker[0] <= 'W' ? 'bg-orange-500' : 'bg-red-500'
                                      }`}>
                                        {trade.ticker[0]}
                                      </div>
                                    </>
                                  )}
                                  <span>{trade.ticker} - {trade.date} | FF: {trade.ff.toFixed(2)}%</span>
                                </div>
                                <div className="text-xs mt-1 space-y-1">
                                  <div>Aktuell: Call ${parseFloat(trade.callSpreadCurrent).toFixed(4)} | Put ${parseFloat(trade.putSpreadCurrent).toFixed(4)}</div>
                                  <div>@ FF 30%: Call ${parseFloat(trade.callSpreadFF30).toFixed(4)} | Put ${parseFloat(trade.putSpreadFF30).toFixed(4)}</div>
                                  <div>@ FF 0%: Call ${parseFloat(trade.callSpreadFF0).toFixed(4)} | Put ${parseFloat(trade.putSpreadFF0).toFixed(4)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Watchlist Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-bold mb-4">Watchlist</h2>
              
              {watchlist.length === 0 ? (
                <div className={`p-4 rounded-lg border-2 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className="text-sm opacity-75 text-center">
                    Scan tickers to build your watchlist
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {watchlist.map((item, idx) => (
                    <div
                      key={idx}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:scale-[1.02] ${
                        item.type === 'spread'
                          ? darkMode
                            ? 'bg-purple-800 border-purple-600'
                            : 'bg-purple-50 border-purple-200'
                          : ticker === item.symbol
                          ? darkMode
                            ? 'bg-blue-900 border-blue-500'
                            : 'bg-blue-50 border-blue-500'
                          : darkMode
                            ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {item.type === 'spread' ? (
                        // Calendar Spread Watchlist Item
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold bg-purple-500 text-white px-2 py-0.5 rounded">
                              SPREAD
                            </span>
                            <span className="font-bold">{item.symbol}</span>
                          </div>
                          
                          <div className="text-sm mb-2">
                            {new Date(item.date1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(item.date2).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs opacity-75">FF</div>
                              <div className={`text-lg font-bold ${
                                parseFloat(item.ff) >= 30
                                  ? 'text-green-500'
                                  : parseFloat(item.ff) >= 16
                                  ? 'text-yellow-500'
                                  : 'text-gray-500'
                              }`}>
                                {item.ff}%
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs opacity-75">Strike</div>
                              <div className="text-sm font-bold">${item.strike}</div>
                            </div>
                          </div>
                          
                          <div className="text-xs mt-2 opacity-75 flex gap-2">
                            <span>IV: {item.iv1}% → {item.iv2}%</span>
                            <span>DTE: {item.dte1} → {item.dte2}</span>
                          </div>
                        </div>
                      ) : (
                        // Stock Watchlist Item
                        <button
                          onClick={() => {
                            setTicker(item.symbol);
                            fetchOptionData(item.symbol);
                          }}
                          className="w-full text-left"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={`https://img.logokit.com/ticker/${item.symbol}?token=pk_fr93b6bfb5c425f6e3db62&format=png`}
                              alt={item.symbol}
                              className="w-6 h-6 rounded object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <span className="font-bold">{item.symbol}</span>
                            {item.hasEarnings && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-yellow-500 text-black" title="Has upcoming earnings">
                                📊
                              </span>
                            )}
                          </div>
                          
                          {item.price && (
                            <div className="text-sm mb-1">
                              ${parseFloat(item.price).toFixed(2)}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs opacity-75">Best FF</div>
                              <div className={`text-lg font-bold ${
                                parseFloat(item.bestFF) >= 30
                                  ? 'text-green-500'
                                  : parseFloat(item.bestFF) >= 16
                                  ? 'text-yellow-500'
                                  : 'text-gray-500'
                              }`}>
                                {item.bestFF}%
                              </div>
                            </div>
                            
                            {item.hasEarnings && item.earningsDate && (
                              <div className="text-right">
                                <div className="text-xs opacity-75">Earnings</div>
                                <div className="text-xs font-semibold">
                                  {new Date(item.earningsDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      )}
                      
                      <div className="text-[10px] opacity-50 mt-2">
                        {new Date(item.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {watchlist.length > 0 && (
                <button
                  onClick={() => {
                    setWatchlist([]);
                    localStorage.removeItem('watchlist');
                  }}
                  className={`w-full px-3 py-2 text-xs rounded transition-all ${
                    darkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Clear Watchlist
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Changelog */}
      <div className="mt-12 max-w-[1800px] mx-auto px-6">
        <div className={`${cardClass} rounded-lg shadow-lg p-6`}>
          <h2 className="text-2xl font-bold mb-4">📝 Changelog</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-blue-600">Latest Updates</h3>
              <ul className="text-sm mt-2 space-y-1">
                <li>• <strong>Enhanced Watchlist:</strong> Now supports both stocks and calendar spreads</li>
                <li>• <strong>User Profiles:</strong> Separate watchlists for Nils and Mr. FF</li>
                <li>• <strong>Market Scanner:</strong> On-demand scan for best FF opportunities (≥$500M market cap)</li>
                <li>• <strong>Total Options Volume:</strong> Now shows complete options volume (puts + calls, all strikes)</li>
                <li>• <strong>Post-Earnings Filter:</strong> Hide spreads with front expiration after earnings</li>
                <li>• <strong>Wider Layout:</strong> Optimized for larger screens (1800px max-width)</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-green-600">Previous Features</h3>
              <ul className="text-sm mt-2 space-y-1">
                <li>• <strong>Forward Volatility Calculator:</strong> Black-Scholes based FF calculations</li>
                <li>• <strong>Earnings Integration:</strong> Finnhub API for upcoming earnings dates</li>
                <li>• <strong>Calendar Spread Scanner:</strong> Automated spread recommendations</li>
                <li>• <strong>Real-time Data:</strong> Polygon.io integration for live options data</li>
                <li>• <strong>Dark Mode:</strong> Toggle between light and dark themes</li>
                <li>• <strong>Recent Tickers:</strong> Quick access to recently viewed stocks</li>
              </ul>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold text-purple-600">Technical Details</h3>
              <ul className="text-sm mt-2 space-y-1">
                <li>• <strong>Built with:</strong> React, Tailwind CSS, Vercel Serverless Functions</li>
                <li>• <strong>Data Sources:</strong> Polygon.io (options), Finnhub (earnings), Yahoo Finance (prices)</li>
                <li>• <strong>Storage:</strong> LocalStorage for user preferences and watchlists</li>
                <li>• <strong>Performance:</strong> 4-hour caching for market scans, non-blocking UI</li>
                <li>• <strong>Forward Volatility:</strong> Based on SSRN research paper methodology</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Analytics />
    </div>
  );
}
