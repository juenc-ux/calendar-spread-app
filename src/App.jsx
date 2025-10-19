import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Info, Calendar, Download, Moon, Sun } from 'lucide-react';
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
  const [result, setResult] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [pricingModel, setPricingModel] = useState('blackscholes');
  const [ticker, setTicker] = useState('');

  const normDist = (x) => {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
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
    return S * Math.exp(-q * T) * normDist(d1) - K * Math.exp(-r * T) * normDist(d2);
  };

  const blackScholesPut = (S, K, T, r, sigma, q = 0) => {
    if (T <= 0 || sigma <= 0) return Math.max(K - S, 0);
    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r - q + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;
    return K * Math.exp(-r * T) * normDist(-d2) - S * Math.exp(-q * T) * normDist(-d1);
  };

  const black76Call = (F, K, T, r, sigma) => {
    if (T <= 0 || sigma <= 0) return Math.max(F - K, 0);
    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(F / K) + (0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;
    return Math.exp(-r * T) * (F * normDist(d1) - K * normDist(d2));
  };

  const black76Put = (F, K, T, r, sigma) => {
    if (T <= 0 || sigma <= 0) return Math.max(K - F, 0);
    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(F / K) + (0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;
    return Math.exp(-r * T) * (K * normDist(-d2) - F * normDist(-d1));
  };

  const getOptionPrice = (S, K, T, r, sigma, q, isCall) => {
    switch(pricingModel) {
      case 'black76':
        const F = S * Math.exp((r - q) * T);
        return isCall ? black76Call(F, K, T, r, sigma) : black76Put(F, K, T, r, sigma);
      case 'blackscholes':
      default:
        return isCall ? blackScholesCall(S, K, T, r, sigma, q) : blackScholesPut(S, K, T, r, sigma, q);
    }
  };

  const calculateResults = () => {
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      if (d2 <= d1) {
        setResult({ error: 'Expiration 2 must be after Expiration 1' });
        return;
      }

      const now = new Date();
      const d1_16NY = new Date(d1);
      d1_16NY.setHours(22, 0, 0, 0);
      const d2_16NY = new Date(d2);
      d2_16NY.setHours(22, 0, 0, 0);

      const msPerDay = 24 * 60 * 60 * 1000;
      const daysToExp1 = (d1_16NY - now) / msPerDay;
      const daysToExp2 = (d2_16NY - now) / msPerDay;

      if (daysToExp1 <= 0 || daysToExp2 <= 0) {
        setResult({ error: 'Expiration date is in the past' });
        return;
      }

      const T1 = daysToExp1 / 365;
      const T2 = daysToExp2 / 365;

      const v1 = parseFloat(iv1) / 100;
      const v2 = parseFloat(iv2) / 100;
      const S = parseFloat(spotPrice);
      const K = parseFloat(strikePrice);
      const r = parseFloat(riskFreeRate) / 100;
      const q = parseFloat(dividend) / 100;

      if (v1 <= 0 || v2 <= 0 || S <= 0 || K <= 0) {
        setResult({ error: 'Please check your inputs' });
        return;
      }

      const numerator = (T2 * v2 * v2) - (T1 * v1 * v1);
      const denominator = T2 - T1;
      
      if (numerator < 0) {
        setResult({ error: 'Invalid IV combination' });
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

      const requiredForwardVol30 = v1 / 1.30;
      const iv2Squared30 = (requiredForwardVol30 * requiredForwardVol30 * (T2 - T1) + T1 * v1 * v1) / T2;
      const requiredIV230 = Math.sqrt(Math.max(0, iv2Squared30));
      
      const callT2At30 = getOptionPrice(S, K, T2, r, requiredIV230, q, true);
      const maxCallCalendarPrice30 = callT2At30 - callT1;
      
      const putT2At30 = getOptionPrice(S, K, T2, r, requiredIV230, q, false);
      const maxPutCalendarPrice30 = putT2At30 - putT1;

      const iv2Squared0 = (v1 * v1 * (T2 - T1) + T1 * v1 * v1) / T2;
      const requiredIV20 = Math.sqrt(Math.max(0, iv2Squared0));
      
      const callT2At0 = getOptionPrice(S, K, T2, r, requiredIV20, q, true);
      const callCalendarSpreadAt0 = callT2At0 - callT1;
      
      const putT2At0 = getOptionPrice(S, K, T2, r, requiredIV20, q, false);
      const putCalendarSpreadAt0 = putT2At0 - putT1;

      setResult({
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
        timestamp: new Date().toLocaleString('en-US')
      });

    } catch (err) {
      setResult({ error: 'Error: ' + err.message });
    }
  };

  const getFFColor = (ff) => {
    const ffNum = parseFloat(ff);
    if (ffNum >= 30) return 'bg-green-100 border-green-500 text-green-900';
    if (ffNum >= 16) return 'bg-yellow-100 border-yellow-500 text-yellow-900';
    return darkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-300 text-gray-900';
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

              <div>
                <label className="block text-sm font-semibold mb-2">Expiration 1</label>
                <input
                  type="date"
                  value={date1}
                  onChange={(e) => setDate1(e.target.value)}
                  className={`w-full px-4 py-2 border-2 rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-blue-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Expiration 2</label>
                <input
                  type="date"
                  value={date2}
                  onChange={(e) => setDate2(e.target.value)}
                  className={`w-full px-4 py-2 border-2 rounded-lg ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-blue-300'
                  }`}
                />
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
                          <p className="text-xs mb-1 opacity-75">Forward Factor</p>
                          <p className="text-3xl font-bold">{result.forwardFactor}%</p>
                          <p className="text-xs mt-2 opacity-75">
                            {parseFloat(result.forwardFactor) >= 30 ? '✓ RECOMMENDED' : parseFloat(result.forwardFactor) >= 16 ? '✓ Good' : 'Below threshold'}
                          </p>
                        </div>
                      </div>

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
