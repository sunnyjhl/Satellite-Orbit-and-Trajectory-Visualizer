/**
 * Earth Component
 * 3D Earth visualization with React Three Fiber
 */

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// Scale: 1 unit = 1000 km
// Earth radius = 6371 km = 6.371 units
const EARTH_RADIUS = 6.371;
const EARTH_SEGMENTS = 64;

/**
 * Earth Sphere Component
 */
const Earth = () => {
  const earthRef = useRef();
  
  // Create Earth texture with procedural approach
  const earthMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      color: '#1a4a6e',
      emissive: '#0a1520',
      specular: '#111111',
      shininess: 15,
      transparent: true,
      opacity: 1
    });
  }, []);

  // Atmosphere effect
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
  }, []);

  // Rotate Earth slowly
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group>
      {/* Earth Sphere */}
      <mesh ref={earthRef} material={earthMaterial}>
        <sphereGeometry args={[EARTH_RADIUS, EARTH_SEGMENTS, EARTH_SEGMENTS]} />
      </mesh>
      
      {/* Atmosphere Glow */}
      <mesh material={atmosphereMaterial}>
        <sphereGeometry args={[EARTH_RADIUS * 1.05, EARTH_SEGMENTS, EARTH_SEGMENTS]} />
      </mesh>
      
      {/* Continents (simplified as mesh) */}
      <Continents />
      
      {/* Atmosphere Ring */}
      <AtmosphereRing />
    </group>
  );
};

/**
 * Simplified Continents Visualization
 */
const Continents = () => {
  // Simplified continent positions (approximate)
  const continents = useMemo(() => {
    const positions = [
      // North America
      { pos: [-2, 1.5, 4], scale: 1.2 },
      // South America  
      { pos: [-1.5, -2, 4.5], scale: 0.8 },
      // Europe
      { pos: [1, 2, 5], scale: 0.7 },
      // Africa
      { pos: [1.5, -1, 5], scale: 1.0 },
      // Asia
      { pos: [4, 1.5, 3], scale: 1.5 },
      // Australia
      { pos: [5, -2, 3.5], scale: 0.6 },
      // Antarctica
      { pos: [0, -5, 2], scale: 1.0 }
    ];
    return positions;
  }, []);

  return (
    <group>
      {continents.map((continent, index) => (
        <mesh key={index} position={continent.pos} scale={continent.scale}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshPhongMaterial 
            color="#2d5a27" 
            transparent 
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Atmosphere Ring Effect
 */
const AtmosphereRing = () => {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[EARTH_RADIUS * 1.02, EARTH_RADIUS * 1.04, 64]} />
      <meshBasicMaterial 
        color="#4a9eff" 
        transparent 
        opacity={0.15}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/**
 * Scene Setup Component
 */
const Scene = ({ satellites, selectedSatellite, onSatelliteClick }) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2} 
        color="#ffffff"
      />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4a6fa5" />
      
      {/* Stars Background */}
      <Stars 
        radius={300} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1}
      />
      
      {/* Earth */}
      <Earth />
      
      {/* Orbit Controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={100}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />
      
      {/* Satellites and Orbits */}
      {satellites.map(satellite => (
        <SatelliteGroup 
          key={satellite.noradId}
          satellite={satellite}
          isSelected={selectedSatellite?.noradId === satellite.noradId}
          onClick={() => onSatelliteClick(satellite)}
        />
      ))}
    </>
  );
};

/**
 * Satellite Group with Orbit Path
 */
const SatelliteGroup = ({ satellite, isSelected, onClick }) => {
  const groupRef = useRef();
  const { orbitPath, currentPosition, orbitType } = satellite;
  
  // Convert orbit path to Vector3 array
  const orbitPoints = useMemo(() => {
    if (!orbitPath || !orbitPath.length) return [];
    return orbitPath.map(point => 
      new THREE.Vector3(point[0] * 0.001, point[1] * 0.001, point[2] * 0.001)
    );
  }, [orbitPath]);

  // Get orbit color
  const getOrbitColor = (type) => {
    const colors = {
      'LEO': '#00ff88',
      'MEO': '#00d4ff',
      'GEO': '#ff6b35',
      'POLAR': '#ff00ff'
    };
    return colors[type] || '#ffffff';
  };

  const color = getOrbitColor(orbitType);
  
  // Calculate current position in scene coordinates
  const currentPos = useMemo(() => {
    if (currentPosition && currentPosition.position) {
      return new THREE.Vector3(
        currentPosition.position[0] * 0.001,
        currentPosition.position[1] * 0.001,
        currentPosition.position[2] * 0.001
      );
    }
    return new THREE.Vector3(0, 0, 0);
  }, [currentPosition]);

  return (
    <group ref={groupRef}>
      {/* Orbit Path Line */}
      {orbitPoints.length > 0 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={orbitPoints.length}
              array={new Float32Array(orbitPoints.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            color={color} 
            transparent 
            opacity={isSelected ? 0.8 : 0.3}
            linewidth={1}
          />
        </line>
      )}
      
      {/* Satellite Marker */}
      <mesh 
        position={currentPos}
        onClick={onClick}
      >
        <sphereGeometry args={[isSelected ? 0.15 : 0.08, 16, 16]} />
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={isSelected ? 1 : 0.8}
        />
      </mesh>
      
      {/* Glow Effect for Selected */}
      {isSelected && (
        <mesh position={currentPos}>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}
      
      {/* Label for Selected */}
      {isSelected && (
        <Html position={currentPos} center>
          <div className="bg-space-dark/90 px-2 py-1 rounded text-xs whitespace-nowrap border border-cyan-electric">
            {satellite.name}
          </div>
        </Html>
      )}
    </group>
  );
};

/**
 * Main Earth Component with Canvas
 */
const EarthCanvas = ({ satellites, selectedSatellite, onSatelliteClick }) => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ 
          position: [20, 10, 20], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene 
          satellites={satellites}
          selectedSatellite={selectedSatellite}
          onSatelliteClick={onSatelliteClick}
        />
      </Canvas>
    </div>
  );
};

export default EarthCanvas;

