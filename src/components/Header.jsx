import React from 'react';
import { Moon, Sun } from 'lucide-react';

const Header = ({ 
  darkMode, 
  setDarkMode, 
  pricingModel, 
  setPricingModel, 
  currentUser, 
  setCurrentUser 
}) => {
  return (
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
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Forward Volatility, Forward Factor & Calendar Spread Pricing
        </p>
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
  );
};

export default Header;