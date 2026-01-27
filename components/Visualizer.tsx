
import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera, Line, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { AntennaConfig } from '../types';

interface VisualizerProps {
  config: AntennaConfig;
}

const FlightControllerModel = () => {
  // Forward indicator arrow shape
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

  // Generate a texture for the label dynamically using HTML5 Canvas
  // This guarantees the text is visible as part of the 3D scene geometry,
  // avoiding HTML scaling/occlusion issues entirely.
  const labelTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Clear background (transparent)
      ctx.clearRect(0, 0, 512, 512);
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // CORVON Logo Text
      ctx.font = '900 100px Arial, sans-serif';
      ctx.fillStyle = '#18181b'; // zinc-900
      ctx.fillText('CORVON', 256, 220);

      // FLIGHT CONTROLLER Subtitle
      ctx.font = '700 28px Arial, sans-serif';
      ctx.fillStyle = '#71717a'; // zinc-500
      ctx.fillText('FLIGHT CONTROLLER', 256, 280);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    // Ensure the texture updates if created async (though here it's sync)
    tex.needsUpdate = true; 
    return tex;
  }, []);

  return (
    <group>
      {/* Flight Controller Body */}
      <RoundedBox 
        args={[0.05, 0.0075, 0.075]} 
        radius={0.0015} 
        smoothness={4} 
        position={[0, -0.00375, 0]} 
      >
        <meshStandardMaterial 
          color="#e4e4e7" 
          metalness={0.1} 
          roughness={0.3} 
          envMapIntensity={1}
        />
      </RoundedBox>

      {/* Top Details Group (placed just above the surface) */}
      <group position={[0, 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        
        {/* Red Orientation Arrow */}
        <mesh position={[0, 0.024, 0]}> 
           <shapeGeometry args={[directionArrow]} />
           <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* Text Label Plane 
            Position: 
            Local Y is World -Z (Backwards).
            -0.01 Local Y puts the text towards the back of the controller.
            Local Z is World Y (Up). 
        */}
        <mesh position={[0, -0.01, 0]}>
           <planeGeometry args={[0.045, 0.045]} />
           {/* Use meshBasicMaterial to ensure high visibility regardless of lighting conditions */}
           <meshBasicMaterial map={labelTexture} transparent opacity={0.9} />
        </mesh>
      </group>
    </group>
  );
};

const ReferenceAxes = () => {
  const length = 2;
  return (
    <group>
      {/* ArduPilot Convention: X Forward (Red), Y Right (Green), Z Down (Blue) */}
      <Line points={[[0,0,0], [0,0, -length]]} color="#ef4444" dashed dashScale={20} opacity={0.5} transparent lineWidth={1} />
      <Line points={[[0,0,0], [length,0,0]]} color="#22c55e" dashed dashScale={20} opacity={0.5} transparent lineWidth={1} />
      <Line points={[[0,0,0], [0, -length, 0]]} color="#3b82f6" dashed dashScale={20} opacity={0.5} transparent lineWidth={1} />
    </group>
  );
};

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
        <meshStandardMaterial color={ringColor} emissive={ringColor} emissiveIntensity={0.5} />
      </mesh>
      {/* 
          Keep Html for floating labels as they need to face the camera 
          and are not part of the model's physical texture.
      */}
      <Html position={[0, 0.08, 0]} center zIndexRange={[100, 0]}>
         <div 
           className="px-2 py-0.5 rounded text-[10px] text-white font-mono font-bold whitespace-nowrap shadow-xl uppercase backdrop-blur-md border border-white/20 select-none"
           style={{ backgroundColor: type === 'master' ? 'rgba(8, 145, 178, 0.8)' : 'rgba(234, 88, 12, 0.8)' }}
         >
           {label}
         </div>
      </Html>
    </group>
  );
};

const Scene = ({ config }: VisualizerProps) => {
  // Coordinate Mapping for Visuals:
  // NED X (Forward) -> -Z (ThreeJS)
  // NED Y (Right)   -> +X (ThreeJS)
  // NED Z (Down)    -> -Y (ThreeJS)
  
  const masterPos: [number, number, number] = [config.master.y, -config.master.z, -config.master.x];
  const slavePos: [number, number, number] = [config.slave.y, -config.slave.z, -config.slave.x];

  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[0.4, 0.4, 0.4]} 
        near={0.01} 
        far={100}
      />
      
      <OrbitControls 
        makeDefault 
        minDistance={0.05} 
        maxDistance={10}
        target={[0, 0, 0]}   
      />
      
      {/* Lighting Setup */}
      <ambientLight intensity={1.5} />
      <spotLight position={[2, 5, 2]} angle={0.5} penumbra={1} intensity={2} castShadow />
      <pointLight position={[-2, 2, -2]} intensity={1} />
      <directionalLight position={[0, 5, -5]} intensity={1.5} />

      <Grid 
        infiniteGrid 
        cellSize={0.1} 
        sectionSize={0.5} 
        sectionColor="#334155" 
        cellColor="#1e293b" 
        fadeDistance={10}
        position={[0, -0.05, 0]} 
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
        opacity={0.3}
        dashed
        dashScale={50}
        dashSize={0.1}
      />
    </>
  );
};

const Loader = () => {
  return (
    <Html center>
      <div className="text-zinc-400 text-xs font-mono animate-pulse whitespace-nowrap">Loading 3D Scene...</div>
    </Html>
  )
}

export const Visualizer: React.FC<VisualizerProps> = ({ config }) => {
  return (
    <div className="w-full h-full bg-zinc-950">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={<Loader />}>
          <Scene config={config} />
        </Suspense>
      </Canvas>
    </div>
  );
};
