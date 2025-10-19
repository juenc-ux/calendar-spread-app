import React, { useState } from 'react';
import { Info, Calendar, Download, Moon, Sun } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [showTickerDropdown, setShowTickerDropdown] = useState(false);
  const [filteredTickers, setFilteredTickers] = useState([]);

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

      // 2. Calculate next two Fridays for expirations
      const fridays = [];
      let currentDate = new Date(today);

      while (fridays.length < 2) {
        if (currentDate.getDay() === 5 && currentDate > today) {
          fridays.push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setDate1(fridays[0].toISOString().split('T')[0]);
      setDate2(fridays[1].toISOString().split('T')[0]);

      // 3. Set ATM strike (rounded to nearest $5)
      const roundedStrike = Math.round(currentPrice / 5) * 5;
      setStrikePrice(roundedStrike.toFixed(2));

      // 4. Try to get options data (if available in your plan)
      // Free tier doesn't have options, but we'll try anyway
      try {
        const optionsUrl = `https://api.polygon.io/v3/snapshot/options/${symbol}?apiKey=${apiKey}`;
        console.log('Trying to fetch options data...');

        const optionsResponse = await fetch(optionsUrl);

        if (optionsResponse.ok) {
          const optionsData = await optionsResponse.json();
          console.log('Options data:', optionsData);

          if (optionsData.results && optionsData.results.length > 0) {
            // Find ATM options if available
            const atmOptions = optionsData.results.filter(opt =>
              Math.abs(opt.details.strike_price - currentPrice) < 10
            );

            if (atmOptions.length > 0 && atmOptions[0].implied_volatility) {
              setIv1((atmOptions[0].implied_volatility * 100).toFixed(2));
              setIv2(((atmOptions[0].implied_volatility * 0.95) * 100).toFixed(2));
              console.log('✅ Got IV from Polygon options data!');
            } else {
              throw new Error('No IV in response');
            }
          } else {
            throw new Error('No options results');
          }
        } else {
          throw new Error('Options endpoint not available');
        }
      } catch (optError) {
        console.log('Options data not available (expected with free tier), using defaults');
        // Use reasonable defaults based on historical volatility
        setIv1('30');
        setIv2('28');
      }

      setLoading(false);
      setLoadError(null);

      console.log('✅ Stock price loaded! IV values are estimates (upgrade for real IV data)');

      // Auto-calculate after loading data
      setTimeout(() => calculateResults(), 100);

    } catch (error) {
      console.error('Error fetching option data:', error);
      setLoadError(error.message || 'Failed to load option data');
      setLoading(false);
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
      <div
        className={`absolute z-50 mt-3 w-72 overflow-hidden rounded-2xl border px-0 pb-3 backdrop-blur-2xl shadow-[0_30px_80px_-25px_rgba(15,23,42,0.6)] ${darkMode ? 'border-slate-700 bg-slate-900/95 text-slate-100' : 'border-white/70 bg-white/95 text-slate-900'}`}
      >
        <div className="sticky top-0 flex items-center justify-between bg-inherit px-4 py-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide">Next 50 Fridays</h3>
          <button
            onClick={() => setShow(false)}
            className={`text-xs font-semibold transition ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
          >
            ✕
          </button>
        </div>
        <div className="space-y-1 px-3">
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
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold transition ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg'
                    : darkMode
                    ? 'bg-slate-900/70 text-slate-100 hover:bg-slate-800/80'
                    : 'bg-white/80 text-slate-900 hover:bg-slate-100'
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
    if (ffNum >= 30) {
      return darkMode
        ? 'border border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
        : 'border border-emerald-300 bg-emerald-100 text-emerald-800';
    }
    if (ffNum >= 16) {
      return darkMode
        ? 'border border-amber-400/50 bg-amber-500/15 text-amber-200'
        : 'border border-amber-300 bg-amber-100 text-amber-800';
    }
    return darkMode
      ? 'border border-slate-600/70 bg-slate-900/70 text-slate-200'
      : 'border border-slate-200 bg-slate-50 text-slate-900';
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

  const backgroundClass = darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const heroCardClass = darkMode
    ? 'bg-slate-900/80 border border-slate-700 text-slate-100 backdrop-blur-xl shadow-[0_30px_60px_-20px_rgba(15,23,42,0.9)]'
    : 'bg-white/80 border border-white/60 text-slate-900 backdrop-blur-3xl shadow-[0_30px_60px_-18px_rgba(30,64,175,0.35)]';
  const panelClass = darkMode
    ? 'bg-slate-900/70 border border-slate-700 text-slate-100 backdrop-blur-xl shadow-[0_24px_60px_-30px_rgba(15,23,42,0.85)]'
    : 'bg-white/70 border border-white/60 text-slate-900 backdrop-blur-2xl shadow-[0_30px_70px_-35px_rgba(30,64,175,0.35)]';
  const softCardClass = darkMode
    ? 'bg-slate-900/60 text-slate-100 backdrop-blur-xl shadow-[0_18px_50px_-25px_rgba(15,23,42,0.65)]'
    : 'bg-white/70 text-slate-900 backdrop-blur-xl shadow-[0_25px_60px_-30px_rgba(30,64,175,0.25)]';
  const subtleTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const baseInputClass = `w-full px-4 py-3 rounded-2xl border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400/40 ${darkMode ? 'bg-slate-900/70 border-slate-700 text-slate-100 focus:border-sky-400' : 'bg-white/80 border-white/60 text-slate-900 focus:border-sky-500'}`;
  const primaryButtonClass = 'w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 text-white font-semibold py-3 rounded-2xl shadow-lg shadow-sky-500/30 hover:shadow-sky-500/40 transition-all duration-300 transform hover:-translate-y-0.5';
  const pricingModelLabel = {
    blackscholes: 'Black-Scholes',
    black76: 'Black-76',
    binomial: 'Binomial'
  }[pricingModel] || pricingModel;

  return (
    <div className={`relative min-h-screen overflow-hidden ${backgroundClass} transition-colors duration-500`}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-24 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-sky-500/30 via-indigo-500/20 to-transparent blur-3xl" />
        <div className="absolute top-1/3 right-0 h-[30rem] w-[30rem] translate-x-1/2 rounded-full bg-gradient-to-bl from-purple-500/30 via-sky-500/20 to-transparent blur-3xl" />
        <div className="absolute bottom-[-18rem] left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.28),transparent_65%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className={`${heroCardClass} rounded-3xl p-8 lg:p-12`}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 self-start rounded-full bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-400">
                Pro Trading Toolkit
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">Calendar Spread Intelligence Hub</h1>
                <p className={`max-w-2xl text-base lg:text-lg ${subtleTextClass}`}>
                  Modellieren Sie Forward-Volatilitäten, entdecken Sie optimale Einstiegspreise und stressen Sie Ihre Kalender mit einem futuristischen Interface, das für Geschwindigkeit &amp; Präzision gebaut wurde.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className={`${softCardClass} rounded-2xl border border-sky-400/25 p-4`}>
                  <p className="text-xs uppercase tracking-wide text-sky-400">Forward Vol</p>
                  <p className="mt-2 text-2xl font-semibold">{result?.forwardVolPct ? `${result.forwardVolPct}%` : '—'}</p>
                </div>
                <div className={`${softCardClass} rounded-2xl border border-violet-400/25 p-4`}>
                  <p className="text-xs uppercase tracking-wide text-violet-400">Forward Faktor</p>
                  <p className="mt-2 text-2xl font-semibold">{result?.forwardFactor ? `${result.forwardFactor}%` : '—'}</p>
                </div>
                <div className={`${softCardClass} rounded-2xl border border-emerald-400/25 p-4`}>
                  <p className="text-xs uppercase tracking-wide text-emerald-400">DTE Window</p>
                  <p className="mt-2 text-2xl font-semibold">{result?.daysToExp1 && result?.daysToExp2 ? `${result.daysToExp1}-${result.daysToExp2}` : '—'}</p>
                </div>
                <div className={`${softCardClass} rounded-2xl border border-amber-400/25 p-4`}>
                  <p className="text-xs uppercase tracking-wide text-amber-400">Model</p>
                  <p className="mt-2 text-lg font-semibold">{pricingModelLabel}</p>
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-3 rounded-2xl border p-3 backdrop-blur-xl ${darkMode ? 'border-slate-700 bg-slate-900/60' : 'border-white/60 bg-white/60'}`}>
              <select
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value)}
                className={`${baseInputClass} min-w-[190px] border-none bg-transparent px-4 py-3 text-sm font-semibold`}
              >
                <option value="blackscholes">Black-Scholes</option>
                <option value="black76">Black-76</option>
                <option value="binomial">Binomial</option>
              </select>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`rounded-2xl border p-3 transition-all duration-300 ${darkMode ? 'border-slate-700 bg-slate-900/70 text-amber-300 hover:border-amber-400/60' : 'border-white/60 bg-white/70 text-slate-800 hover:border-slate-300/80'}`}
              >
                {darkMode ? <Sun size={22} /> : <Moon size={22} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className={`lg:col-span-1 ${panelClass} rounded-3xl p-6 lg:p-8`}>
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Parameter</h2>
                <p className={`mt-1 text-sm ${subtleTextClass}`}>Live-Daten oder Demo laden und sofort durchstarten.</p>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide">Polygon.io API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={`${baseInputClass} mt-2`}
                  placeholder="Paste your Polygon.io API key"
                />
                <a
                  href="https://polygon.io/dashboard/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center text-xs font-semibold text-sky-400 hover:text-sky-300"
                >
                  Get free API key → (End-of-Day data)
                </a>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wide">Ticker Symbol</label>
                <div className="relative">
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => handleTickerChange(e.target.value)}
                    onFocus={() => handleTickerChange(ticker)}
                    className={`${baseInputClass}`}
                    placeholder="e.g. SPY"
                  />
                  {showTickerDropdown && (
                    <div className={`absolute z-40 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border backdrop-blur-xl shadow-[0_30px_80px_-25px_rgba(15,23,42,0.6)] ${darkMode ? 'border-slate-700 bg-slate-900/95 text-slate-100' : 'border-white/70 bg-white/95 text-slate-900'}`}>
                      {filteredTickers.length > 0 ? (
                        filteredTickers.map(stock => (
                          <button
                            key={stock.symbol}
                            onClick={() => selectTicker(stock.symbol)}
                            className={`flex w-full items-center justify-between px-4 py-2 text-sm transition ${darkMode ? 'hover:bg-slate-800/80' : 'hover:bg-slate-100/80'}`}
                          >
                            <span className="font-semibold">{stock.symbol}</span>
                            <span className="ml-2 text-xs opacity-70">{stock.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm opacity-70">No matches found</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => fetchOptionData(ticker)}
                    className={`${primaryButtonClass} sm:flex-1`}
                    disabled={loading}
                  >
                    {loading ? 'Loading…' : 'Load Latest Market Data'}
                  </button>
                  <button
                    onClick={loadDemoData}
                    className={`sm:w-auto rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${darkMode ? 'bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                  >
                    Demo Data (SPY)
                  </button>
                </div>
                {loadError && <p className="text-xs font-semibold text-rose-400">{loadError}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Expiration 1', value: date1, onClick: () => { setShowCalendar1(true); setShowCalendar2(false); }, calendar: renderCalendar(date1, setDate1, showCalendar1, setShowCalendar1) },
                  { label: 'Expiration 2', value: date2, onClick: () => { setShowCalendar2(true); setShowCalendar1(false); }, calendar: renderCalendar(date2, setDate2, showCalendar2, setShowCalendar2) }
                ].map((item, idx) => (
                  <div className="relative" key={idx}>
                    <label className="text-xs font-semibold uppercase tracking-wide">{item.label}</label>
                    <button
                      onClick={item.onClick}
                      className={`mt-2 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${darkMode ? 'bg-slate-900/70 text-slate-100 hover:border-sky-400/60 border border-slate-700' : 'bg-white/80 text-slate-900 hover:border-sky-500 border border-white/60'}`}
                    >
                      <span>{new Date(item.value).toLocaleDateString('en-US')}</span>
                      <Calendar className="h-5 w-5" />
                    </button>
                    {item.calendar}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'IV Exp 1 (%)', value: iv1, setter: setIv1 },
                  { label: 'IV Exp 2 (%)', value: iv2, setter: setIv2 },
                  { label: 'Stock Price', value: spotPrice, setter: setSpotPrice },
                  { label: 'Strike', value: strikePrice, setter: setStrikePrice },
                  { label: 'Risk-Free Rate (%)', value: riskFreeRate, setter: setRiskFreeRate },
                  { label: 'Dividend (%)', value: dividend, setter: setDividend }
                ].map((field, idx) => (
                  <div key={idx} className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide">{field.label}</label>
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className={baseInputClass}
                      step="0.01"
                    />
                  </div>
                ))}
              </div>

              <button onClick={calculateResults} className={primaryButtonClass}>
                Calculate
              </button>
            </div>
          </div>

          <div className={`lg:col-span-3 ${panelClass} rounded-3xl p-6 lg:p-8`}>
            <div className="space-y-6">
              {result && (
                <>
                  {result.error ? (
                    <div className={`${softCardClass} rounded-3xl border border-rose-500/40 p-6 ${darkMode ? 'text-rose-200' : 'text-rose-600'}`}>
                      <p className="font-semibold">{result.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className={`${softCardClass} rounded-3xl border border-sky-400/35 p-6`}>
                          <p className="text-xs uppercase tracking-wide text-sky-300">Forward Volatility</p>
                          <p className="mt-3 text-3xl font-semibold">{result.forwardVolPct}%</p>
                          <p className={`mt-2 text-xs ${subtleTextClass}`}>{result.daysToExp1}-{result.daysToExp2} DTE</p>
                        </div>
                        <div className={`${softCardClass} rounded-3xl border border-emerald-400/35 p-6 ${getFFColor(result.forwardFactor)}`}>
                          <p className="text-xs uppercase tracking-wide opacity-80">Forward Faktor</p>
                          <p className="mt-3 text-3xl font-semibold">{result.forwardFactor}%</p>
                          <p className="mt-2 text-xs opacity-80">
                            {parseFloat(result.forwardFactor) >= 30 ? '✓ Excellent' : parseFloat(result.forwardFactor) >= 16 ? '✓ Good' : 'Below threshold'}
                          </p>
                        </div>
                      </div>

                      <div className={`${softCardClass} rounded-3xl border border-rose-500/35 p-6`}>
                        <p className="text-lg font-semibold text-rose-400">Target Price for FF 30%</p>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-center">
                            <p className="text-xs uppercase tracking-wide text-rose-300">Call Spread</p>
                            <p className="mt-3 text-4xl font-semibold text-rose-200">${result.maxCallCalendarPrice30}</p>
                            <p className={`mt-2 text-xs ${subtleTextClass}`}>Max Entry Price</p>
                          </div>
                          <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-center">
                            <p className="text-xs uppercase tracking-wide text-rose-300">Put Spread</p>
                            <p className="mt-3 text-4xl font-semibold text-rose-200">${result.maxPutCalendarPrice30}</p>
                            <p className={`mt-2 text-xs ${subtleTextClass}`}>Max Entry Price</p>
                          </div>
                        </div>
                      </div>

                      <div className={`${softCardClass} rounded-3xl border border-sky-500/35 p-6`}>
                        <p className="text-lg font-semibold text-sky-400">Current Calendar Spreads</p>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-sky-200">Call Spread</p>
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Current Price</span>
                                <span className="text-2xl font-semibold text-sky-100">${result.callCalendarSpread}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs opacity-80">
                                <span>For FF 0%</span>
                                <span className="font-semibold">${result.callCalendarSpreadAt0}</span>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/10 p-4">
                            <p className="text-xs uppercase tracking-wide text-fuchsia-200">Put Spread</p>
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Current Price</span>
                                <span className="text-2xl font-semibold text-fuchsia-100">${result.putCalendarSpread}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs opacity-80">
                                <span>For FF 0%</span>
                                <span className="font-semibold">${result.putCalendarSpreadAt0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={`${softCardClass} rounded-3xl border border-slate-500/30 p-6`}>
                        <p className="text-sm font-semibold uppercase tracking-wide">Term Structure Visualisation</p>
                        <div className="mt-4 h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid stroke={darkMode ? '#2f3344' : '#dbeafe'} strokeDasharray="3 6" />
                              <XAxis dataKey="dte" stroke={darkMode ? '#94a3b8' : '#475569'} tickLine={false} axisLine={false} />
                              <YAxis stroke={darkMode ? '#94a3b8' : '#475569'} tickLine={false} axisLine={false} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: darkMode ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.9)',
                                  border: `1px solid ${darkMode ? 'rgba(148,163,184,0.2)' : 'rgba(59,130,246,0.2)'}`,
                                  borderRadius: 16,
                                  color: darkMode ? '#e2e8f0' : '#0f172a'
                                }}
                              />
                              <Line type="monotone" dataKey="iv" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: '#38bdf8' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className={`${softCardClass} rounded-3xl border border-sky-400/35 p-6`}>
                          <p className="text-sm font-semibold uppercase tracking-wide text-sky-200">Call Calendar Spread</p>
                          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className={`text-xs ${subtleTextClass}`}>Front (T1)</p>
                              <p className="font-semibold">${result.callT1}</p>
                            </div>
                            <div>
                              <p className={`text-xs ${subtleTextClass}`}>Back (T2)</p>
                              <p className="font-semibold">${result.callT2}</p>
                            </div>
                            <div>
                              <p className={`text-xs ${subtleTextClass}`}>Spread</p>
                              <p className="text-lg font-semibold">${result.callCalendarSpread}</p>
                            </div>
                          </div>
                          <div className={`mt-3 rounded-2xl border border-sky-400/30 bg-sky-500/10 p-3 text-xs font-semibold`}>Max für FF +30%: <span className="font-bold">${result.maxCallCalendarPrice30}</span></div>

                          <div className="mt-4 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wide">Preis-Simulator</p>
                            <input
                              type="range"
                              min="0"
                              max={parseFloat(result.callCalendarSpread) * 4}
                              step="0.01"
                              defaultValue={result.callCalendarSpread}
                              onChange={(e) => handlePriceSlider(parseFloat(e.target.value), true)}
                              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400"
                            />
                            <div className="flex justify-between text-xs">
                              <span>${(parseFloat(result.maxCallCalendarPrice30)).toFixed(2)} (FF 30%)</span>
                              <span className="font-bold">${callPriceSlider !== null ? callPriceSlider.toFixed(2) : result.callCalendarSpread}</span>
                              <span>${(parseFloat(result.callCalendarSpread) * 4).toFixed(2)} (max)</span>
                            </div>
                            {callPriceSlider !== null && adjustedFFCall !== null && (
                              <div className={`rounded-2xl border p-3 text-center text-sm font-bold ${
                                adjustedFFCall >= 30
                                  ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                                  : adjustedFFCall >= 16
                                  ? 'border-amber-400/60 bg-amber-500/15 text-amber-200'
                                  : 'border-slate-500/50 bg-slate-500/10'
                              }`}>
                                Angepasster FF: {adjustedFFCall.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        </div>

                        <div className={`${softCardClass} rounded-3xl border border-fuchsia-400/35 p-6`}>
                          <p className="text-sm font-semibold uppercase tracking-wide text-fuchsia-200">Put Calendar Spread</p>
                          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className={`text-xs ${subtleTextClass}`}>Front (T1)</p>
                              <p className="font-semibold">${result.putT1}</p>
                            </div>
                            <div>
                              <p className={`text-xs ${subtleTextClass}`}>Back (T2)</p>
                              <p className="font-semibold">${result.putT2}</p>
                            </div>
                            <div>
                              <p className={`text-xs ${subtleTextClass}`}>Spread</p>
                              <p className="text-lg font-semibold">${result.putCalendarSpread}</p>
                            </div>
                          </div>
                          <div className={`mt-3 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/10 p-3 text-xs font-semibold`}>Max für FF +30%: <span className="font-bold">${result.maxPutCalendarPrice30}</span></div>

                          <div className="mt-4 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wide">Preis-Simulator</p>
                            <input
                              type="range"
                              min="0"
                              max={parseFloat(result.putCalendarSpread) * 4}
                              step="0.01"
                              defaultValue={result.putCalendarSpread}
                              onChange={(e) => handlePriceSlider(parseFloat(e.target.value), false)}
                              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400"
                            />
                            <div className="flex justify-between text-xs">
                              <span>${(parseFloat(result.maxPutCalendarPrice30)).toFixed(2)} (FF 30%)</span>
                              <span className="font-bold">${putPriceSlider !== null ? putPriceSlider.toFixed(2) : result.putCalendarSpread}</span>
                              <span>${(parseFloat(result.putCalendarSpread) * 4).toFixed(2)} (max)</span>
                            </div>
                            {putPriceSlider !== null && adjustedFFPut !== null && (
                              <div className={`rounded-2xl border p-3 text-center text-sm font-bold ${
                                adjustedFFPut >= 30
                                  ? 'border-emerald-400/60 bg-emerald-500/15 text-emerald-200'
                                  : adjustedFFPut >= 16
                                  ? 'border-amber-400/60 bg-amber-500/15 text-amber-200'
                                  : 'border-slate-500/50 bg-slate-500/10'
                              }`}>
                                Angepasster FF: {adjustedFFPut.toFixed(2)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={exportCSV}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:shadow-emerald-500/40"
                      >
                        <Download size={20} /> Ergebnis als CSV exportieren
                      </button>

                      {tradeHistory.length > 0 && (
                        <div className={`${softCardClass} rounded-3xl border border-slate-500/30 p-6`}>
                          <p className="text-sm font-semibold uppercase tracking-wide">Trade History (letzte 10)</p>
                          <div className="mt-4 max-h-96 space-y-3 overflow-y-auto pr-2 text-sm">
                            {tradeHistory.map((trade, idx) => (
                              <div
                                key={idx}
                                className={`rounded-2xl border p-4 transition ${
                                  parseFloat(trade.ff) >= 30
                                    ? darkMode ? 'border-emerald-400/40 bg-emerald-500/15' : 'border-emerald-200 bg-emerald-50'
                                    : parseFloat(trade.ff) >= 16
                                    ? darkMode ? 'border-amber-400/40 bg-amber-500/15' : 'border-amber-200 bg-amber-50'
                                    : darkMode ? 'border-slate-600 bg-slate-900/70' : 'border-slate-200 bg-white/80'
                                }`}
                              >
                                <div className="text-sm font-semibold">{trade.ticker} · {trade.date} · FF {trade.ff.toFixed(2)}%</div>
                                <div className={`mt-2 space-y-1 text-xs ${subtleTextClass}`}>
                                  <div>Aktuell: Call ${parseFloat(trade.callSpreadCurrent).toFixed(4)} | Put ${parseFloat(trade.putSpreadCurrent).toFixed(4)}</div>
                                  <div>@ FF 30%: Call ${parseFloat(trade.callSpreadFF30).toFixed(4)} | Put ${parseFloat(trade.putSpreadFF30).toFixed(4)}</div>
                                  <div>@ FF 0%: Call ${parseFloat(trade.callSpreadFF0).toFixed(4)} | Put ${parseFloat(trade.putSpreadFF0).toFixed(4)}</div>
                                </div>
                                <p className={`mt-2 text-xs ${subtleTextClass}`}>{trade.timestamp}</p>
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
          </div>
        </div>
      </div>
      <Analytics />
    </div>
  );

}
