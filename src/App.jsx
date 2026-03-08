/**
 * Main App Component
 * Satellite Orbit and Trajectory Visualizer
 */

import React, { useState, useEffect } from 'react';
import { SatelliteProvider, useSatellite } from './context/SatelliteContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import EarthCanvas from './components/Earth';
import Dashboard from './components/Dashboard';
import TrajectoryCalculator from './components/TrajectoryCalculator';
import { satelliteApi } from './services/api';

/**
 * Main App Content
 */
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { 
    satellites, 
    selectedSatellite, 
    selectSatellite, 
    loading, 
    error,
    seedDatabase 
  } = useSatellite();

  // Auto-seed on first load if no data
  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const response = await satelliteApi.getAll(1, 1);
        if (!response.data || response.data.length === 0) {
          await seedDatabase();
        }
      } catch (err) {
        console.log('Will seed on first use');
      }
    };
    checkAndSeed();
  }, []);

  const renderMainContent = () => {
    switch (activeTab) {
      case 'trajectory':
        return <TrajectoryCalculator />;
      case 'orbits':
      case 'dashboard':
      default:
        return (
          <div className="flex-1 relative">
            {/* 3D Earth Viewport */}
            <div className="absolute inset-0">
              <EarthCanvas 
                satellites={satellites}
                selectedSatellite={selectedSatellite}
                onSatelliteClick={selectSatellite}
              />
            </div>
            
            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-space-black/50 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="loading-spinner mx-auto mb-4" />
                  <p className="text-cyan-electric">Loading satellite data...</p>
                </div>
              </div>
            )}

            {/* Error Overlay */}
            {error && (
              <div className="absolute top-4 right-4 p-4 bg-red-500/20 border border-red-500 rounded-lg z-10 max-w-md">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Legend */}
            <div className="absolute top-4 right-4 p-3 bg-space-dark/80 backdrop-blur-sm rounded-lg border border-space-light z-10">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">Orbit Types</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-leo" />
                  <span className="text-gray-300">LEO (Low Earth)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-cyan-meo" />
                  <span className="text-gray-300">MEO (Medium Earth)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-orange-geo" />
                  <span className="text-gray-300">GEO (Geostationary)</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-magenta-polar" />
                  <span className="text-gray-300">Polar</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-space-black">
      {/* Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Sidebar (only for dashboard views) */}
      {activeTab !== 'trajectory' && <Sidebar />}

      {/* Main Content */}
      <main 
        className={`absolute top-16 transition-all duration-300 
          ${activeTab === 'trajectory' ? 'left-0 right-0 bottom-0' : 'left-72 right-0 bottom-48'}`}
      >
        {renderMainContent()}
      </main>

      {/* Dashboard Panel (only for dashboard views) */}
      {activeTab !== 'trajectory' && <Dashboard />}
    </div>
  );
};

/**
 * App Wrapper with Providers
 */
const App = () => {
  return (
    <SatelliteProvider>
      <AppContent />
    </SatelliteProvider>
  );
};

export default App;

