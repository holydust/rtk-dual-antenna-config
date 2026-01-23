
import React, { useState } from 'react';
import { ArduParams } from '../types';
import { Clipboard, CheckCircle2 } from 'lucide-react';

interface ParamsOutputProps {
  params: ArduParams;
}

const ParamItem = ({ name, value, isFixed }: { name: string, value: number, isFixed?: boolean }) => {
  const [copied, setCopied] = useState(false);
  const formattedValue = isFixed ? value.toString() : value.toFixed(3);

  const copy = () => {
    navigator.clipboard.writeText(formattedValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group flex items-center justify-between p-2 rounded-lg border transition-all pointer-events-auto ${
      isFixed 
        ? 'bg-zinc-800/50 border-zinc-700/50' 
        : 'bg-zinc-950/60 border-zinc-800/50 hover:bg-zinc-900'
    }`}>
      <div className="flex flex-col">
        <span className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase">{name}</span>
        <span className={`font-mono text-white ${isFixed ? 'text-base font-bold' : 'text-sm'}`}>
          {formattedValue}
        </span>
      </div>
      <button 
        onClick={copy}
        className="p-1.5 text-zinc-600 hover:text-cyan-400 rounded transition-colors"
      >
        {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Clipboard size={14} />}
      </button>
    </div>
  );
};

export const ParamsOutput: React.FC<ParamsOutputProps> = ({ params }) => {
  const handleCopyAll = () => {
    const text = [
      `GPS1_TYPE = 25`,
      `GPS1_MB_TYPE = ${params.GPS1_MB_TYPE}`,
      `GPS1_MB_OFS_X = ${params.GPS1_MB_OFS_X.toFixed(3)}`,
      `GPS1_MB_OFS_Y = ${params.GPS1_MB_OFS_Y.toFixed(3)}`,
      `GPS1_MB_OFS_Z = ${params.GPS1_MB_OFS_Z.toFixed(3)}`,
      `GPS1_POS_X = ${params.GPS1_POS_X.toFixed(3)}`,
      `GPS1_POS_Y = ${params.GPS1_POS_Y.toFixed(3)}`,
      `GPS2_POS_Z = ${params.GPS2_POS_Z.toFixed(3)}`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    alert('All parameters copied to clipboard!');
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
         <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">Parameters</h2>
      </div>

      <div className="space-y-3">
        {/* Fixed Parameters Section - No Label as requested */}
        <div className="flex flex-col gap-1">
          <ParamItem name="GPS1_TYPE" value={25} isFixed={true} />
          <ParamItem name="GPS1_MB_TYPE" value={params.GPS1_MB_TYPE} isFixed={true} />
        </div>
        
        {/* Results Section with Copy Button Header */}
        <div>
           <div className="flex justify-between items-end mb-1.5 px-1 mt-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">Calculated Results</span>
              <button 
                onClick={handleCopyAll}
                className="text-[10px] text-cyan-500 hover:text-cyan-400 uppercase font-bold tracking-tight pointer-events-auto"
              >
                Copy All
              </button>
           </div>
           
           <div className="space-y-1">
              <div className="text-[10px] text-zinc-600 font-mono px-1">Moving Baseline Offsets</div>
              <ParamItem name="GPS1_MB_OFS_X" value={params.GPS1_MB_OFS_X} />
              <ParamItem name="GPS1_MB_OFS_Y" value={params.GPS1_MB_OFS_Y} />
              <ParamItem name="GPS1_MB_OFS_Z" value={params.GPS1_MB_OFS_Z} />
              
              <div className="text-[10px] text-zinc-600 font-mono px-1 mt-2">Position Offsets</div>
              <ParamItem name="GPS1_POS_X" value={params.GPS1_POS_X} />
              <ParamItem name="GPS1_POS_Y" value={params.GPS1_POS_Y} />
              <ParamItem name="GPS2_POS_Z" value={params.GPS2_POS_Z} />
           </div>
        </div>
      </div>
    </div>
  );
};
