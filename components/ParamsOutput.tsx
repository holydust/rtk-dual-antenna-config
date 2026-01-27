
import React, { useState } from 'react';
import { ArduParams, Px4Params, FlightControllerMode } from '../types';
import { Clipboard, CheckCircle2 } from 'lucide-react';

interface ParamsOutputProps {
  mode: FlightControllerMode;
  arduParams: ArduParams;
  px4Params: Px4Params;
}

interface ParamItemProps {
  name: string;
  value: string | number | React.ReactNode;
  copyValue?: string;
  isFixed?: boolean;
  highlight?: boolean;
}

const ParamItem = ({ name, value, copyValue, isFixed, highlight }: ParamItemProps) => {
  const [copied, setCopied] = useState(false);
  
  // Resolve display content and clipboard text
  let content = value;
  let textToCopy = copyValue;

  if (typeof value === 'number') {
    const formatted = !Number.isInteger(value) ? value.toFixed(3) : value.toString();
    content = formatted;
    if (!textToCopy) textToCopy = formatted;
  } else if (typeof value === 'string' && !textToCopy) {
    textToCopy = value;
  }

  const copy = () => {
    navigator.clipboard.writeText(textToCopy || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`group flex items-center justify-between p-2 rounded-lg border transition-all pointer-events-auto ${
      isFixed 
        ? 'bg-zinc-800/50 border-zinc-700/50' 
        : highlight
          ? 'bg-indigo-950/30 border-indigo-500/30 hover:bg-indigo-900/20'
          : 'bg-zinc-950/60 border-zinc-800/50 hover:bg-zinc-900'
    }`}>
      <div className="flex flex-col overflow-hidden min-w-0">
        <span className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase truncate pr-2">{name}</span>
        <div className={`font-mono text-white truncate ${isFixed ? 'text-base font-bold' : 'text-sm'}`}>
          {content}
        </div>
      </div>
      <button 
        onClick={copy}
        className={`p-1.5 rounded transition-colors shrink-0 ${copied ? 'text-green-500' : 'text-zinc-600 hover:text-white'}`}
      >
        {copied ? <CheckCircle2 size={14} /> : <Clipboard size={14} />}
      </button>
    </div>
  );
};

export const ParamsOutput: React.FC<ParamsOutputProps> = ({ mode, arduParams, px4Params }) => {
  const handleCopyAll = () => {
    let text = "";
    
    if (mode === 'ardupilot') {
      text = [
        `GPS1_TYPE = 25`,
        `GPS1_MB_TYPE = ${arduParams.GPS1_MB_TYPE}`,
        `GPS1_MB_OFS_X = ${arduParams.GPS1_MB_OFS_X.toFixed(3)}`,
        `GPS1_MB_OFS_Y = ${arduParams.GPS1_MB_OFS_Y.toFixed(3)}`,
        `GPS1_MB_OFS_Z = ${arduParams.GPS1_MB_OFS_Z.toFixed(3)}`,
        `GPS1_POS_X = ${arduParams.GPS1_POS_X.toFixed(3)}`,
        `GPS1_POS_Y = ${arduParams.GPS1_POS_Y.toFixed(3)}`,
        `GPS1_POS_Z = ${arduParams.GPS1_POS_Z.toFixed(3)}`,
      ].join('\n');
    } else {
      text = [
        `GPS_1_PROTOCOL = ${px4Params.GPS_1_PROTOCOL}`,
        `EKF2_GPS_CTRL = ${px4Params.EKF2_GPS_CTRL}`,
        `GPS_YAW_OFFSET = ${px4Params.GPS_YAW_OFFSET.toFixed(1)}`,
      ].join('\n');
    }

    navigator.clipboard.writeText(text);
    alert(`${mode === 'ardupilot' ? 'ArduPilot' : 'PX4'} parameters copied!`);
  };

  const themeColor = mode === 'ardupilot' ? 'text-cyan-500 hover:text-cyan-400' : 'text-purple-500 hover:text-purple-400';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
         <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">
           {mode === 'ardupilot' ? 'ArduPilot Params' : 'PX4 Params'}
         </h2>
      </div>

      <div className="space-y-3">
        {mode === 'ardupilot' ? (
          <>
            {/* ArduPilot Fixed */}
            <div className="flex flex-col gap-1">
              <ParamItem name="GPS1_TYPE" value={25} isFixed={true} />
              <ParamItem name="GPS1_MB_TYPE" value={arduParams.GPS1_MB_TYPE} isFixed={true} />
            </div>
            
            {/* ArduPilot Calculated */}
            <div>
              <div className="flex justify-between items-end mb-1.5 px-1 mt-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Calculated</span>
                  <button onClick={handleCopyAll} className={`text-[10px] uppercase font-bold tracking-tight pointer-events-auto ${themeColor}`}>
                    Copy All
                  </button>
              </div>
              <div className="space-y-1">
                  <ParamItem name="GPS1_MB_OFS_X" value={arduParams.GPS1_MB_OFS_X} />
                  <ParamItem name="GPS1_MB_OFS_Y" value={arduParams.GPS1_MB_OFS_Y} />
                  <ParamItem name="GPS1_MB_OFS_Z" value={arduParams.GPS1_MB_OFS_Z} />
                  <div className="h-1"></div>
                  <ParamItem name="GPS1_POS_X" value={arduParams.GPS1_POS_X} />
                  <ParamItem name="GPS1_POS_Y" value={arduParams.GPS1_POS_Y} />
                  <ParamItem name="GPS1_POS_Z" value={arduParams.GPS1_POS_Z} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* PX4 Fixed / Setup */}
            <div className="flex flex-col gap-1">
              <ParamItem 
                name="GPS_1_PROTOCOL" 
                value={
                  <div className="flex items-baseline gap-1.5 overflow-hidden">
                    <span>6</span>
                    <span className="text-[10px] text-zinc-500 font-normal truncate opacity-80" title="(NMEA)">(NMEA)</span>
                  </div>
                }
                copyValue="6 (NMEA)"
                isFixed={true} 
              />
              <ParamItem 
                name="EKF2_GPS_CTRL" 
                value={
                  <div className="flex items-baseline gap-1.5 overflow-hidden">
                    <span>15</span>
                    <span className="text-[10px] text-zinc-500 font-normal truncate opacity-80" title="(Dual Antenna)">(Dual Antenna)</span>
                  </div>
                } 
                copyValue="15 (Dual Antenna)"
                isFixed={true} 
              />
            </div>

            {/* PX4 Calculated */}
            <div>
               <div className="flex justify-between items-end mb-1.5 px-1 mt-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Calculated</span>
                  <button onClick={handleCopyAll} className={`text-[10px] uppercase font-bold tracking-tight pointer-events-auto ${themeColor}`}>
                    Copy All
                  </button>
               </div>
               <div className="space-y-1">
                  {/* Highlight Yaw Offset as it is the most critical PX4 param */}
                  <ParamItem name="GPS_YAW_OFFSET" value={px4Params.GPS_YAW_OFFSET} highlight={true} />
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
