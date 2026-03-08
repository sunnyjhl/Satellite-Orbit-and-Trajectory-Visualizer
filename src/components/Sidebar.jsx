/**
 * Sidebar Component
 * Satellite list with search and orbit type filters
 */

import React, { useState, useEffect } from 'react';
import { useSatellite } from '../context/SatelliteContext';

const Sidebar = () => {
  const {
    satellites,
    selectedSatellite,
    orbitFilters,
    searchQuery,
    loading,
    setSearchQuery,
    searchSatellites,
    selectSatellite,
    toggleOrbitFilter,
    seedDatabase
  } = useSatellite();

  const [localSearch, setLocalSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch) {
        setSearchQuery(localSearch);
        searchSatellites(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleSearchChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const orbitTypes = [
    { id: 'LEO', label: 'LEO', color: '#00ff88', description: 'Low Earth Orbit' },
    { id: 'MEO', label: 'MEO', color: '#00d4ff', description: 'Medium Earth Orbit' },
    { id: 'GEO', label: 'GEO', color: '#ff6b35', description: 'Geostationary' },
    { id: 'POLAR', label: 'Polar', color: '#ff00ff', description: 'Polar Orbit' }
  ];

  return (
    <aside className="sidebar">
      {/* Search */}
      <div className="p-4 border-b border-space-light">
        <div className="relative">
          <input
            type="text"
            placeholder="Search satellites..."
            value={localSearch}
            onChange={handleSearchChange}
            className="input-field pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Orbit Type Filters */}
      <div className="p-4 border-b border-space-light">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Orbit Types</h3>
        <div className="space-y-2">
          {orbitTypes.map(type => (
            <label
              key={type.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={orbitFilters[type.id]}
                  onChange={() => toggleOrbitFilter(type.id)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 border-2 rounded transition-all duration-200
                    ${orbitFilters[type.id] 
                      ? 'bg-cyan-electric border-cyan-electric' 
                      : 'border-gray-500 group-hover:border-gray-400'
                    }`}
                >
                  {orbitFilters[type.id] && (
                    <svg
                      className="w-full h-full text-space-black"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-sm text-gray-300 group-hover:text-white">
                  {type.label}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Satellite Count */}
      <div className="p-4 border-b border-space-light">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Satellites</span>
          <span className="text-cyan-electric font-semibold">
            {satellites.length}
          </span>
        </div>
      </div>

      {/* Satellite List */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="loading-spinner" />
          </div>
        ) : satellites.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-4">No satellites found</p>
            <button
              onClick={seedDatabase}
              className="btn-secondary text-sm"
            >
              Load Sample Data
            </button>
          </div>
        ) : (
          <div className="divide-y divide-space-light">
            {satellites.map(satellite => (
              <div
                key={satellite.noradId}
                onClick={() => selectSatellite(satellite)}
                className={`satellite-item cursor-pointer transition-all duration-200
                  ${selectedSatellite?.noradId === satellite.noradId 
                    ? 'bg-cyan-electric/10 border-l-2 border-cyan-electric' 
                    : 'hover:bg-space-light/50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: orbitTypes.find(t => t.id === satellite.orbitType)?.color || '#fff'
                      }}
                    />
                    <span className="font-medium text-sm text-white truncate">
                      {satellite.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    #{satellite.noradId}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={{
                      backgroundColor: `${orbitTypes.find(t => t.id === satellite.orbitType)?.color}20`,
                      color: orbitTypes.find(t => t.id === satellite.orbitType)?.color
                    }}
                  >
                    {satellite.orbitType}
                  </span>
                  <span>{satellite.details?.altitude?.toFixed(0)} km</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

