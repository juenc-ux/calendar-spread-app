import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Settings, 
  RefreshCw, 
  Download, 
  Bookmark, 
  History, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Percent,
  Calendar,
  Target,
  Zap,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  X,
  Plus,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

export default function ForwardVolCalculator() {
  // Core calculation state
  const [ticker, setTicker] = useState('');
  const [spotPrice, setSpotPrice] = useState('');
  const [strikePrice, setStrikePrice] = useState('');
  const [date1, setDate1] = useState('2025-10-24');
  const [date2, setDate2] = useState('2025-10-31');
  const [iv1, setIv1] = useState('50');
  const [iv2, setIv2] = useState('40');
  const [riskFreeRate, setRiskFreeRate] = useState('4');
  const [dividend, setDividend] = useState('0');
  
  // Results state
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState('calculator');
  const [showSettings, setShowSettings] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  // Trading data state
  const [currentPrice, setCurrentPrice] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [volatilityData, setVolatilityData] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  
  // Watchlist and history
  const [watchlist, setWatchlist] = useState([]);
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [recentTickers, setRecentTickers] = useState([]);
  
  // Advanced features
  const [pricingModel, setPricingModel] = useState('blackscholes');
  const [greeks, setGreeks] = useState(null);
  const [riskMetrics, setRiskMetrics] = useState(null);
  const [scenarioAnalysis, setScenarioAnalysis] = useState(null);

  // Popular tickers for quick access
  const popularTickers = [
    'SPY', 'QQQ', 'IWM', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA',
    'AMD', 'NFLX', 'PLTR', 'COIN', 'SQ', 'SNOW', 'CRM', 'ADBE', 'ORCL', 'INTC'
  ];

  // Black-Scholes calculation
  const calculateBlackScholes = (S, K, T, r, sigma, optionType) => {
    if (T <= 0) return 0;
    
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    
    const normalCDF = (x) => {
      return 0.5 * (1 + erf(x / Math.sqrt(2)));
    };
    
    const erf = (x) => {
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;
      
      const sign = x >= 0 ? 1 : -1;
      x = Math.abs(x);
      
      const t = 1.0 / (1.0 + p * x);
      const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      
      return sign * y;
    };
    
    if (optionType === 'call') {
      return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
    } else {
      return K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
    }
  };

  // Calculate Greeks
  const calculateGreeks = (S, K, T, r, sigma, optionType) => {
    if (T <= 0) return null;
    
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    
    const normalPDF = (x) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    const normalCDF = (x) => 0.5 * (1 + erf(x / Math.sqrt(2)));
    
    const erf = (x) => {
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;
      
      const sign = x >= 0 ? 1 : -1;
      x = Math.abs(x);
      
      const t = 1.0 / (1.0 + p * x);
      const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      
      return sign * y;
    };
    
    const pdf = normalPDF(d1);
    const cdf = normalCDF(d1);
    const cdfNeg = normalCDF(-d1);
    
    let delta, gamma, theta, vega, rho;
    
    if (optionType === 'call') {
      delta = cdf;
      gamma = pdf / (S * sigma * Math.sqrt(T));
      theta = -(S * pdf * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * cdf;
      vega = S * pdf * Math.sqrt(T);
      rho = K * T * Math.exp(-r * T) * cdf;
    } else {
      delta = cdf - 1;
      gamma = pdf / (S * sigma * Math.sqrt(T));
      theta = -(S * pdf * sigma) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * cdfNeg;
      vega = S * pdf * Math.sqrt(T);
      rho = -K * T * Math.exp(-r * T) * cdfNeg;
    }
    
    return { delta, gamma, theta, vega, rho };
  };

  // Main calculation function
  const calculateForwardVol = () => {
    setLoading(true);
    setError(null);
    
    try {
      const S = parseFloat(spotPrice);
      const K = parseFloat(strikePrice);
      const r = parseFloat(riskFreeRate) / 100;
      const q = parseFloat(dividend) / 100;
      
      const date1Obj = new Date(date1);
      const date2Obj = new Date(date2);
      const today = new Date();
      
      const T1 = Math.max(0, (date1Obj - today) / (365 * 24 * 60 * 60 * 1000));
      const T2 = Math.max(0, (date2Obj - today) / (365 * 24 * 60 * 60 * 1000));
      
      if (T1 >= T2) {
        throw new Error('Second expiration must be after first expiration');
      }
      
      if (T1 <= 0) {
        throw new Error('First expiration must be in the future');
      }
      
      const sigma1 = parseFloat(iv1) / 100;
      const sigma2 = parseFloat(iv2) / 100;
      
      // Forward volatility calculation
      const forwardVol = Math.sqrt((sigma2 * sigma2 * T2 - sigma1 * sigma1 * T1) / (T2 - T1));
      
      // Option prices
      const callPrice1 = calculateBlackScholes(S, K, T1, r, sigma1, 'call');
      const putPrice1 = calculateBlackScholes(S, K, T1, r, sigma1, 'put');
      const callPrice2 = calculateBlackScholes(S, K, T2, r, sigma2, 'call');
      const putPrice2 = calculateBlackScholes(S, K, T2, r, sigma2, 'put');
      
      // Calendar spreads
      const callSpread = callPrice1 - callPrice2;
      const putSpread = putPrice2 - putPrice1;
      
      // Greeks for both options
      const greeks1 = calculateGreeks(S, K, T1, r, sigma1, 'call');
      const greeks2 = calculateGreeks(S, K, T2, r, sigma2, 'call');
      
      // Risk metrics
      const maxLoss = Math.max(callSpread, putSpread);
      const breakevenPoints = {
        call: S + callSpread,
        put: S - putSpread
      };
      
      const result = {
        forwardVol: (forwardVol * 100).toFixed(2),
        callPrice1: callPrice1.toFixed(2),
        putPrice1: putPrice1.toFixed(2),
        callPrice2: callPrice2.toFixed(2),
        putPrice2: putPrice2.toFixed(2),
        callSpread: callSpread.toFixed(2),
        putSpread: putSpread.toFixed(2),
        T1: T1.toFixed(4),
        T2: T2.toFixed(4),
        greeks1,
        greeks2,
        riskMetrics: {
          maxLoss: maxLoss.toFixed(2),
          breakevenPoints
        }
      };
      
      setResult(result);
      
      // Add to history
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ticker,
        spotPrice,
        strikePrice,
        date1,
        date2,
        iv1,
        iv2,
        result
      };
      
      setCalculationHistory(prev => [historyEntry, ...prev.slice(0, 49)]);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load demo data
  const loadDemoData = () => {
    setTicker('SPY');
    setSpotPrice('580.25');
    setStrikePrice('580');
    setDate1('2025-10-24');
    setDate2('2025-10-31');
    setIv1('12.5');
    setIv2('11.8');
    setRiskFreeRate('4.5');
    setDividend('1.2');
  };

  // Add to watchlist
  const addToWatchlist = () => {
    if (!ticker || !result) return;
    
    const watchlistEntry = {
      id: Date.now(),
      ticker,
      spotPrice,
      strikePrice,
      date1,
      date2,
      forwardVol: result.forwardVol,
      callSpread: result.callSpread,
      putSpread: result.putSpread,
      timestamp: new Date().toISOString()
    };
    
    setWatchlist(prev => [watchlistEntry, ...prev.filter(item => item.ticker !== ticker)]);
  };

  // Copy result to clipboard
  const copyResult = () => {
    if (!result) return;
    
    const resultText = `
Forward Volatility Calculator Results
====================================
Ticker: ${ticker}
Spot Price: $${spotPrice}
Strike Price: $${strikePrice}
Expiration 1: ${date1}
Expiration 2: ${date2}
IV 1: ${iv1}%
IV 2: ${iv2}%

Results:
--------
Forward Volatility: ${result.forwardVol}%
Call Price 1: $${result.callPrice1}
Put Price 1: $${result.putPrice1}
Call Price 2: $${result.callPrice2}
Put Price 2: $${result.putPrice2}
Call Spread: $${result.callSpread}
Put Spread: $${result.putSpread}
    `.trim();
    
    navigator.clipboard.writeText(resultText);
  };

  return (
    <div className="min-h-screen bg-primary">
      <Analytics />
      
      {/* Header */}
      <header className="border-b border-color bg-secondary">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-blue rounded">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary">Forward Vol Calculator</h1>
                <p className="text-xs text-muted code-font">Professional Options Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-3 py-1 rounded text-sm transition ${
                  activeTab === 'calculator' 
                    ? 'bg-accent-blue text-white' 
                    : 'text-secondary hover:text-primary hover:bg-tertiary'
                }`}
              >
                Calculator
              </button>
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`px-3 py-1 rounded text-sm transition ${
                  activeTab === 'watchlist' 
                    ? 'bg-accent-blue text-white' 
                    : 'text-secondary hover:text-primary hover:bg-tertiary'
                }`}
              >
                Watchlist
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1 rounded text-sm transition ${
                  activeTab === 'history' 
                    ? 'bg-accent-blue text-white' 
                    : 'text-secondary hover:text-primary hover:bg-tertiary'
                }`}
              >
                History
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded hover:bg-tertiary transition"
              >
                {darkMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'calculator' && (
          <div className="trading-grid">
            {/* Input Panel */}
            <div className="trading-card">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-accent-blue" />
                <h2 className="text-lg font-semibold">Parameters</h2>
              </div>
              
              <div className="space-y-4">
                {/* Ticker */}
                <div>
                  <label className="data-label">Ticker Symbol</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value.toUpperCase())}
                      placeholder="e.g., SPY, AAPL"
                      className="trading-input code-font"
                    />
                    <button
                      onClick={loadDemoData}
                      className="trading-button secondary px-3"
                    >
                      Demo
                    </button>
                  </div>
                  
                  {/* Quick ticker buttons */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {popularTickers.slice(0, 10).map(t => (
                      <button
                        key={t}
                        onClick={() => setTicker(t)}
                        className={`px-2 py-1 text-xs rounded transition ${
                          ticker === t 
                            ? 'bg-accent-blue text-white' 
                            : 'bg-tertiary text-secondary hover:bg-border-color'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Price inputs */}
                <div className="trading-grid">
                  <div>
                    <label className="data-label">Spot Price ($)</label>
                    <input
                      type="number"
                      value={spotPrice}
                      onChange={(e) => setSpotPrice(e.target.value)}
                      className="trading-input code-font"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="data-label">Strike Price ($)</label>
                    <input
                      type="number"
                      value={strikePrice}
                      onChange={(e) => setStrikePrice(e.target.value)}
                      className="trading-input code-font"
                      step="0.01"
                    />
                  </div>
                </div>
                
                {/* Date inputs */}
                <div className="trading-grid">
                  <div>
                    <label className="data-label">First Expiration</label>
                    <input
                      type="date"
                      value={date1}
                      onChange={(e) => setDate1(e.target.value)}
                      className="trading-input code-font"
                    />
                  </div>
                  <div>
                    <label className="data-label">Second Expiration</label>
                    <input
                      type="date"
                      value={date2}
                      onChange={(e) => setDate2(e.target.value)}
                      className="trading-input code-font"
                    />
                  </div>
                </div>
                
                {/* IV inputs */}
                <div className="trading-grid">
                  <div>
                    <label className="data-label">IV 1 (%)</label>
                    <input
                      type="number"
                      value={iv1}
                      onChange={(e) => setIv1(e.target.value)}
                      className="trading-input code-font"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="data-label">IV 2 (%)</label>
                    <input
                      type="number"
                      value={iv2}
                      onChange={(e) => setIv2(e.target.value)}
                      className="trading-input code-font"
                      step="0.1"
                    />
                  </div>
                </div>
                
                {/* Rate inputs */}
                <div className="trading-grid">
                  <div>
                    <label className="data-label">Risk-free Rate (%)</label>
                    <input
                      type="number"
                      value={riskFreeRate}
                      onChange={(e) => setRiskFreeRate(e.target.value)}
                      className="trading-input code-font"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="data-label">Dividend Yield (%)</label>
                    <input
                      type="number"
                      value={dividend}
                      onChange={(e) => setDividend(e.target.value)}
                      className="trading-input code-font"
                      step="0.1"
                    />
                  </div>
                </div>
                
                {/* Calculate button */}
                <button
                  onClick={calculateForwardVol}
                  disabled={loading}
                  className="trading-button w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4" />
                      Calculate Forward Vol
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Results Panel */}
            <div className="trading-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-accent-green" />
                  <h2 className="text-lg font-semibold">Results</h2>
                </div>
                {result && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyResult}
                      className="p-1 rounded hover:bg-tertiary transition"
                      title="Copy results"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={addToWatchlist}
                      className="p-1 rounded hover:bg-tertiary transition"
                      title="Add to watchlist"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {error && (
                <div className="status-indicator error mb-4">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              {result ? (
                <div className="space-y-4">
                  {/* Forward Volatility */}
                  <div className="p-4 bg-tertiary rounded border border-accent-blue">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="data-label">Forward Volatility</div>
                        <div className="text-2xl font-bold text-accent-blue code-font">
                          {result.forwardVol}%
                        </div>
                      </div>
                      <TrendingUp className="w-8 h-8 text-accent-blue" />
                    </div>
                  </div>
                  
                  {/* Option Prices */}
                  <div>
                    <h3 className="text-sm font-semibold text-secondary mb-2">Option Prices</h3>
                    <div className="trading-grid">
                      <div className="p-3 bg-tertiary rounded">
                        <div className="data-label">Call 1</div>
                        <div className="data-value positive code-font">${result.callPrice1}</div>
                      </div>
                      <div className="p-3 bg-tertiary rounded">
                        <div className="data-label">Put 1</div>
                        <div className="data-value negative code-font">${result.putPrice1}</div>
                      </div>
                      <div className="p-3 bg-tertiary rounded">
                        <div className="data-label">Call 2</div>
                        <div className="data-value positive code-font">${result.callPrice2}</div>
                      </div>
                      <div className="p-3 bg-tertiary rounded">
                        <div className="data-label">Put 2</div>
                        <div className="data-value negative code-font">${result.putPrice2}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Calendar Spreads */}
                  <div>
                    <h3 className="text-sm font-semibold text-secondary mb-2">Calendar Spreads</h3>
                    <div className="trading-grid">
                      <div className="p-3 bg-tertiary rounded border border-accent-green">
                        <div className="data-label">Call Spread</div>
                        <div className="data-value positive code-font">${result.callSpread}</div>
                      </div>
                      <div className="p-3 bg-tertiary rounded border border-accent-red">
                        <div className="data-label">Put Spread</div>
                        <div className="data-value negative code-font">${result.putSpread}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Greeks */}
                  {result.greeks1 && result.greeks2 && (
                    <div>
                      <h3 className="text-sm font-semibold text-secondary mb-2">Greeks (Call Options)</h3>
                      <div className="trading-table">
                        <thead>
                          <tr>
                            <th>Greek</th>
                            <th>Option 1</th>
                            <th>Option 2</th>
                            <th>Spread</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="code-font">Delta</td>
                            <td className="code-font">{result.greeks1.delta.toFixed(4)}</td>
                            <td className="code-font">{result.greeks2.delta.toFixed(4)}</td>
                            <td className="code-font">{(result.greeks1.delta - result.greeks2.delta).toFixed(4)}</td>
                          </tr>
                          <tr>
                            <td className="code-font">Gamma</td>
                            <td className="code-font">{result.greeks1.gamma.toFixed(4)}</td>
                            <td className="code-font">{result.greeks2.gamma.toFixed(4)}</td>
                            <td className="code-font">{(result.greeks1.gamma - result.greeks2.gamma).toFixed(4)}</td>
                          </tr>
                          <tr>
                            <td className="code-font">Theta</td>
                            <td className="code-font">{result.greeks1.theta.toFixed(4)}</td>
                            <td className="code-font">{result.greeks2.theta.toFixed(4)}</td>
                            <td className="code-font">{(result.greeks1.theta - result.greeks2.theta).toFixed(4)}</td>
                          </tr>
                          <tr>
                            <td className="code-font">Vega</td>
                            <td className="code-font">{result.greeks1.vega.toFixed(4)}</td>
                            <td className="code-font">{result.greeks2.vega.toFixed(4)}</td>
                            <td className="code-font">{(result.greeks1.vega - result.greeks2.vega).toFixed(4)}</td>
                          </tr>
                        </tbody>
                      </div>
                    </div>
                  )}
                  
                  {/* Risk Metrics */}
                  {result.riskMetrics && (
                    <div>
                      <h3 className="text-sm font-semibold text-secondary mb-2">Risk Analysis</h3>
                      <div className="trading-grid">
                        <div className="p-3 bg-tertiary rounded">
                          <div className="data-label">Max Loss</div>
                          <div className="data-value negative code-font">${result.riskMetrics.maxLoss}</div>
                        </div>
                        <div className="p-3 bg-tertiary rounded">
                          <div className="data-label">Call Breakeven</div>
                          <div className="data-value neutral code-font">${result.riskMetrics.breakevenPoints.call}</div>
                        </div>
                        <div className="p-3 bg-tertiary rounded">
                          <div className="data-label">Put Breakeven</div>
                          <div className="data-value neutral code-font">${result.riskMetrics.breakevenPoints.put}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="w-12 h-12 text-muted mx-auto mb-4" />
                  <p className="text-muted">Enter parameters and calculate to see results</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'watchlist' && (
          <div className="trading-card">
            <div className="flex items-center gap-2 mb-4">
              <Bookmark className="w-4 h-4 text-accent-yellow" />
              <h2 className="text-lg font-semibold">Watchlist</h2>
            </div>
            
            {watchlist.length > 0 ? (
              <div className="trading-table">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Spot</th>
                    <th>Strike</th>
                    <th>Forward Vol</th>
                    <th>Call Spread</th>
                    <th>Put Spread</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map(item => (
                    <tr key={item.id}>
                      <td className="code-font font-semibold">{item.ticker}</td>
                      <td className="code-font">${item.spotPrice}</td>
                      <td className="code-font">${item.strikePrice}</td>
                      <td className="code-font text-accent-blue">{item.forwardVol}%</td>
                      <td className="code-font text-accent-green">${item.callSpread}</td>
                      <td className="code-font text-accent-red">${item.putSpread}</td>
                      <td className="code-font text-muted">{new Date(item.timestamp).toLocaleDateString()}</td>
                      <td>
                        <button className="p-1 rounded hover:bg-tertiary transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </div>
            ) : (
              <div className="text-center py-8">
                <Bookmark className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted">No items in watchlist</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="trading-card">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-accent-purple" />
              <h2 className="text-lg font-semibold">Calculation History</h2>
            </div>
            
            {calculationHistory.length > 0 ? (
              <div className="space-y-2">
                {calculationHistory.map(item => (
                  <div key={item.id} className="p-3 bg-tertiary rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="code-font font-semibold">{item.ticker}</span>
                        <span className="text-muted">•</span>
                        <span className="code-font text-accent-blue">{item.result.forwardVol}%</span>
                      </div>
                      <span className="text-xs text-muted">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted">
                      ${item.spotPrice} → ${item.strikePrice} | {item.date1} → {item.date2}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted">No calculation history</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}