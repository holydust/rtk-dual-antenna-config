
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Line, Html, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { AntennaConfig } from '../types';

interface VisualizerProps {
  config: AntennaConfig;
}

const FlightControllerModel = () => {
  // Forward indicator arrow
  const directionArrow = useMemo(() => {
    const s = new THREE.Shape();
    const w = 0.012; 
    const h = 0.020; 
    s.moveTo(0, h/2);         
    s.lineTo(w, -h/2);        
    s.lineTo(0, -h/2 + 0.005); 
    s.lineTo(-w, -h/2);       
    s.lineTo(0, h/2);         
    return s;
  }, []);

  return (
    <group>
      {/* 50% Thickness (0.0075) Rounded Box with chamfers (1.5mm radius) */}
      <RoundedBox 
        args={[0.05, 0.0075, 0.075]} 
        radius={0.0015} 
        smoothness={4} 
        position={[0, -0.00375, 0]} 
      >
        <meshStandardMaterial 
          color="#ffffff" 
          metalness={0.2} 
          roughness={0.4} 
          envMapIntensity={1}
        />
      </RoundedBox>

      {/* Top Decals Group (placed slightly above the surface at Y=0) */}
      <group position={[0, 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        
        {/* Red Orientation Arrow */}
        <mesh position={[0, 0.024, 0]}> 
           <shapeGeometry args={[directionArrow]} />
           <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* CORVON Brand Text - Restored */}
        <Text
          position={[0, -0.005, 0]} 
          fontSize={0.009}
          color="#18181b" 
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          anchorX="center"
          anchorY="middle"
          fontWeight={900}
          letterSpacing={-0.02}
        >
          CORVON
        </Text>

        {/* FLIGHT CONTROLLER Label */}
        <Text
          position={[0, -0.022, 0]} 
          fontSize={0.003}
          color="#52525b" 
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
          anchorX="center"
          anchorY="middle"
          fontWeight={800}
          letterSpacing={0.05}
        >
          FLIGHT CONTROLLER
        </Text>
      </group>
    </group>
  );
};

const ReferenceAxes = () => {
  const length = 2;
  return (
    <group>
      {/* ArduPilot Convention: X Forward (Red), Y Right (Green), Z Down (Blue) */}
      <Line points={[[0,0,0], [0,0, -length]]} color="#ef4444" dashed dashScale={20} opacity={0.3} transparent lineWidth={1} />
      <Line points={[[0,0,0], [length,0,0]]} color="#22c55e" dashed dashScale={20} opacity={0.3} transparent lineWidth={1} />
      <Line points={[[0,0,0], [0, -length, 0]]} color="#3b82f6" dashed dashScale={20} opacity={0.3} transparent lineWidth={1} />
    </group>
  );
}

const GPSAntenna = ({ position, label, type }: { position: [number, number, number], label: string, type: 'master' | 'slave' }) => {
  const ringColor = type === 'master' ? '#06b6d4' : '#f97316';
  return (
    <group position={position}>
      <mesh position={[0, 0.025, 0]}>
        <cylinderGeometry args={[0.022, 0.025, 0.05, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.002, 0]}>
        <cylinderGeometry args={[0.028, 0.03, 0.004, 32]} />
        <meshStandardMaterial color={ringColor} emissive={ringColor} emissiveIntensity={0.2} />
      </mesh>
      <Html position={[0, 0.08, 0]} center>
         <div 
           className="px-2 py-0.5 rounded text-[10px] text-white font-mono font-bold whitespace-nowrap shadow-xl uppercase backdrop-blur-md border border-white/20"
           style={{ backgroundColor: type === 'master' ? 'rgba(8, 145, 178, 0.8)' : 'rgba(234, 88, 12, 0.8)' }}
         >
           {label}
         </div>
      </Html>
    </group>
  );
};

const Scene = ({ config }: VisualizerProps) => {
  const masterPos: [number, number, number] = [config.master.y, -config.master.z, -config.master.x];
  const slavePos: [number, number, number] = [config.slave.y, -config.slave.z, -config.slave.x];

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[0.4, 0.4, 0.4]} 
        near={0.001} 
        far={100}
      />
      
      <OrbitControls 
        makeDefault 
        minDistance={0.08} 
        maxDistance={8}   
      />
      
      <ambientLight intensity={0.7} />
      <spotLight position={[1, 2, 1]} angle={0.15} penumbra={1} intensity={2} castShadow />
      <pointLight position={[-1, -1, -1]} intensity={0.5} />
      <directionalLight position={[0, 5, 0]} intensity={0.8} />

      <Grid 
        infiniteGrid 
        cellSize={0.1} 
        sectionSize={0.5} 
        sectionColor="#334155" 
        cellColor="#1e293b" 
        fadeDistance={10}
      />

      <ReferenceAxes />

      <FlightControllerModel />
      
      <GPSAntenna position={masterPos} label="Master" type="master" />
      <GPSAntenna position={slavePos} label="Slave" type="slave" />

      <Line
        points={[masterPos, slavePos]}
        color="#ffffff"
        lineWidth={1}
        transparent
        opacity={0.2}
        dashed
        dashScale={50}
        dashSize={0.1}
      />
    </>
  );
};

export const Visualizer: React.FC<VisualizerProps> = ({ config }) => {
  return (
    <div className="w-full h-full bg-zinc-950">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <Scene config={config} />
      </Canvas>
    </div>
  );
};
