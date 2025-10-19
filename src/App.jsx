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
          <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Nächste 50 Freitag</h3>
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

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100';
  const cardClass = darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${bgClass} p-6`}>
      <div className="max-w-6xl mx-auto">
        <div className={`${cardClass} rounded-lg shadow-lg p-8`}>
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Calendar Spread Calculator</h1>
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-bold mb-4">Parameters</h2>

              <div>
                <label className="block text-sm font-semibold mb-2">Ticker Symbol</label>
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 focus:border-blue-400'
                      : 'bg-white border-blue-300 focus:border-blue-500'
                  }`}
                  placeholder="e.g. AAPL"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold mb-2">Expiration 1</label>
                <button
                  onClick={() => { setShowCalendar1(true); setShowCalendar2(false); }}
                  className={`w-full px-4 py-2 border-2 rounded-lg flex items-center justify-between ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 hover:border-blue-400' 
                      : 'bg-white border-blue-300 hover:border-blue-500'
                  }`}
                >
                  <span>{new Date(date1).toLocaleDateString('en-US')}</span>
                  <Calendar className="w-5 h-5" />
                </button>
                {renderCalendar(date1, setDate1, showCalendar1, setShowCalendar1)}
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold mb-2">Expiration 2</label>
                <button
                  onClick={() => { setShowCalendar2(true); setShowCalendar1(false); }}
                  className={`w-full px-4 py-2 border-2 rounded-lg flex items-center justify-between ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 hover:border-blue-400' 
                      : 'bg-white border-blue-300 hover:border-blue-500'
                  }`}
                >
                  <span>{new Date(date2).toLocaleDateString('en-US')}</span>
                  <Calendar className="w-5 h-5" />
                </button>
                {renderCalendar(date2, setDate2, showCalendar2, setShowCalendar2)}
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

            <div className="lg:col-span-3 space-y-4">
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

                      <div className={`border-2 ${borderClass} p-4 rounded-lg`}>
                        <p className="text-sm font-semibold mb-3">Term Structure Visualization</p>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={chartData}>
                            <CartesianGrid stroke={darkMode ? '#444' : '#ccc'} />
                            <XAxis dataKey="dte" stroke={darkMode ? '#999' : '#666'} />
                            <YAxis stroke={darkMode ? '#999' : '#666'} />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: darkMode ? '#333' : '#fff',
                                border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
                                color: darkMode ? '#fff' : '#000'
                              }}
                            />
                            <Line type="monotone" dataKey="iv" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className={`border-2 border-blue-500 p-4 rounded-lg ${darkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-50 text-blue-900'}`}>
                          <p className="font-semibold mb-3">Call Calendar Spread</p>
                          <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                            <div>
                              <p className="text-xs opacity-75">Front (T1)</p>
                              <p className="font-bold">${result.callT1}</p>
                            </div>
                            <div>
                              <p className="text-xs opacity-75">Back (T2)</p>
                              <p className="font-bold">${result.callT2}</p>
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
                                <div className="font-semibold">{trade.ticker} - {trade.date} | FF: {trade.ff.toFixed(2)}%</div>
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
          </div>
        </div>
      </div>
      <Analytics /> 
    </div>
  );
}
