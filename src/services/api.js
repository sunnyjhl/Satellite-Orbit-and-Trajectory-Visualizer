/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

/**
 * Satellite API endpoints
 */
export const satelliteApi = {
  // Get all satellites with pagination
  getAll: (page = 1, limit = 20) => 
    api.get(`/satellites?page=${page}&limit=${limit}`),

  // Get satellite by NORAD ID
  getByNoradId: (noradId) => 
    api.get(`/satellites/${noradId}`),

  // Get satellites for 3D visualization with orbit paths
  getForVisualization: (orbitTypes = null) => {
    const params = orbitTypes ? `?orbitTypes=${orbitTypes.join(',')}` : '';
    return api.get(`/satellites/visualization${params}`);
  },

  // Get satellites by orbit type
  getByOrbitType: (orbitType) => 
    api.get(`/satellites/orbit/${orbitType}`),

  // Search satellites
  search: (query) => 
    api.post('/satellites/search', { query }),

  // Get orbital elements
  getOrbitalElements: (noradId) => 
    api.get(`/satellites/orbital-elements/${noradId}`),

  // Seed database with sample satellites
  seed: () => 
    api.post('/satellites/seed')
};

/**
 * Trajectory API endpoints
 */
export const trajectoryApi = {
  // Calculate launch trajectory
  calculate: (params) => 
    api.post('/trajectory/calculate', params),

  // Get all trajectories
  getAll: (page = 1, limit = 10) => 
    api.get(`/trajectory?page=${page}&limit=${limit}`),

  // Get trajectory by ID
  getById: (id) => 
    api.get(`/trajectory/${id}`),

  // Get trajectory visualization data
  getVisualization: (id) => 
    api.get(`/trajectory/${id}/visualization`),

  // Delete trajectory
  delete: (id) => 
    api.delete(`/trajectory/${id}`)
};

/**
 * Health check
 */
export const healthCheck = () => 
  api.get('/health');

export default api;

