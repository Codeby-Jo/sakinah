import React, { useState, useEffect, useRef } from 'react';

export interface SakinahDualSliderProps {
  min: number;
  max: number;
  minVal: number;
  maxVal: number;
  onChange: (min: number, max: number) => void;
}

export const SakinahDualSlider: React.FC<SakinahDualSliderProps> = ({
  min,
  max,
  minVal,
  maxVal,
  onChange
}) => {
  const [minP, setMinP] = useState(minVal);
  const [maxP, setMaxP] = useState(maxVal);
  const range = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMinP(minVal || min);
    setMaxP(maxVal || max);
  }, [minVal, maxVal, min, max]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxP - 1);
    setMinP(value);
    onChange(value, maxP);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minP + 1);
    setMaxP(value);
    onChange(minP, value);
  };

  const minPercent = Math.round(((minP - min) / (max - min)) * 100);
  const maxPercent = Math.round(((maxP - min) / (max - min)) * 100);

  return (
    <div className="relative pt-6 pb-2">
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#F5D77A]/50 uppercase tracking-widest mb-1">Minimum</span>
          <span className="text-[20px] font-serif text-white">{minP}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-[#F5D77A]/50 uppercase tracking-widest mb-1">Maximum</span>
          <span className="text-[20px] font-serif text-white">{maxP}</span>
        </div>
      </div>

      <div className="relative h-2 w-full">
        {/* Track */}
        <div className="absolute inset-0 bg-[#050816] border border-[rgba(212,175,55,0.15)] rounded-full z-0" />
        
        {/* Active Range */}
        <div
          ref={range}
          className="absolute h-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] rounded-full z-10 shadow-[0_0_10px_rgba(212,175,55,0.4)]"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />

        {/* Inputs */}
        <input
          type="range"
          min={min}
          max={max}
          value={minP}
          onChange={handleMinChange}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none z-20"
          style={{ WebkitAppearance: 'none' }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxP}
          onChange={handleMaxChange}
          className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none z-30"
          style={{ WebkitAppearance: 'none' }}
        />
      </div>

      {/* Global styles for range thumb so they are clickable despite pointer-events-none on the track */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          pointer-events: all;
          width: 24px;
          height: 24px;
          -webkit-appearance: none;
          border-radius: 50%;
          background: #0B1020;
          border: 2px solid #D4AF37;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(212,175,55,0.5);
          position: relative;
          z-index: 40;
          margin-top: -11px;
        }
        input[type=range]::-moz-range-thumb {
          pointer-events: all;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #0B1020;
          border: 2px solid #D4AF37;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(212,175,55,0.5);
          position: relative;
          z-index: 40;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 2px;
          cursor: pointer;
          background: transparent;
        }
        input[type=range]::-moz-range-track {
          width: 100%;
          height: 2px;
          cursor: pointer;
          background: transparent;
        }
      `}</style>
    </div>
  );
};
