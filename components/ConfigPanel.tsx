
import React from 'react';
import { AntennaConfig, Vector3D } from '../types';
import { MoveHorizontal, MoveVertical, ArrowUpDown } from 'lucide-react';

interface ConfigPanelProps {
  config: AntennaConfig;
  onChange: (config: AntennaConfig) => void;
}

const InputGroup = ({ 
  label, 
  value, 
  onChange, 
  color 
}: { 
  label: string, 
  value: Vector3D, 
  onChange: (v: Vector3D) => void,
  color: string 
}) => {
  const handleChange = (axis: keyof Vector3D, val: string) => {
    let num = parseFloat(val) || 0;
    
    // 限制输入范围在 -2 到 2 之间
    if (num > 2) num = 2;
    if (num < -2) num = -2;
    
    onChange({ ...value, [axis]: num });
  };

  return (
    <div className="space-y-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 transition-all hover:border-zinc-700">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`}></div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300">{label}</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {/* X Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
              <MoveVertical size={10} className="text-red-500" /> Forward (X)
            </label>
            <span className="text-[10px] text-zinc-600">meters</span>
          </div>
          <input 
            type="number" 
            step="0.01"
            min="-2"
            max="2"
            value={value.x}
            onChange={(e) => handleChange('x', e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors font-mono"
          />
        </div>

        {/* Y Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
              <MoveHorizontal size={10} className="text-green-500" /> Right (Y)
            </label>
            <span className="text-[10px] text-zinc-600">meters</span>
          </div>
          <input 
            type="number" 
            step="0.01"
            min="-2"
            max="2"
            value={value.y}
            onChange={(e) => handleChange('y', e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors font-mono"
          />
        </div>

        {/* Z Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1">
              <ArrowUpDown size={10} className="text-blue-500" /> Down (Z)
            </label>
            <span className="text-[10px] text-zinc-600">meters</span>
          </div>
          <input 
            type="number" 
            step="0.01"
            min="-2"
            max="2"
            value={value.z}
            onChange={(e) => handleChange('z', e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors font-mono"
          />
        </div>
      </div>
    </div>
  );
};

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  return (
    <div className="flex flex-col gap-4">
      <InputGroup 
        label="Master Antenna" 
        value={config.master} 
        onChange={(v) => onChange({ ...config, master: v })} 
        color="bg-cyan-500"
      />
      <InputGroup 
        label="Slave Antenna" 
        value={config.slave} 
        onChange={(v) => onChange({ ...config, slave: v })} 
        color="bg-orange-500"
      />
    </div>
  );
};
