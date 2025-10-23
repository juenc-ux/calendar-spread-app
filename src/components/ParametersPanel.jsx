import React from 'react';

const ParametersPanel = ({
  apiKey,
  setApiKey,
  ticker,
  handleTickerChange,
  showTickerDropdown,
  setShowTickerDropdown,
  filteredTickers,
  selectTicker,
  fetchOptionData,
  loading,
  loadError,
  recentTickers,
  setTicker,
  loadDemoData,
  marketCap,
  avgOptionsVolume,
  nextEarningsDate,
  earningsTime,
  darkMode,
  date1,
  setDate1,
  date2,
  setDate2,
  availableExpirations,
  iv1,
  setIv1,
  iv2,
  setIv2,
  spotPrice,
  setSpotPrice,
  strikePrice,
  setStrikePrice,
  riskFreeRate,
  setRiskFreeRate,
  dividend,
  setDividend
}) => {
  return (
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
                ? 'bg-slate-600 hover:bg-slate-700 text-white'
                : 'bg-slate-500 hover:bg-slate-600 text-white'
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
                          : `${Math.abs(daysAway)} days ago`
                      }
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Date Selection */}
      <div>
        <label className="block text-sm font-semibold mb-2">Expiration 1 (Front Month)</label>
        <select
          value={date1}
          onChange={(e) => setDate1(e.target.value)}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            darkMode
              ? 'bg-gray-700 border-gray-600 focus:border-blue-400'
              : 'bg-white border-blue-300 focus:border-blue-500'
          }`}
        >
          {availableExpirations.map((date) => {
            const dte = Math.floor((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
            return (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} ({dte} DTE)
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Expiration 2 (Back Month)</label>
        <select
          value={date2}
          onChange={(e) => setDate2(e.target.value)}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            darkMode
              ? 'bg-gray-700 border-gray-600 focus:border-blue-400'
              : 'bg-white border-blue-300 focus:border-blue-500'
          }`}
        >
          {availableExpirations.map((date) => {
            const dte = Math.floor((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
            return (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} ({dte} DTE)
              </option>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">IV 1 (Front Month) %</label>
        <input
          type="number"
          value={iv1}
          onChange={(e) => setIv1(e.target.value)}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            darkMode
              ? 'bg-gray-700 border-gray-600 focus:border-blue-400'
              : 'bg-white border-blue-300 focus:border-blue-500'
          }`}
          placeholder="e.g. 25.5"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">IV 2 (Back Month) %</label>
        <input
          type="number"
          value={iv2}
          onChange={(e) => setIv2(e.target.value)}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            darkMode
              ? 'bg-gray-700 border-gray-600 focus:border-blue-400'
              : 'bg-white border-blue-300 focus:border-blue-500'
          }`}
          placeholder="e.g. 20.0"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Spot Price $</label>
        <input
          type="number"
          value={spotPrice}
          onChange={(e) => setSpotPrice(e.target.value)}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            darkMode
              ? 'bg-gray-700 border-gray-600 focus:border-blue-400'
              : 'bg-white border-blue-300 focus:border-blue-500'
          }`}
          placeholder="e.g. 100.00"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Strike Price $</label>
        <input
          type="number"
          value={strikePrice}
          onChange={(e) => setStrikePrice(e.target.value)}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            darkMode
              ? 'bg-gray-700 border-gray-600 focus:border-blue-400'
              : 'bg-white border-blue-300 focus:border-blue-500'
          }`}
          placeholder="e.g. 100.00"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Risk-Free Rate %</label>
        <input
          type="number"
          value={riskFreeRate}
          onChange={(e) => setRiskFreeRate(e.target.value)}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            darkMode
              ? 'bg-gray-700 border-gray-600 focus:border-blue-400'
              : 'bg-white border-blue-300 focus:border-blue-500'
          }`}
          placeholder="e.g. 4.0"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Dividend Yield %</label>
        <input
          type="number"
          value={dividend}
          onChange={(e) => setDividend(e.target.value)}
          className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
            darkMode
              ? 'bg-gray-700 border-gray-600 focus:border-blue-400'
              : 'bg-white border-blue-300 focus:border-blue-500'
          }`}
          placeholder="e.g. 1.5"
        />
      </div>
    </div>
  );
};

export default ParametersPanel;