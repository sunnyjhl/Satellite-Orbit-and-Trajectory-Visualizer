/**
 * Satellite Context
 * Global state management for satellite data
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { satelliteApi } from '../services/api';

const SatelliteContext = createContext();

export const useSatellite = () => {
  const context = useContext(SatelliteContext);
  if (!context) {
    throw new Error('useSatellite must be used within a SatelliteProvider');
  }
  return context;
};

export const SatelliteProvider = ({ children }) => {
  const [satellites, setSatellites] = useState([]);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [orbitFilters, setOrbitFilters] = useState({
    LEO: true,
    MEO: true,
    GEO: true,
    POLAR: true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeOffset, setTimeOffset] = useState(0);

  // Fetch satellites for visualization
  const fetchSatellites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const activeTypes = Object.entries(orbitFilters)
        .filter(([_, active]) => active)
        .map(([type]) => type);
      
      const response = await satelliteApi.getForVisualization(
        activeTypes.length > 0 ? activeTypes : null
      );
      
      if (response.success) {
        setSatellites(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching satellites:', err);
    } finally {
      setLoading(false);
    }
  }, [orbitFilters]);

  // Fetch satellites on mount and when filters change
  useEffect(() => {
    fetchSatellites();
  }, [fetchSatellites]);

  // Update time offset for animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOffset(prev => prev + 1);
    }, 100); // Update every 100ms for smooth animation
    
    return () => clearInterval(interval);
  }, []);

  // Search satellites
  const searchSatellites = async (query) => {
    if (!query.trim()) {
      fetchSatellites();
      return;
    }
    
    setLoading(true);
    try {
      const response = await satelliteApi.search(query);
      if (response.success) {
        setSatellites(response.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Select a satellite
  const selectSatellite = (satellite) => {
    setSelectedSatellite(satellite);
  };

  // Toggle orbit filter
  const toggleOrbitFilter = (orbitType) => {
    setOrbitFilters(prev => ({
      ...prev,
      [orbitType]: !prev[orbitType]
    }));
  };

  // Get satellite by NORAD ID
  const getSatelliteById = async (noradId) => {
    try {
      const response = await satelliteApi.getByNoradId(noradId);
      return response.data;
    } catch (err) {
      console.error('Error fetching satellite:', err);
      return null;
    }
  };

  // Seed database with sample data
  const seedDatabase = async () => {
    setLoading(true);
    try {
      await satelliteApi.seed();
      await fetchSatellites();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    satellites,
    selectedSatellite,
    orbitFilters,
    searchQuery,
    loading,
    error,
    timeOffset,
    setSearchQuery,
    searchSatellites,
    selectSatellite,
    toggleOrbitFilter,
    getSatelliteById,
    fetchSatellites,
    seedDatabase
  };

  return (
    <SatelliteContext.Provider value={value}>
      {children}
    </SatelliteContext.Provider>
  );
};

export default SatelliteContext;

