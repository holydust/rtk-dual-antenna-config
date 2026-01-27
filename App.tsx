
import React, { useState, useMemo } from 'react';
import { Settings2, Info, Eye, EyeOff, Plane } from 'lucide-react';
import { Visualizer } from './components/Visualizer';
import { ConfigPanel } from './components/ConfigPanel';
import { ParamsOutput } from './components/ParamsOutput';
import { AntennaConfig, ArduParams, Px4Params, FlightControllerMode } from './types';

// 精确还原高清图片：分体定位针 Logo (From User SVG)
const CorvonLogoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 612.72 703.74" fill="currentColor" className={className}>
    <g>
      <path d="M306.35 0c169.2,0 306.36,137.16 306.36,306.35l-200.53 0c0,-58.45 -47.39,-105.83 -105.84,-105.83 -58.45,0 -105.83,47.38 -105.83,105.83l-200.53 0c0,-169.19 137.16,-306.35 306.35,-306.35z" />
      <polygon points="306.35,703.74 612.72,414.97 612.72,350.91 412.38,350.91 306.35,450.86 200.33,350.91 -0,350.91 -0,414.97 " />
    </g>
  </svg>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<FlightControllerMode>('ardupilot');
  const [config, setConfig] = useState<AntennaConfig>({
    master: { x: -0.5, y: 0, z: 0 },
    slave: { x: 0.5, y: 0, z: 0 },
  });
  
  const [showParams, setShowParams] = useState(true);

  // ArduPilot Calculations
  const arduParams = useMemo((): ArduParams => {
    return {
      GPS1_MB_TYPE: 1,
      // Logic: Master - Slave (Vector from Slave to Master)
      GPS1_MB_OFS_X: config.master.x - config.slave.x,
      GPS1_MB_OFS_Y: config.master.y - config.slave.y,
      GPS1_MB_OFS_Z: config.master.z - config.slave.z,
      GPS1_POS_X: config.master.x,
      GPS1_POS_Y: config.master.y,
      GPS1_POS_Z: config.master.z,
    };
  }, [config]);

  // PX4 Calculations
  const px4Params = useMemo((): Px4Params => {
    // Calculate Yaw Offset
    // Based on user requirement: Master Back (-0.5) & Slave Front (0.5) should result in 180 degrees.
    // This implies the vector direction is calculated as (Master - Slave).
    // dx = -0.5 - 0.5 = -1.0 => atan2(0, -1) = 180 deg.
    const dx = config.master.x - config.slave.x;
    const dy = config.master.y - config.slave.y;
    
    // atan2 returns radians, convert to degrees
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Normalize to 0-360 range
    if (angle < 0) {
      angle += 360;
    }
    
    return {
      EKF2_GPS_CTRL: 15, // Changed to 15 (Dual Antenna)
      GPS_1_PROTOCOL: 6, // Changed to 6 (NMEA), handled in ParamsOutput
      GPS_YAW_OFFSET: angle,
    };
  }, [config]);

  const docUrl = mode === 'ardupilot' 
    ? 'https://ardupilot.org/copter/docs/common-gps-for-yaw.html'
    : 'https://docs.px4.io/main/en/gps_compass/rtk_gps_holybro_unicore_um982#px4-configuration';

  return (
    <div className="flex h-screen w-full bg-zinc-950 font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-zinc-950/80 to-transparent pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.15)]">
            <CorvonLogoIcon className="text-black w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">CORVON RTK Configurator</h1>
            <p className="text-xs text-zinc-400 font-mono flex items-center gap-2">
              <span className={mode === 'ardupilot' ? 'text-cyan-400' : 'text-purple-400'}>
                {mode === 'ardupilot' ? 'ArduPilot (APM)' : 'PX4 Autopilot'}
              </span>
            </p>
          </div>
        </div>
        
        <div className="pointer-events-auto flex gap-2">
          <button 
             onClick={() => window.open(docUrl, '_blank', 'noopener,noreferrer')}
             className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs flex items-center gap-2 transition-all"
          >
            <Info size={14} className={mode === 'ardupilot' ? "text-cyan-400" : "text-purple-400"} />
            Official Docs
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex">
        {/* Sidebar Controls */}
        <div className="w-80 h-full p-6 pt-24 z-10 flex flex-col gap-6 overflow-y-auto bg-zinc-950/40 backdrop-blur-md border-r border-zinc-800/50">
          
          {/* Mode Switcher */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Flight Controller</label>
            <div className="flex p-1 bg-zinc-900 rounded-lg border border-zinc-800">
              <button
                onClick={() => setMode('ardupilot')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${
                  mode === 'ardupilot' 
                    ? 'bg-zinc-800 text-cyan-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                ArduPilot
              </button>
              <button
                onClick={() => setMode('px4')}
                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-bold rounded-md transition-all ${
                  mode === 'px4' 
                    ? 'bg-zinc-800 text-purple-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                PX4
              </button>
            </div>
          </div>

          <div className="h-px bg-zinc-800/50 w-full" />

          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Settings2 size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Configuration</span>
          </div>
          
          <ConfigPanel 
            config={config} 
            onChange={setConfig} 
          />

          <div className="mt-auto pt-6 border-t border-zinc-800">
             <div className={`p-3 rounded-lg border ${mode === 'ardupilot' ? 'bg-cyan-950/20 border-cyan-900/50' : 'bg-purple-950/20 border-purple-900/50'}`}>
                <p className={`text-[10px] leading-relaxed ${mode === 'ardupilot' ? 'text-cyan-400/80' : 'text-purple-400/80'}`}>
                  <strong>{mode === 'ardupilot' ? 'ArduPilot' : 'PX4'} Logic:</strong><br/>
                  {mode === 'ardupilot' 
                    ? "Calculates the offset vector from Slave to Master. Uses NED coordinates."
                    : "Calculates the Heading Angle defined by the vector from Master to Slave."
                  }
                </p>
             </div>
          </div>
        </div>

        {/* 3D Visualizer Viewport */}
        <div className="flex-1 relative">
           <Visualizer config={config} />
           
           {/* Center Labels / Params Output - Collapsible */}
           <div className={`absolute top-24 right-6 flex flex-col items-end gap-2 pointer-events-none transition-all duration-300 z-20`}>
              {/* Toggle Button */}
              <button
                onClick={() => setShowParams(!showParams)}
                className="pointer-events-auto p-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors backdrop-blur-md shadow-lg"
                title={showParams ? "Hide Parameters" : "Show Parameters"}
              >
                {showParams ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

              {/* Panel Content */}
              <div className={`
                 transition-all duration-300 origin-top-right w-52
                 ${showParams 
                   ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                   : 'opacity-0 scale-95 -translate-y-4 pointer-events-none h-0 overflow-hidden'}
              `}>
                <ParamsOutput 
                  mode={mode}
                  arduParams={arduParams} 
                  px4Params={px4Params}
                />
              </div>
           </div>

           {/* Orientation Guide */}
           <div className="absolute bottom-6 left-6 flex items-center gap-4 text-xs text-zinc-500 font-mono bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 backdrop-blur-sm pointer-events-none">
             <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> +X Forward</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> +Y Right</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> +Z Down</div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
