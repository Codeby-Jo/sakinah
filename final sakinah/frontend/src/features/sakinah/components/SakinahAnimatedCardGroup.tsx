import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';

export interface CardOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface SakinahAnimatedCardGroupProps {
  options: CardOption[];
  value: string | string[];
  onChange: (val: any) => void;
  columns?: 1 | 2 | 3;
  multi?: boolean;
}

export const SakinahAnimatedCardGroup: React.FC<SakinahAnimatedCardGroupProps> = ({
  options,
  value,
  onChange,
  columns = 2,
  multi = false,
}) => {
  const gridCols = columns === 1 ? 'grid-cols-1' : columns === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2';

  const handleSelect = (optValue: string) => {
    if (multi) {
      const valArray = Array.isArray(value) ? value : [];
      if (valArray.includes(optValue)) {
        onChange(valArray.filter(v => v !== optValue));
      } else {
        onChange([...valArray, optValue]);
      }
    } else {
      onChange(optValue);
    }
  };

  return (
    <div className={`grid ${gridCols} gap-3`}>
      {options.map((opt) => {
        const isSelected = multi 
          ? Array.isArray(value) && value.includes(opt.value)
          : value === opt.value;
          
        return (
          <motion.div
            key={opt.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(opt.value)}
            className={`relative flex flex-col p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
              isSelected
                ? 'bg-[rgba(212,175,55,0.1)] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                : 'bg-[#050816] border-[rgba(212,175,55,0.15)] hover:border-[rgba(212,175,55,0.4)] hover:bg-[rgba(212,175,55,0.03)]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {opt.icon && <span className={isSelected ? 'text-[#D4AF37]' : 'text-white/50'}>{opt.icon}</span>}
                <span className={`text-[14px] font-medium transition-colors ${isSelected ? 'text-[#F5D77A]' : 'text-white/80'}`}>
                  {opt.label}
                </span>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <CheckCircle weight="fill" className="text-[#D4AF37] w-5 h-5" />
                </motion.div>
              )}
            </div>
            {opt.description && (
              <span className={`text-[11px] leading-relaxed transition-colors mt-1 ${isSelected ? 'text-[#D4AF37]/80' : 'text-white/40'}`}>
                {opt.description}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
