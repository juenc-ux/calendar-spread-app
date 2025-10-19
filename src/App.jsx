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
    if (ffNum >= 30) return darkMode
      ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200'
      : 'bg-emerald-100 border-emerald-400 text-emerald-700';
    if (ffNum >= 16) return darkMode
      ? 'bg-amber-500/20 border-amber-400/60 text-amber-200'
      : 'bg-amber-100 border-amber-400 text-amber-700';
    return darkMode
      ? 'bg-slate-800/60 border-slate-700 text-slate-200'
      : 'bg-slate-100 border-slate-200 text-slate-600';
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

  const bgClass = darkMode
    ? 'bg-slate-950 text-slate-100'
    : 'bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-100 text-slate-900';
  const cardClass = darkMode
    ? 'bg-slate-950/60 text-slate-100 border border-slate-800/70'
    : 'bg-white/60 text-slate-900 border border-white/70';
  const subtleText = darkMode ? 'text-slate-400' : 'text-slate-600';
  const inputBase = darkMode
    ? 'bg-slate-900/50 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30'
    : 'bg-white/70 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';
  const panelBase = darkMode
    ? 'bg-slate-900/70 border border-slate-800/80'
    : 'bg-white/80 border border-white/80';
  const miniPanelBase = darkMode
    ? 'bg-slate-900/60 border border-slate-800/70'
    : 'bg-white/75 border border-slate-200/70';
  const gradientButton =
    'bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-glow hover:-translate-y-0.5';

  return (
    <div className={`relative min-h-screen ${bgClass} transition-colors duration-500`}>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className={`absolute inset-0 opacity-90 ${darkMode ? 'bg-aurora-dark' : 'bg-aurora-light'}`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),transparent_65%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`${cardClass} relative overflow-hidden rounded-3xl backdrop-blur-2xl shadow-2xl`}>
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500" />

          <div className="relative p-8 sm:p-10 lg:p-12 space-y-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-500">
                  <Info size={16} />
                  Professional Calendar Analytics
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">Calendar Spread Intelligence</h1>
                  <p className={`max-w-2xl text-sm sm:text-base leading-relaxed ${subtleText}`}>
                    Modellieren Sie Forward Volatility, Forward Factor und Kalender-Spread-Pricing in einer eleganten, datenzentrierten Oberfläche.
                    Entdecken Sie Szenarien, vergleichen Sie Modelle und exportieren Sie Insights in Sekunden.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className={`${miniPanelBase} rounded-2xl px-4 py-3 shadow-lg backdrop-blur-xl`}>
                  <p className={`text-xs uppercase tracking-wide ${subtleText}`}>Pricing Model</p>
                  <select
                    value={pricingModel}
                    onChange={(e) => setPricingModel(e.target.value)}
                    className={`${inputBase} mt-2 w-full rounded-xl bg-transparent px-3 py-2 text-sm font-semibold focus:outline-none`}
                  >
                    <option value="blackscholes">Black-Scholes</option>
                    <option value="black76">Black-76</option>
                    <option value="binomial">Binomial</option>
                  </select>
                </div>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`${miniPanelBase} rounded-2xl px-4 py-3 flex items-center justify-center shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5`}
                  aria-label="Toggle color mode"
                >
                  {darkMode ? <Sun size={22} className="text-amber-300" /> : <Moon size={22} className="text-indigo-500" />}
                </button>
              </div>
            </div>

            <div className="grid gap-10 xl:grid-cols-[360px_1fr]">
              <div className="space-y-6">
                <section className={`${panelBase} rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-6`}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Marktdaten</h2>
                    <span className={`text-xs font-semibold tracking-wide ${subtleText}`}>Live &amp; Demo Inputs</span>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-3">
                      <label className="text-xs font-semibold uppercase tracking-wide">Polygon.io API Key</label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className={`${inputBase} w-full rounded-xl px-4 py-3 transition-all duration-300`}
                        placeholder="Paste your Polygon.io API key"
                      />
                      <a
                        href="https://polygon.io/dashboard/signup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
                      >
                        Get your free Polygon key ↗
                      </a>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-semibold uppercase tracking-wide">Ticker Symbol</label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
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
                              setTimeout(() => setShowTickerDropdown(false), 200);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                setShowTickerDropdown(false);
                                fetchOptionData(ticker);
                              } else if (e.key === 'Escape') {
                                setShowTickerDropdown(false);
                              }
                            }}
                            className={`${inputBase} w-full rounded-xl px-4 py-3 transition-all duration-300`}
                            placeholder="e.g. AAPL, SPY, TSLA..."
                            disabled={loading}
                          />
                          {showTickerDropdown && filteredTickers.length > 0 && (
                            <div className={`${miniPanelBase} absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl backdrop-blur-xl shadow-2xl`}>
                              {filteredTickers.map((stock) => (
                                <button
                                  key={stock.symbol}
                                  onClick={() => selectTicker(stock.symbol)}
                                  className={`w-full px-4 py-2 text-left transition-colors duration-200 first:rounded-t-2xl last:rounded-b-2xl ${darkMode ? 'hover:bg-slate-800/80 text-slate-100' : 'hover:bg-indigo-50/80 text-slate-900'}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold">{stock.symbol}</span>
                                    <span className={`text-xs ${subtleText}`}>{stock.name}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => fetchOptionData(ticker)}
                          disabled={loading}
                          className={`${gradientButton} inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-transform duration-300 disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 animate-ping rounded-full bg-white" />
                              Loading
                            </span>
                          ) : (
                            <>
                              <Download size={16} className="opacity-90" />
                              Load
                            </>
                          )}
                        </button>
                      </div>
                      {loadError && <p className="text-xs font-semibold text-rose-400">{loadError}</p>}
                      {loading && !loadError && <p className={`text-xs font-medium ${subtleText}`}>Fetching latest aggregated pricing…</p>}
                      <button
                        onClick={loadDemoData}
                        className={`${miniPanelBase} w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5`}
                      >
                        Load Demo Data (SPY)
                      </button>
                    </div>
                  </div>
                </section>

                <section className={`${panelBase} rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-5`}>
                  <h3 className="text-xl font-semibold">Strategieparameter</h3>

                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide">Expiration 1</label>
                        <button
                          onClick={() => { setShowCalendar1(true); setShowCalendar2(false); }}
                          className={`${miniPanelBase} w-full rounded-2xl px-4 py-3 flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5`}
                        >
                          <div className="text-left">
                            <p className={`text-xs uppercase tracking-wide ${subtleText}`}>First Leg</p>
                            <p className="mt-1 text-sm font-semibold">{new Date(date1).toLocaleDateString('en-US')}</p>
                          </div>
                          <Calendar className="w-5 h-5 text-indigo-400" />
                        </button>
                        {renderCalendar(date1, setDate1, showCalendar1, setShowCalendar1)}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide">Expiration 2</label>
                        <button
                          onClick={() => { setShowCalendar2(true); setShowCalendar1(false); }}
                          className={`${miniPanelBase} w-full rounded-2xl px-4 py-3 flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5`}
                        >
                          <div className="text-left">
                            <p className={`text-xs uppercase tracking-wide ${subtleText}`}>Second Leg</p>
                            <p className="mt-1 text-sm font-semibold">{new Date(date2).toLocaleDateString('en-US')}</p>
                          </div>
                          <Calendar className="w-5 h-5 text-indigo-400" />
                        </button>
                        {renderCalendar(date2, setDate2, showCalendar2, setShowCalendar2)}
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {[
                        { label: 'IV Exp 1 (%)', value: iv1, setter: setIv1 },
                        { label: 'IV Exp 2 (%)', value: iv2, setter: setIv2 },
                        { label: 'Stock Price', value: spotPrice, setter: setSpotPrice },
                        { label: 'Strike', value: strikePrice, setter: setStrikePrice },
                        { label: 'Risk-Free Rate (%)', value: riskFreeRate, setter: setRiskFreeRate },
                        { label: 'Dividend (%)', value: dividend, setter: setDividend }
                      ].map((field) => (
                        <div key={field.label} className="space-y-2">
                          <label className="text-xs font-semibold uppercase tracking-wide">{field.label}</label>
                          <input
                            type="number"
                            value={field.value}
                            onChange={(e) => field.setter(e.target.value)}
                            className={`${inputBase} w-full rounded-xl px-4 py-3 transition-all duration-300`}
                            step="0.01"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={calculateResults}
                      className={`${gradientButton} w-full rounded-2xl px-4 py-4 text-base font-semibold transition-transform duration-300`}
                    >
                      Calculate
                    </button>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                {!result && (
                  <section className={`${panelBase} rounded-3xl p-8 text-center backdrop-blur-xl shadow-xl space-y-4`}>
                    <Calendar className="mx-auto h-12 w-12 text-indigo-400" />
                    <h3 className="text-2xl font-semibold">Starte mit deinen Parametern</h3>
                    <p className={`${subtleText} text-sm max-w-lg mx-auto`}>
                      Trage deine Implied Volatilities, Laufzeiten und Marktannahmen ein, um sofort Forward-Faktoren, Preisniveaus und Risikoindikatoren zu erhalten.
                    </p>
                  </section>
                )}

                {result && result.error && (
                  <section className={`${panelBase} rounded-3xl border border-rose-500/60 bg-rose-500/5 p-8 backdrop-blur-xl shadow-xl`}>
                    <p className="text-lg font-semibold text-rose-300">{result.error}</p>
                    <p className={`${subtleText} mt-2 text-sm`}>Bitte passe deine Eingaben an und versuche es erneut.</p>
                  </section>
                )}

                {result && !result.error && (
                  <>
                    <section className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className={`${miniPanelBase} rounded-2xl p-5 shadow-lg backdrop-blur-xl`}>
                          <p className={`text-xs uppercase tracking-wide ${subtleText}`}>Forward Volatility</p>
                          <p className="mt-2 text-3xl font-bold">{result.forwardVolPct}%</p>
                          <p className={`mt-3 text-xs font-medium ${subtleText}`}>{result.daysToExp1}-{result.daysToExp2} DTE</p>
                        </div>

                        <div className={`${getFFColor(result.forwardFactor)} rounded-2xl border p-5 shadow-lg backdrop-blur-xl`}>
                          <p className="text-xs uppercase tracking-wide opacity-80">Forward Faktor</p>
                          <p className="mt-2 text-3xl font-extrabold">{result.forwardFactor}%</p>
                          <p className="mt-3 text-xs font-semibold opacity-80">
                            {parseFloat(result.forwardFactor) >= 30 ? 'Level: Excellent' : parseFloat(result.forwardFactor) >= 16 ? 'Level: Attractive' : 'Level: Watchlist'}
                          </p>
                        </div>

                        <div className={`${miniPanelBase} rounded-2xl p-5 shadow-lg backdrop-blur-xl`}>
                          <p className={`text-xs uppercase tracking-wide ${subtleText}`}>Timing Window</p>
                          <p className="mt-2 text-lg font-semibold">{new Date(date1).toLocaleDateString('en-US')} → {new Date(date2).toLocaleDateString('en-US')}</p>
                          <p className={`mt-3 text-xs font-medium ${subtleText}`}>Next expirations in New York close alignment</p>
                        </div>
                      </div>
                    </section>

                    <section className={`${panelBase} rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6`}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-2xl font-semibold">Target Price @ FF +30%</h3>
                        <span className={`${subtleText} text-sm`}>Maximale Einstiegslevel für aggressive Forwards</span>
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className={`${miniPanelBase} rounded-2xl p-5 text-center shadow-lg backdrop-blur-xl`}>
                          <p className={`text-xs uppercase tracking-wide ${subtleText}`}>Call Spread</p>
                          <p className="mt-4 text-4xl font-black text-rose-400">${result.maxCallCalendarPrice30}</p>
                          <p className={`${subtleText} mt-2 text-xs`}>Max Entry Price</p>
                        </div>
                        <div className={`${miniPanelBase} rounded-2xl p-5 text-center shadow-lg backdrop-blur-xl`}>
                          <p className={`text-xs uppercase tracking-wide ${subtleText}`}>Put Spread</p>
                          <p className="mt-4 text-4xl font-black text-rose-400">${result.maxPutCalendarPrice30}</p>
                          <p className={`${subtleText} mt-2 text-xs`}>Max Entry Price</p>
                        </div>
                      </div>
                    </section>

                    <section className={`${panelBase} rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6`}>
                      <h3 className="text-2xl font-semibold">Aktuelle Calendar Spreads</h3>
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className={`${miniPanelBase} rounded-2xl p-5 shadow-lg backdrop-blur-xl space-y-3`}>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">Call Spread</p>
                            <span className="text-xs font-semibold text-indigo-400">Live</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Current Price</span>
                            <span className="text-2xl font-bold text-indigo-400">${result.callCalendarSpread}</span>
                          </div>
                          <div className={`flex items-center justify-between text-xs ${subtleText}`}>
                            <span>FF 0%</span>
                            <span className="font-semibold">${result.callCalendarSpreadAt0}</span>
                          </div>
                        </div>

                        <div className={`${miniPanelBase} rounded-2xl p-5 shadow-lg backdrop-blur-xl space-y-3`}>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold">Put Spread</p>
                            <span className="text-xs font-semibold text-pink-400">Live</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Current Price</span>
                            <span className="text-2xl font-bold text-pink-400">${result.putCalendarSpread}</span>
                          </div>
                          <div className={`flex items-center justify-between text-xs ${subtleText}`}>
                            <span>FF 0%</span>
                            <span className="font-semibold">${result.putCalendarSpreadAt0}</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className={`${panelBase} rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6`}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-2xl font-semibold">Term Structure Visualization</h3>
                        <span className={`${subtleText} text-sm`}>Model forward IV curvature across expiries</span>
                      </div>
                      <div className={`${miniPanelBase} rounded-2xl p-4 shadow-inner backdrop-blur-xl`}>
                        <ResponsiveContainer width="100%" height={260}>
                          <LineChart data={chartData}>
                            <CartesianGrid stroke={darkMode ? '#374151' : '#E2E8F0'} strokeDasharray="3 3" />
                            <XAxis dataKey="dte" stroke={darkMode ? '#CBD5F5' : '#475569'} tick={{ fontSize: 12 }} />
                            <YAxis stroke={darkMode ? '#CBD5F5' : '#475569'} tick={{ fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: darkMode ? 'rgba(15,23,42,0.9)' : 'rgba(255,255,255,0.95)',
                                borderRadius: '1rem',
                                border: `1px solid ${darkMode ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.25)'}`,
                                padding: '0.75rem 1rem',
                              }}
                              labelStyle={{ color: darkMode ? '#E2E8F0' : '#0F172A', fontWeight: 600 }}
                              itemStyle={{ color: darkMode ? '#A5B4FC' : '#4338CA', fontWeight: 600 }}
                            />
                            <Line type="monotone" dataKey="iv" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4, fill: '#38BDF8', strokeWidth: 2, stroke: '#0F172A' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </section>

                    <section className="grid gap-6 lg:grid-cols-2">
                      <div className={`${panelBase} rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4`}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold">Call Calendar Spread</h4>
                          <span className={`${subtleText} text-xs`}>Sensitivity</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className={`${subtleText} text-xs`}>Front (T1)</p>
                            <p className="mt-1 font-semibold">${result.callT1}</p>
                          </div>
                          <div>
                            <p className={`${subtleText} text-xs`}>Back (T2)</p>
                            <p className="mt-1 font-semibold">${result.callT2}</p>
                          </div>
                          <div>
                            <p className={`${subtleText} text-xs`}>Spread</p>
                            <p className="mt-1 text-lg font-bold">${result.callCalendarSpread}</p>
                          </div>
                        </div>
                        <div className={`${miniPanelBase} rounded-2xl px-4 py-3 text-xs font-semibold`}>Max für FF +30%: ${result.maxCallCalendarPrice30}</div>
                        <div className="space-y-3">
                          <label className={`${subtleText} text-xs font-semibold uppercase tracking-wide`}>Preis-Simulator</label>
                          <input
                            type="range"
                            min="0"
                            max={parseFloat(result.callCalendarSpread) * 4}
                            step="0.01"
                            defaultValue={result.callCalendarSpread}
                            onChange={(e) => handlePriceSlider(parseFloat(e.target.value), true)}
                            className="w-full accent-indigo-500"
                          />
                          <div className="flex justify-between text-xs font-semibold">
                            <span>${(parseFloat(result.maxCallCalendarPrice30)).toFixed(2)} (FF 30%)</span>
                            <span>{callPriceSlider !== null ? callPriceSlider.toFixed(2) : result.callCalendarSpread}</span>
                            <span>${(parseFloat(result.callCalendarSpread) * 4).toFixed(2)} (max)</span>
                          </div>
                          {callPriceSlider !== null && adjustedFFCall !== null && (
                            <div className={`${miniPanelBase} rounded-2xl px-4 py-3 text-sm font-bold text-center`}>
                              Angepasster FF: {adjustedFFCall.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={`${panelBase} rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4`}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold">Put Calendar Spread</h4>
                          <span className={`${subtleText} text-xs`}>Sensitivity</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className={`${subtleText} text-xs`}>Front (T1)</p>
                            <p className="mt-1 font-semibold">${result.putT1}</p>
                          </div>
                          <div>
                            <p className={`${subtleText} text-xs`}>Back (T2)</p>
                            <p className="mt-1 font-semibold">${result.putT2}</p>
                          </div>
                          <div>
                            <p className={`${subtleText} text-xs`}>Spread</p>
                            <p className="mt-1 text-lg font-bold">${result.putCalendarSpread}</p>
                          </div>
                        </div>
                        <div className={`${miniPanelBase} rounded-2xl px-4 py-3 text-xs font-semibold`}>Max für FF +30%: ${result.maxPutCalendarPrice30}</div>
                        <div className="space-y-3">
                          <label className={`${subtleText} text-xs font-semibold uppercase tracking-wide`}>Preis-Simulator</label>
                          <input
                            type="range"
                            min="0"
                            max={parseFloat(result.putCalendarSpread) * 4}
                            step="0.01"
                            defaultValue={result.putCalendarSpread}
                            onChange={(e) => handlePriceSlider(parseFloat(e.target.value), false)}
                            className="w-full accent-pink-500"
                          />
                          <div className="flex justify-between text-xs font-semibold">
                            <span>${(parseFloat(result.maxPutCalendarPrice30)).toFixed(2)} (FF 30%)</span>
                            <span>{putPriceSlider !== null ? putPriceSlider.toFixed(2) : result.putCalendarSpread}</span>
                            <span>${(parseFloat(result.putCalendarSpread) * 4).toFixed(2)} (max)</span>
                          </div>
                          {putPriceSlider !== null && adjustedFFPut !== null && (
                            <div className={`${miniPanelBase} rounded-2xl px-4 py-3 text-sm font-bold text-center`}>
                              Angepasster FF: {adjustedFFPut.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    <button
                      onClick={exportCSV}
                      className={`${gradientButton} w-full rounded-2xl px-4 py-4 text-base font-semibold transition-transform duration-300 flex items-center justify-center gap-3`}
                    >
                      <Download size={20} className="opacity-90" /> Ergebnis als CSV exportieren
                    </button>

                    {tradeHistory.length > 0 && (
                      <section className={`${panelBase} rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4`}>
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold">Trade History</h4>
                          <span className={`${subtleText} text-xs`}>Letzte 10 Simulationen</span>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                          {tradeHistory.map((trade, idx) => (
                            <div
                              key={idx}
                              className={`${miniPanelBase} rounded-2xl px-4 py-3 text-sm backdrop-blur-xl`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-semibold">{trade.ticker} · {trade.date}</span>
                                <span className="text-xs font-semibold">FF: {trade.ff.toFixed(2)}%</span>
                              </div>
                              <div className={`${subtleText} mt-2 space-y-1 text-xs`}>
                                <div>Aktuell · Call ${parseFloat(trade.callSpreadCurrent).toFixed(4)} | Put ${parseFloat(trade.putSpreadCurrent).toFixed(4)}</div>
                                <div>FF 30% · Call ${parseFloat(trade.callSpreadFF30).toFixed(4)} | Put ${parseFloat(trade.putSpreadFF30).toFixed(4)}</div>
                                <div>FF 0% · Call ${parseFloat(trade.callSpreadFF0).toFixed(4)} | Put ${parseFloat(trade.putSpreadFF0).toFixed(4)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Analytics />
    </div>
  );
}
