import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Download, Moon, Sun, Sparkles, Zap, TrendingUp, BarChart3, Calculator, Settings, RefreshCw, ArrowRight, Star, Target, DollarSign, Search, X, Plus, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock, Users, Bookmark, History, Filter, Download as DownloadIcon } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

export default function ForwardVolCalculator() {
  // All original state variables
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
  const [minOpenInterest, setMinOpenInterest] = useState(100);
  const [minVolume, setMinVolume] = useState(0);
  const [maxDTEGap, setMaxDTEGap] = useState(200);
  const [recentTickers, setRecentTickers] = useState(() => {
    const saved = localStorage.getItem(`recentTickers_${currentUser}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem(`watchlist_${currentUser}`);
    return saved ? JSON.parse(saved) : [];
  });
  
  // UI state
  const [activeTab, setActiveTab] = useState('calculator');
  const [showSettings, setShowSettings] = useState(false);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Animation refs
  const heroRef = useRef(null);
  const cardsRef = useRef([]);
  const [isVisible, setIsVisible] = useState({});

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

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Reload user-specific data when user changes
  useEffect(() => {
    const savedWatchlist = localStorage.getItem(`watchlist_${currentUser}`);
    const savedRecent = localStorage.getItem(`recentTickers_${currentUser}`);
    setWatchlist(savedWatchlist ? JSON.parse(savedWatchlist) : []);
    setRecentTickers(savedRecent ? JSON.parse(savedRecent) : []);
  }, [currentUser]);

  // Black-Scholes calculation
  const calculateBlackScholes = (S, K, T, r, sigma, optionType) => {
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    
    const normalCDF = (x) => {
      return 0.5 * (1 + erf(x / Math.sqrt(2)));
    };
    
    const erf = (x) => {
      const a1 =  0.254829592;
      const a2 = -0.284496736;
      const a3 =  1.421413741;
      const a4 = -1.453152027;
      const a5 =  1.061405429;
      const p  =  0.3275911;
      
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

  // Calculate forward volatility
  const calculateForwardVol = () => {
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
      setResult({ error: 'Second expiration must be after first expiration' });
      return;
    }
    
    const sigma1 = parseFloat(iv1) / 100;
    const sigma2 = parseFloat(iv2) / 100;
    
    // Forward volatility formula
    const forwardVol = Math.sqrt((sigma2 * sigma2 * T2 - sigma1 * sigma1 * T1) / (T2 - T1));
    
    // Calculate option prices
    const callPrice1 = calculateBlackScholes(S, K, T1, r, sigma1, 'call');
    const putPrice1 = calculateBlackScholes(S, K, T1, r, sigma1, 'put');
    const callPrice2 = calculateBlackScholes(S, K, T2, r, sigma2, 'call');
    const putPrice2 = calculateBlackScholes(S, K, T2, r, sigma2, 'put');
    
    // Calendar spread values
    const callSpread = callPrice1 - callPrice2;
    const putSpread = putPrice2 - putPrice1;
    
    setResult({
      forwardVol: (forwardVol * 100).toFixed(2),
      callPrice1: callPrice1.toFixed(2),
      putPrice1: putPrice1.toFixed(2),
      callPrice2: callPrice2.toFixed(2),
      putPrice2: putPrice2.toFixed(2),
      callSpread: callSpread.toFixed(2),
      putSpread: putSpread.toFixed(2),
      T1: T1.toFixed(4),
      T2: T2.toFixed(4)
    });
  };

  // Ticker handling functions
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
    setTicker('SPY');
    setSpotPrice('580.25');
    setStrikePrice('580');
    setDate1('2025-10-24');
    setDate2('2025-10-31');
    setIv1('12.5');
    setIv2('11.8');
    setRiskFreeRate('4.5');
    setDividend('1.2');
    setTimeout(() => calculateForwardVol(), 100);
  };

  // Add ticker to recent tickers list
  const addToRecentTickers = (symbol) => {
    const upperSymbol = symbol.toUpperCase().trim();
    const updated = [upperSymbol, ...recentTickers.filter(t => t !== upperSymbol)].slice(0, 6);
    setRecentTickers(updated);
    localStorage.setItem(`recentTickers_${currentUser}`, JSON.stringify(updated));
  };

  // Particle system
  const ParticleSystem = () => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random() * 0.5 + 0.1
      }));
      setParticles(newParticles);
    }, []);

    return (
      <div className="particles">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              animationDelay: `${particle.id * 0.5}s`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark-mode' : ''}`}>
      <Analytics />
      <ParticleSystem />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">Forward Vol Calculator</h1>
                <p className="text-sm text-white/60 code-font">Advanced Options Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'calculator' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                Calculator
              </button>
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'watchlist' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                Watchlist
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'history' 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                History
              </button>
              
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                {darkMode ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20">
        {activeTab === 'calculator' && (
          <>
            {/* Hero Section */}
            <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20"></div>
              
              <div className="relative z-10 text-center max-w-6xl mx-auto px-6">
                <div className="fade-in">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 mb-8 border border-white/20">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-medium">Advanced Options Calculator</span>
                  </div>
                </div>
                
                <h1 className="fade-in text-6xl md:text-8xl font-bold mb-6">
                  <span className="gradient-text">Forward Volatility</span>
                  <br />
                  <span className="gradient-text-secondary">Calculator</span>
                </h1>
                
                <p className="fade-in text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Calculate forward volatility and calendar spread strategies with precision. 
                  Advanced Black-Scholes modeling meets beautiful design.
                </p>
                
                <div className="fade-in flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button 
                    onClick={calculateForwardVol}
                    className="btn-primary group flex items-center gap-3 text-lg px-8 py-4"
                  >
                    <Calculator className="w-6 h-6" />
                    Calculate Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button 
                    onClick={loadDemoData}
                    className="btn-secondary group flex items-center gap-3 text-lg px-8 py-4"
                  >
                    <RefreshCw className="w-6 h-6" />
                    Load Demo Data
                  </button>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-20 left-10 animate-bounce-slow">
                <div className="glass w-16 h-16 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div className="absolute bottom-20 right-10 animate-bounce-slow" style={{ animationDelay: '1s' }}>
                <div className="glass w-20 h-20 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-purple-400" />
                </div>
              </div>
              
              <div className="absolute top-1/2 left-20 animate-bounce-slow" style={{ animationDelay: '2s' }}>
                <div className="glass w-12 h-12 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-pink-400" />
                </div>
              </div>
            </section>

            {/* Calculator Section */}
            <section className="relative py-20 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                  
                  {/* Input Panel */}
                  <div className="slide-in-left">
                    <div className="glass-card">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                          <Settings className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold gradient-text">Parameters</h2>
                          <p className="text-white/60">Enter your trading parameters</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        {/* Ticker Input */}
                        <div className="relative">
                          <label className="block text-sm font-medium text-white/80 mb-2">Ticker Symbol</label>
                          <input
                            type="text"
                            value={ticker}
                            onChange={(e) => handleTickerChange(e.target.value)}
                            placeholder="e.g., AAPL, MSFT, TSLA"
                            className="input-field code-font"
                          />
                          {showTickerDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 glass rounded-xl border border-white/20 max-h-60 overflow-y-auto z-10">
                              {filteredTickers.map((stock) => (
                                <button
                                  key={stock.symbol}
                                  onClick={() => selectTicker(stock.symbol)}
                                  className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                                >
                                  <div className="font-semibold text-white">{stock.symbol}</div>
                                  <div className="text-sm text-white/60">{stock.name}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Spot Price */}
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">Spot Price ($)</label>
                          <input
                            type="number"
                            value={spotPrice}
                            onChange={(e) => setSpotPrice(e.target.value)}
                            className="input-field code-font"
                            step="0.01"
                          />
                        </div>
                        
                        {/* Strike Price */}
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-2">Strike Price ($)</label>
                          <input
                            type="number"
                            value={strikePrice}
                            onChange={(e) => setStrikePrice(e.target.value)}
                            className="input-field code-font"
                            step="0.01"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Date 1 */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">First Expiration</label>
                            <input
                              type="date"
                              value={date1}
                              onChange={(e) => setDate1(e.target.value)}
                              className="input-field code-font"
                            />
                          </div>
                          
                          {/* Date 2 */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Second Expiration</label>
                            <input
                              type="date"
                              value={date2}
                              onChange={(e) => setDate2(e.target.value)}
                              className="input-field code-font"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* IV 1 */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">IV 1 (%)</label>
                            <input
                              type="number"
                              value={iv1}
                              onChange={(e) => setIv1(e.target.value)}
                              className="input-field code-font"
                              step="0.1"
                            />
                          </div>
                          
                          {/* IV 2 */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">IV 2 (%)</label>
                            <input
                              type="number"
                              value={iv2}
                              onChange={(e) => setIv2(e.target.value)}
                              className="input-field code-font"
                              step="0.1"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Risk-free Rate */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Risk-free Rate (%)</label>
                            <input
                              type="number"
                              value={riskFreeRate}
                              onChange={(e) => setRiskFreeRate(e.target.value)}
                              className="input-field code-font"
                              step="0.1"
                            />
                          </div>
                          
                          {/* Dividend */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">Dividend Yield (%)</label>
                            <input
                              type="number"
                              value={dividend}
                              onChange={(e) => setDividend(e.target.value)}
                              className="input-field code-font"
                              step="0.1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Results Panel */}
                  <div className="slide-in-right">
                    <div className="glass-card">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold gradient-text-accent">Results</h2>
                          <p className="text-white/60">Forward volatility analysis</p>
                        </div>
                      </div>
                      
                      {result ? (
                        <div className="space-y-6">
                          {result.error ? (
                            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200">
                              {result.error}
                            </div>
                          ) : (
                            <>
                              {/* Forward Volatility */}
                              <div className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold text-white">Forward Volatility</h3>
                                    <p className="text-white/60">Expected volatility between expirations</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-3xl font-bold gradient-text code-font">{result.forwardVol}%</div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Option Prices */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                  <h4 className="text-sm font-medium text-white/80 mb-2">Call Price 1</h4>
                                  <div className="text-xl font-bold text-green-400 code-font">${result.callPrice1}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                  <h4 className="text-sm font-medium text-white/80 mb-2">Put Price 1</h4>
                                  <div className="text-xl font-bold text-red-400 code-font">${result.putPrice1}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                  <h4 className="text-sm font-medium text-white/80 mb-2">Call Price 2</h4>
                                  <div className="text-xl font-bold text-green-400 code-font">${result.callPrice2}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                  <h4 className="text-sm font-medium text-white/80 mb-2">Put Price 2</h4>
                                  <div className="text-xl font-bold text-red-400 code-font">${result.putPrice2}</div>
                                </div>
                              </div>
                              
                              {/* Calendar Spreads */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                                  <h4 className="text-sm font-medium text-white/80 mb-2">Call Spread</h4>
                                  <div className="text-xl font-bold text-green-400 code-font">${result.callSpread}</div>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl border border-red-500/30">
                                  <h4 className="text-sm font-medium text-white/80 mb-2">Put Spread</h4>
                                  <div className="text-xl font-bold text-red-400 code-font">${result.putSpread}</div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                            <Calculator className="w-8 h-8 text-white/60" />
                          </div>
                          <p className="text-white/60">Enter parameters and click calculate to see results</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'watchlist' && (
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="glass-card">
                <h2 className="text-3xl font-bold gradient-text mb-8">Watchlist</h2>
                <p className="text-white/60">Your saved tickers and calculations will appear here.</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'history' && (
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="glass-card">
                <h2 className="text-3xl font-bold gradient-text mb-8">Calculation History</h2>
                <p className="text-white/60">Your calculation history will appear here.</p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <DollarSign className="w-6 h-6 text-green-400" />
            <span className="text-xl font-bold gradient-text">Forward Volatility Calculator</span>
          </div>
          <p className="text-white/60">Professional options trading tools with beautiful design</p>
        </div>
      </footer>
    </div>
  );
}