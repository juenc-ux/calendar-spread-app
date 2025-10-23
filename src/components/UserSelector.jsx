import React from 'react';

const UserSelector = ({ currentUser, setCurrentUser, darkMode }) => {
  return (
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
  );
};

export default UserSelector;