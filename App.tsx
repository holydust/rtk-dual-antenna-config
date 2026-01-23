import React, { useState, useMemo } from 'react';
import { Settings2, Info } from 'lucide-react';
import { Visualizer } from './components/Visualizer';
import { ConfigPanel } from './components/ConfigPanel';
import { ParamsOutput } from './components/ParamsOutput';
import { AntennaConfig, ArduParams } from './types';

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
  const [config, setConfig] = useState<AntennaConfig>({
    master: { x: -0.5, y: 0, z: 0 },
    slave: { x: 0.5, y: 0, z: 0 },
  });

  const params = useMemo((): ArduParams => {
    return {
      GPS1_MB_TYPE: 1,
      // 根据 ArduPilot 文档: GPS1_MB_TYPE = 1 是从 Slave 到 Master 的偏移
      // 逻辑: Master - Slave
      GPS1_MB_OFS_X: config.master.x - config.slave.x,
      GPS1_MB_OFS_Y: config.master.y - config.slave.y,
      GPS1_MB_OFS_Z: config.master.z - config.slave.z,
      // 针对 Master 天线相对于飞控中心的偏移
      GPS1_POS_X: config.master.x,
      GPS1_POS_Y: config.master.y,
      GPS1_POS_Z: config.master.z,
    };
  }, [config]);

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
            <p className="text-xs text-zinc-400 font-mono">Dual-Antenna Yaw for APM</p>
          </div>
        </div>
        
        <div className="pointer-events-auto flex gap-2">
          <button 
             onClick={() => window.open('https://ardupilot.org/copter/docs/common-gps-for-yaw.html', '_blank')}
             className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs flex items-center gap-2 transition-all"
          >
            <Info size={14} className="text-cyan-400" />
            Official Docs
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex">
        {/* Sidebar Controls */}
        <div className="w-80 h-full p-6 pt-24 z-10 flex flex-col gap-6 overflow-y-auto bg-zinc-950/40 backdrop-blur-md border-r border-zinc-800/50">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Settings2 size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Configuration</span>
          </div>
          
          <ConfigPanel 
            config={config} 
            onChange={setConfig} 
          />

          <div className="mt-auto pt-6 border-t border-zinc-800">
             <div className="p-3 bg-cyan-950/20 border border-cyan-900/50 rounded-lg">
                <p className="text-[10px] text-cyan-400/80 leading-relaxed">
                  Tip: ArduPilot uses NED coordinates. X is Forward, Y is Right, Z is Down. 
                  Input units are in METERS.
                </p>
             </div>
          </div>
        </div>

        {/* 3D Visualizer Viewport */}
        <div className="flex-1 relative">
           <Visualizer config={config} />
           
           {/* Center Labels - Reduced width to w-60 (approx 240px) */}
           <div className="absolute top-24 right-6 w-60 flex flex-col gap-4 pointer-events-none">
              <ParamsOutput params={params} />
           </div>

           {/* Orientation Guide */}
           <div className="absolute bottom-6 left-6 flex items-center gap-4 text-xs text-zinc-500 font-mono bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 backdrop-blur-sm">
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