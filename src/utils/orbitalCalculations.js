/**
 * Orbital Calculations Utility
 * Frontend implementations of orbital mechanics for visualization
 * (Mirror of backend calculations for real-time updates)
 */

// Physical constants
const EARTH_RADIUS_KM = 6371;
const MU_KM = 3.986004418e5; // Standard gravitational parameter (km³/s²)

/**
 * Calculate orbital period from semi-major axis
 * @param {number} semiMajorAxis - Semi-major axis in km
 * @returns {number} Orbital period in minutes
 */
export function calculateOrbitalPeriod(semiMajorAxis) {
  const periodSeconds = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / MU_KM);
  return periodSeconds / 60;
}

/**
 * Calculate orbital velocity at a given altitude
 * @param {number} altitude - Altitude above Earth in km
 * @param {number} semiMajorAxis - Semi-major axis in km
 * @returns {number} Velocity in km/s
 */
export function calculateVelocity(altitude, semiMajorAxis) {
  const r = EARTH_RADIUS_KM + altitude;
  const velocity = Math.sqrt(MU_KM * (2 / r - 1 / semiMajorAxis));
  return velocity;
}

/**
 * Calculate orbit path points for visualization
 * @param {Object} orbitalElements - Object containing orbital parameters
 * @returns {Array} Array of [x, y, z] coordinates
 */
export function calculateOrbitPath(orbitalElements) {
  const points = [];
  const numPoints = 360;
  
  const {
    semiMajorAxis,
    eccentricity,
    inclination = 0,
    raan = 0,
    argumentOfPerigee = 0
  } = orbitalElements;
  
  const incRad = (inclination * Math.PI) / 180;
  const raanRad = (raan * Math.PI) / 180;
  const argPerigeeRad = (argumentOfPerigee * Math.PI) / 180;
  
  for (let i = 0; i <= numPoints; i++) {
    const trueAnomaly = (i * 2 * Math.PI) / numPoints;
    
    const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / 
              (1 + eccentricity * Math.cos(trueAnomaly));
    
    const xOrbital = r * Math.cos(trueAnomaly);
    const yOrbital = r * Math.sin(trueAnomaly);
    
    const x1 = xOrbital * Math.cos(argPerigeeRad) - yOrbital * Math.sin(argPerigeeRad);
    const y1 = xOrbital * Math.sin(argPerigeeRad) + yOrbital * Math.cos(argPerigeeRad);
    
    const x2 = x1;
    const y2 = y1 * Math.cos(incRad);
    const z2 = y1 * Math.sin(incRad);
    
    const x = x2 * Math.cos(raanRad) - y2 * Math.sin(raanRad);
    const y = x2 * Math.sin(raanRad) + y2 * Math.cos(raanRad);
    const z = z2;
    
    points.push([x, y, z]);
  }
  
  return points;
}

/**
 * Calculate satellite position at a given time
 * @param {Object} orbitalElements - Orbital parameters
 * @param {number} timeOffsetMinutes - Time offset from epoch in minutes
 * @returns {Object} Position [x, y, z] and velocity
 */
export function calculatePosition(orbitalElements, timeOffsetMinutes = 0) {
  const {
    semiMajorAxis,
    eccentricity,
    inclination = 0,
    raan = 0,
    argumentOfPerigee = 0,
    meanAnomaly = 0
  } = orbitalElements;
  
  const periodMinutes = calculateOrbitalPeriod(semiMajorAxis);
  const meanMotion = (2 * Math.PI) / periodMinutes;
  
  const currentMeanAnomaly = meanAnomaly + (meanMotion * timeOffsetMinutes);
  
  let E = currentMeanAnomaly;
  for (let i = 0; i < 10; i++) {
    E = currentMeanAnomaly + eccentricity * Math.sin(E);
  }
  
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + eccentricity) * Math.sin(E / 2),
    Math.sqrt(1 - eccentricity) * Math.cos(E / 2)
  );
  
  const r = (semiMajorAxis * (1 - eccentricity * eccentricity)) / 
            (1 + eccentricity * Math.cos(trueAnomaly));
  
  const xOrbital = r * Math.cos(trueAnomaly);
  const yOrbital = r * Math.sin(trueAnomaly);
  
  const incRad = (inclination * Math.PI) / 180;
  const raanRad = (raan * Math.PI) / 180;
  const argPerigeeRad = (argumentOfPerigee * Math.PI) / 180;
  
  const x1 = xOrbital * Math.cos(argPerigeeRad) - yOrbital * Math.sin(argPerigeeRad);
  const y1 = xOrbital * Math.sin(argPerigeeRad) + yOrbital * Math.cos(argPerigeeRad);
  
  const x2 = x1;
  const y2 = y1 * Math.cos(incRad);
  const z2 = y1 * Math.sin(incRad);
  
  const x = x2 * Math.cos(raanRad) - y2 * Math.sin(raanRad);
  const y = x2 * Math.sin(raanRad) + y2 * Math.cos(raanRad);
  const z = z2;
  
  const velocity = calculateVelocity(r - EARTH_RADIUS_KM, semiMajorAxis);
  
  return {
    position: [x, y, z],
    velocity,
    altitude: r - EARTH_RADIUS_KM,
    trueAnomaly: (trueAnomaly * 180) / Math.PI
  };
}

/**
 * Convert ECEF to geodetic coordinates
 * @param {number} x - X coordinate in km
 * @param {number} y - Y coordinate in km
 * @param {number} z - Z coordinate in km
 * @returns {Object} {lat, lon, alt}
 */
export function ecefToGeodetic(x, y, z) {
  const a = 6378.137;
  const f = 1 / 298.257223563;
  const e2 = 2 * f - f * f;
  
  const lon = Math.atan2(y, x);
  const p = Math.sqrt(x * x + y * y);
  
  let lat = Math.atan2(z, p * (1 - e2));
  let N;
  
  for (let i = 0; i < 5; i++) {
    N = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));
    lat = Math.atan2(z + e2 * N * Math.sin(lat), p);
  }
  
  const alt = p / Math.cos(lat) - N;
  
  return {
    lat: (lat * 180) / Math.PI,
    lon: (lon * 180) / Math.PI,
    alt
  };
}

/**
 * Get orbit type color
 * @param {string} orbitType - Orbit type
 * @returns {string} Hex color code
 */
export function getOrbitColor(orbitType) {
  const colors = {
    'LEO': '#00ff88',
    'MEO': '#00d4ff',
    'GEO': '#ff6b35',
    'POLAR': '#ff00ff',
    'SUN_SYNCHRONOUS': '#ffff00',
    'ELLIPTICAL': '#ff00ff'
  };
  return colors[orbitType] || '#ffffff';
}

/**
 * Scale factor for visualization
 * Earth radius in scene units (1 unit = 1000 km for better visualization)
 */
export const SCALE_FACTOR = 0.001; // 1 km = 0.001 units
export const EARTH_RADIUS_UNITS = EARTH_RADIUS_KM * SCALE_FACTOR;

