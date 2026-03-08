/**
 * Dashboard Component
 * Displays satellite metrics and information
 */

import React, { useMemo } from 'react';
import { useSatellite } from '../context/SatelliteContext';
import { calculatePosition, ecefToGeodetic, calculateOrbitalPeriod, calculateVelocity } from '../utils/orbitalCalculations';

const Dashboard = () => {
  const { selectedSatellite, timeOffset } = useSatellite();

  // Calculate real-time position based on time offset
  const currentData = useMemo(() => {
    if (!selectedSatellite || !selectedSatellite.details) return null;

    const { details } = selectedSatellite;
    const orbitalElements = {
      semiMajorAxis: details.semiMajorAxis,
      eccentricity: details.eccentricity,
      inclination: details.inclination,
      raan: details.raan,
      argumentOfPerigee: details.argumentOfPerigee,
      meanAnomaly: details.meanAnomaly
    };

    // Calculate position with time offset (simulate real-time movement)
    const position = calculatePosition(orbitalElements, timeOffset * 0.1);
    
    // Convert ECEF to geodetic
    const geodetic = ecefToGeodetic(
      position.position[0],
      position.position[1],
      position.position[2]
    );

    // Calculate orbital period
    const period = calculateOrbitalPeriod(details.semiMajorAxis);

    return {
      ...position,
      geodetic,
      period
    };
  }, [selectedSatellite, timeOffset]);

  if (!selectedSatellite) {
    return (
      <div className="dashboard-panel">
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <svg 
              className="w-16 h-16 mx-auto mb-4 opacity-50" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <p className="text-lg">Select a satellite to view details</p>
            <p className="text-sm mt-2">Click on a satellite in the sidebar or 3D view</p>
          </div>
        </div>
      </div>
    );
  }

  const { details, orbitType } = selectedSatellite;

  const orbitColors = {
    'LEO': { color: '#00ff88', bg: 'rgba(0, 255, 136, 0.1)' },
    'MEO': { color: '#00d4ff', bg: 'rgba(0, 212, 255, 0.1)' },
    'GEO': { color: '#ff6b35', bg: 'rgba(255, 107, 53, 0.1)' },
    'POLAR': { color: '#ff00ff', bg: 'rgba(255, 0, 255, 0.1)' }
  };

  const orbitStyle = orbitColors[orbitType] || orbitColors['LEO'];

  return (
    <div className="dashboard-panel">
      {/* Satellite Info */}
      <div className="flex items-center gap-6 px-6 py-3 border-r border-space-light min-w-[280px]">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: orbitStyle.bg, border: `2px solid ${orbitStyle.color}` }}
        >
          <svg className="w-6 h-6" style={{ color: orbitStyle.color }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        <div>
          <h3 className="font-orbitron font-bold text-white text-lg">
            {selectedSatellite.name}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span 
              className="px-2 py-0.5 rounded text-xs font-semibold"
              style={{ backgroundColor: orbitStyle.bg, color: orbitStyle.color }}
            >
              {orbitType}
            </span>
            <span className="text-gray-400 text-sm">
              NORAD: {selectedSatellite.noradId}
            </span>
          </div>
        </div>
      </div>

      {/* Altitude */}
      <div className="dashboard-metric">
        <span className="data-label mb-1">Altitude</span>
        <span className="data-value text-2xl">
          {currentData?.altitude?.toFixed(1) || details.altitude?.toFixed(1) || '0'}
        </span>
        <span className="text-xs text-gray-500">km</span>
      </div>

      {/* Velocity */}
      <div className="dashboard-metric">
        <span className="data-label mb-1">Velocity</span>
        <span className="data-value text-2xl">
          {currentData?.velocity?.toFixed(2) || '0.00'}
        </span>
        <span className="text-xs text-gray-500">km/s</span>
      </div>

      {/* Orbital Period */}
      <div className="dashboard-metric">
        <span className="data-label mb-1">Period</span>
        <span className="data-value text-2xl">
          {currentData?.period?.toFixed(1) || details.period?.toFixed(1) || '0'}
        </span>
        <span className="text-xs text-gray-500">min</span>
      </div>

      {/* Inclination */}
      <div className="dashboard-metric">
        <span className="data-label mb-1">Inclination</span>
        <span className="data-value text-2xl">
          {details.inclination?.toFixed(1) || '0'}
        </span>
        <span className="text-xs text-gray-500">degrees</span>
      </div>

      {/* Position */}
      <div className="dashboard-metric">
        <span className="data-label mb-1">Position</span>
        <div className="flex flex-col items-center">
          <span className="data-value text-sm">
            {currentData?.geodetic?.lat?.toFixed(2) || '0.00'}°
          </span>
          <span className="data-value text-sm">
            {currentData?.geodetic?.lon?.toFixed(2) || '0.00'}°
          </span>
        </div>
        <span className="text-xs text-gray-500">Lat / Lon</span>
      </div>

      {/* Additional Info */}
      <div className="dashboard-metric">
        <span className="data-label mb-1">Apogee / Perigee</span>
        <div className="flex flex-col items-center">
          <span className="data-value text-sm text-orange-accent">
            {details.apogee?.toFixed(0) || '0'} km
          </span>
          <span className="data-value text-sm text-green-400">
            {details.perigee?.toFixed(0) || '0'} km
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

