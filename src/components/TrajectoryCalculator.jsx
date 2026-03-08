/**
 * Trajectory Calculator Component
 * Launch simulation and trajectory planning
 */

import React, { useState } from 'react';
import { trajectoryApi } from '../services/api';

const TrajectoryCalculator = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [params, setParams] = useState({
    name: '',
    launchLat: 28.5721,    // Kennedy Space Center
    launchLong: -80.6480,
    targetAltitude: 400,
    inclination: 51.6,
    azimuth: 90
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: name === 'name' ? value : parseFloat(value)
    }));
    setError(null);
  };

  const calculateTrajectory = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await trajectoryApi.calculate(params);
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error || 'Failed to calculate trajectory');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const presetLaunchSites = [
    { name: 'Kennedy Space Center', lat: 28.5721, long: -80.6480 },
    { name: 'Vandenberg AFB', lat: 34.7422, long: -120.5722 },
    { name: 'Cape Canaveral', lat: 28.3922, long: -80.6077 },
    { name: 'Baikonur', lat: 45.9646, long: 63.3052 },
    { name: 'Kourou', lat: 5.2364, long: -52.7692 }
  ];

  const handlePresetSelect = (site) => {
    setParams(prev => ({
      ...prev,
      launchLat: site.lat,
      launchLong: site.long
    }));
  };

  const orbitPresets = [
    { name: 'LEO', altitude: 400, inclination: 51.6 },
    { name: 'Sun-Sync', altitude: 800, inclination: 98.2 },
    { name: 'GEO Transfer', altitude: 35786, inclination: 0 },
    { name: 'Polar', altitude: 700, inclination: 90 }
  ];

  const handleOrbitPreset = (preset) => {
    setParams(prev => ({
      ...prev,
      targetAltitude: preset.altitude,
      inclination: preset.inclination
    }));
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-orbitron font-bold text-white mb-6">
          🚀 Launch Trajectory Calculator
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="card">
            <h3 className="text-lg font-semibold text-cyan-electric mb-4">
              Launch Parameters
            </h3>

            {/* Mission Name */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Mission Name (Optional)
              </label>
              <input
                type="text"
                name="name"
                value={params.name}
                onChange={handleInputChange}
                placeholder="Enter mission name"
                className="input-field"
              />
            </div>

            {/* Launch Site Presets */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Quick Select Launch Site
              </label>
              <div className="flex flex-wrap gap-2">
                {presetLaunchSites.map(site => (
                  <button
                    key={site.name}
                    onClick={() => handlePresetSelect(site)}
                    className={`px-3 py-1 text-xs rounded transition-all
                      ${params.launchLat === site.lat && params.launchLong === site.long
                        ? 'bg-cyan-electric text-space-black'
                        : 'bg-space-light text-gray-300 hover:bg-cyan-electric/20'
                      }`}
                  >
                    {site.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Launch Coordinates */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Launch Latitude
                </label>
                <input
                  type="number"
                  name="launchLat"
                  value={params.launchLat}
                  onChange={handleInputChange}
                  step="0.0001"
                  min="-90"
                  max="90"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Launch Longitude
                </label>
                <input
                  type="number"
                  name="launchLong"
                  value={params.launchLong}
                  onChange={handleInputChange}
                  step="0.0001"
                  min="-180"
                  max="180"
                  className="input-field"
                />
              </div>
            </div>

            {/* Target Altitude */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Target Altitude (km)
              </label>
              <input
                type="number"
                name="targetAltitude"
                value={params.targetAltitude}
                onChange={handleInputChange}
                min="100"
                max="40000"
                className="input-field"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {orbitPresets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => handleOrbitPreset(preset)}
                    className={`px-3 py-1 text-xs rounded transition-all
                      ${params.targetAltitude === preset.altitude
                        ? 'bg-cyan-electric text-space-black'
                        : 'bg-space-light text-gray-300 hover:bg-cyan-electric/20'
                      }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Inclination */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">
                Inclination (degrees)
              </label>
              <input
                type="number"
                name="inclination"
                value={params.inclination}
                onChange={handleInputChange}
                min="0"
                max="180"
                step="0.1"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                0° = Equatorial, 90° = Polar
              </p>
            </div>

            {/* Azimuth */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Launch Azimuth (degrees)
              </label>
              <input
                type="number"
                name="azimuth"
                value={params.azimuth}
                onChange={handleInputChange}
                min="0"
                max="360"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                90° = East, 180° = South
              </p>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateTrajectory}
              disabled={loading}
              className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading-spinner w-4 h-4" />
                  Calculating...
                </span>
              ) : (
                '🚀 Calculate Trajectory'
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="card">
            <h3 className="text-lg font-semibold text-cyan-electric mb-4">
              Simulation Results
            </h3>

            {result ? (
              <div className="space-y-4">
                {/* Mission Info */}
                <div className="p-3 bg-space-light rounded">
                  <p className="text-sm text-gray-400">Mission</p>
                  <p className="text-white font-semibold">
                    {result.trajectory.name || 'Unnamed Mission'}
                  </p>
                </div>

                {/* Results */}
                {result.calculated.results && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-space-light rounded">
                        <p className="text-xs text-gray-400">Est. Duration</p>
                        <p className="text-cyan-electric font-semibold">
                          {(result.calculated.results.estimatedDuration / 60).toFixed(1)} min
                        </p>
                      </div>
                      <div className="p-3 bg-space-light rounded">
                        <p className="text-xs text-gray-400">Max Velocity</p>
                        <p className="text-orange-accent font-semibold">
                          {result.calculated.results.maxVelocity.toFixed(2)} km/s
                        </p>
                      </div>
                      <div className="p-3 bg-space-light rounded">
                        <p className="text-xs text-gray-400">Fuel Required</p>
                        <p className="text-purple-accent font-semibold">
                          {result.calculated.results.fuelRequired.toFixed(0)} kg
                        </p>
                      </div>
                      <div className="p-3 bg-space-light rounded">
                        <p className="text-xs text-gray-400">Success Prob.</p>
                        <p className="text-green-400 font-semibold">
                          {result.calculated.results.successProbability.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Launch Parameters Summary */}
                    <div className="p-4 bg-space-light rounded">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3">
                        Launch Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Launch Site:</span>
                          <span className="text-white">
                            {params.launchLat.toFixed(4)}°, {params.launchLong.toFixed(4)}°
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Target Orbit:</span>
                          <span className="text-cyan-electric">
                            {params.targetAltitude} km
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Inclination:</span>
                          <span className="text-white">
                            {params.inclination}°
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Azimuth:</span>
                          <span className="text-white">
                            {params.azimuth}°
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trajectory Preview */}
                    <div className="p-4 bg-space-light rounded">
                      <h4 className="text-sm font-semibold text-gray-300 mb-3">
                        Trajectory Points
                      </h4>
                      <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-400 border-b border-space-light">
                              <th className="text-left py-1">Pt</th>
                              <th className="text-right py-1">Alt (km)</th>
                              <th className="text-right py-1">Vel (km/s)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.calculated.trajectoryPoints.slice(0, 20).map((point, i) => (
                              <tr key={i} className="border-b border-space-light/50">
                                <td className="py-1 text-gray-400">{i + 1}</td>
                                <td className="text-right text-cyan-electric">{point.altitude.toFixed(0)}</td>
                                <td className="text-right text-orange-accent">{point.velocity.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {result.calculated.trajectoryPoints.length > 20 && (
                          <p className="text-xs text-gray-500 mt-2 text-center">
                            ... and {result.calculated.trajectoryPoints.length - 20} more points
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg 
                  className="w-16 h-16 mb-4 opacity-50" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p>Enter parameters and click calculate</p>
                <p className="text-sm mt-2">to see trajectory simulation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrajectoryCalculator;

