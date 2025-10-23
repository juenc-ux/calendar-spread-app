import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Download, Moon, Sun, Sparkles, Zap, TrendingUp, BarChart3, Calculator, Settings, RefreshCw, ArrowRight, Star, Target, DollarSign } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

export default function ForwardVolCalculator() {
  // State management
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
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
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
              onClick={() => setDarkMode(!darkMode)}
              className="btn-secondary group flex items-center gap-3 text-lg px-8 py-4"
            >
              {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
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

      {/* Main Calculator Section */}
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
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Ticker Symbol</label>
                    <input
                      type="text"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value.toUpperCase())}
                      placeholder="e.g., AAPL, MSFT, TSLA"
                      className="input-field"
                    />
                  </div>
                  
                  {/* Spot Price */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Spot Price ($)</label>
                    <input
                      type="number"
                      value={spotPrice}
                      onChange={(e) => setSpotPrice(e.target.value)}
                      className="input-field"
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
                      className="input-field"
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
                        className="input-field"
                      />
                    </div>
                    
                    {/* Date 2 */}
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Second Expiration</label>
                      <input
                        type="date"
                        value={date2}
                        onChange={(e) => setDate2(e.target.value)}
                        className="input-field"
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
                        className="input-field"
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
                        className="input-field"
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
                        className="input-field"
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
                        className="input-field"
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
                              <div className="text-3xl font-bold gradient-text">{result.forwardVol}%</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Option Prices */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <h4 className="text-sm font-medium text-white/80 mb-2">Call Price 1</h4>
                            <div className="text-xl font-bold text-green-400">${result.callPrice1}</div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <h4 className="text-sm font-medium text-white/80 mb-2">Put Price 1</h4>
                            <div className="text-xl font-bold text-red-400">${result.putPrice1}</div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <h4 className="text-sm font-medium text-white/80 mb-2">Call Price 2</h4>
                            <div className="text-xl font-bold text-green-400">${result.callPrice2}</div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <h4 className="text-sm font-medium text-white/80 mb-2">Put Price 2</h4>
                            <div className="text-xl font-bold text-red-400">${result.putPrice2}</div>
                          </div>
                        </div>
                        
                        {/* Calendar Spreads */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30">
                            <h4 className="text-sm font-medium text-white/80 mb-2">Call Spread</h4>
                            <div className="text-xl font-bold text-green-400">${result.callSpread}</div>
                          </div>
                          <div className="p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl border border-red-500/30">
                            <h4 className="text-sm font-medium text-white/80 mb-2">Put Spread</h4>
                            <div className="text-xl font-bold text-red-400">${result.putSpread}</div>
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

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Why Choose Our</span>
              <br />
              <span className="gradient-text-secondary">Calculator?</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Advanced features designed for professional traders and options enthusiasts
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="scale-in glass-card text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">Lightning Fast</h3>
              <p className="text-white/70">Instant calculations with real-time updates and smooth animations</p>
            </div>
            
            <div className="scale-in glass-card text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text-secondary">Precision</h3>
              <p className="text-white/70">Advanced Black-Scholes modeling for accurate forward volatility calculations</p>
            </div>
            
            <div className="scale-in glass-card text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text-accent">Beautiful Design</h3>
              <p className="text-white/70">Stunning glassmorphism UI with smooth animations and modern aesthetics</p>
            </div>
          </div>
        </div>
      </section>

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