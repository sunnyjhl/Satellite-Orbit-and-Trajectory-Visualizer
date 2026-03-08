/**
 * Header Component
 * Navigation header with logo and current time
 */

import React, { useState, useEffect } from 'react';

const Header = ({ activeTab, setActiveTab }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC'
    }) + ' UTC';
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'orbits', label: 'Orbits', icon: '🛰️' },
    { id: 'trajectory', label: 'Trajectory', icon: '🚀' }
  ];

  return (
    <header className="header">
      {/* Logo and Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <svg 
            className="w-8 h-8 text-cyan-electric" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <h1 className="text-xl font-orbitron font-bold text-white tracking-wider">
            SATELLITE<span className="text-cyan-electric">VIS</span>
          </h1>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-300 
              ${activeTab === tab.id 
                ? 'bg-cyan-electric/20 text-cyan-electric border border-cyan-electric/50' 
                : 'text-gray-400 hover:text-white hover:bg-space-light'
              }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Time Display */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-roboto-mono text-lg text-cyan-electric">
            {formatTime(currentTime)}
          </div>
          <div className="text-xs text-gray-400">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

