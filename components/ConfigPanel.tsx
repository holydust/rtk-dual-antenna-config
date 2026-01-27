
import React, { useState, useEffect } from 'react';
import { AntennaConfig, Vector3D } from '../types';
import { MoveHorizontal, MoveVertical, ArrowUpDown } from 'lucide-react';

interface AxisControlProps {
  label: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  value: number;
  onChange: (val: string) => void;
  accentClass: string;
}

interface ConfigPanelProps {
  config: AntennaConfig;
  onChange: (config: AntennaConfig) => void;
}

const AxisControl = ({
  label,
  icon: Icon,
  iconColor,
  value,
  onChange,
  accentClass
}: AxisControlProps) => {
  // Use local state to handle the input display value.
  // This allows temporary invalid states (like "-" or "1.") while typing
  // without the parent component immediately overriding it with "0" or a parsed number.
  const [localValue, setLocalValue] = useState(value.toFixed(2));
  const [isFocused, setIsFocused] = useState(false);

  // Sync local state with prop value when not being edited
  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value.toFixed(2));
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setLocalValue(newVal);

    // Filter out incomplete inputs before sending to parent
    // Valid cases to propagate: "1", "-1", "1.2", "-1.2"
    // Invalid/Incomplete cases: "", "-", ".", "-."
    const isPartial = newVal === '' || newVal === '-' || newVal === '.' || newVal === '-.';
    
    if (!isPartial) {
      const parsed = parseFloat(newVal);
      if (!isNaN(parsed)) {
        onChange(newVal);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // On blur, revert the display to the strictly formatted prop value
    // This handles cases where user typed something invalid or out of bounds that got clamped by parent
    setLocalValue(value.toFixed(2));
  };

  return (
    <div className="bg-zinc-950/50 rounded-lg p-2.5 border border-zinc-800/50 hover:border-zinc-700/80 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <label className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2">
          <Icon size={12} className={iconColor} /> {label}
        </label>
        <span className="text-[10px] text-zinc-600 font-mono">meters</span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Slider Control */}
        <input
          type="range"
          min="-2.00"
          max="2.00"
          step="0.01"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            // No need to setLocalValue here as useEffect handles it (since focus is not on text input)
          }}
          className={`w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-zinc-900 focus:ring-zinc-600 ${accentClass}`}
        />
        
        {/* Text Input (acting as number input) */}
        <input
          type="text"
          inputMode="decimal"
          value={localValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          className="w-16 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-right focus:outline-none focus:border-zinc-600 focus:text-white transition-colors font-mono text-zinc-300"
        />
      </div>
    </div>
  );
};

const InputGroup = ({ 
  label, 
  value, 
  onChange, 
  headerColor,
  accentClass
}: { 
  label: string, 
  value: Vector3D, 
  onChange: (v: Vector3D) => void,
  headerColor: string,
  accentClass: string
}) => {
  const handleChange = (axis: keyof Vector3D, val: string) => {
    // 1. Parse float
    let num = parseFloat(val);
    if (isNaN(num)) num = 0;
    
    // 2. Clamp range -2 to 2
    if (num > 2) num = 2;
    if (num < -2) num = -2;
    
    // 3. Force 2 decimal precision to match slider step
    const fixedNum = Number(num.toFixed(2));
    
    onChange({ ...value, [axis]: fixedNum });
  };

  return (
    <div className="space-y-3 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${headerColor}`}></div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300">{label}</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-2">
        <AxisControl 
          label="Forward (X)" 
          icon={MoveVertical} 
          iconColor="text-red-500" 
          value={value.x} 
          onChange={(v) => handleChange('x', v)}
          accentClass={accentClass}
        />
        <AxisControl 
          label="Right (Y)" 
          icon={MoveHorizontal} 
          iconColor="text-green-500" 
          value={value.y} 
          onChange={(v) => handleChange('y', v)}
          accentClass={accentClass}
        />
        <AxisControl 
          label="Down (Z)" 
          icon={ArrowUpDown} 
          iconColor="text-blue-500" 
          value={value.z} 
          onChange={(v) => handleChange('z', v)}
          accentClass={accentClass}
        />
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
        headerColor="bg-cyan-500"
        accentClass="accent-cyan-500"
      />
      <InputGroup 
        label="Slave Antenna" 
        value={config.slave} 
        onChange={(v) => onChange({ ...config, slave: v })} 
        headerColor="bg-orange-500"
        accentClass="accent-orange-500"
      />
    </div>
  );
};
