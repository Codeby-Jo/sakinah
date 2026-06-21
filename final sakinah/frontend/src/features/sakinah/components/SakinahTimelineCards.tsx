import React from 'react';
import { motion } from 'framer-motion';

export interface TimelineOption {
  value: string;
  label: string;
  description?: string;
}

export interface SakinahTimelineCardsProps {
  options: TimelineOption[];
  value: string;
  onChange: (val: string) => void;
}

export const SakinahTimelineCards: React.FC<SakinahTimelineCardsProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    <div className="relative pl-6 space-y-4">
      {/* Connecting vertical line */}
      <div className="absolute left-[11px] top-6 bottom-6 w-[2px] bg-[rgba(212,175,55,0.15)] z-0" />
      
      {options.map((opt, i) => {
        const isSelected = value === opt.value;
        const isPast = options.findIndex(o => o.value === value) > i && value !== '';
        
        return (
          <div key={opt.value} className="relative z-10 flex items-start group cursor-pointer" onClick={() => onChange(opt.value)}>
            {/* Timeline node */}
            <div className={`absolute -left-[24px] mt-[18px] w-6 h-6 rounded-full flex items-center justify-center bg-[#050816] transition-colors duration-300 ${isSelected ? 'border-[#D4AF37]' : 'border-[rgba(212,175,55,0.2)]'} border-2`}>
              {isSelected ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full shadow-[0_0_8px_rgba(212,175,55,1)]" />
              ) : isPast ? (
                <div className="w-1.5 h-1.5 bg-[#D4AF37]/50 rounded-full" />
              ) : null}
            </div>

            {/* Card content */}
            <motion.div
              whileHover={{ x: 4 }}
              className={`flex-1 p-4 rounded-xl border transition-all duration-300 ml-4 ${
                isSelected
                  ? 'bg-gradient-to-br from-[rgba(212,175,55,0.1)] to-[rgba(140,98,32,0.05)] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                  : 'bg-[#050816] border-[rgba(212,175,55,0.3)] hover:border-[rgba(212,175,55,0.3)]'
              }`}
            >
              <div className={`text-[15px] font-medium mb-1 transition-colors ${isSelected ? 'text-[#F5D77A]' : 'text-white/80 group-hover:text-white'}`}>
                {opt.label}
              </div>
              {opt.description && (
                <div className={`text-[12px] leading-relaxed transition-colors ${isSelected ? 'text-[#D4AF37]/80' : 'text-white/40 group-hover:text-white/60'}`}>
                  {opt.description}
                </div>
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};
