import React from 'react';
import { motion } from 'framer-motion';

export interface SakinahSegmentedControlProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
}

export const SakinahSegmentedControl: React.FC<SakinahSegmentedControlProps> = ({
  options,
  value,
  onChange,
}) => {
  return (
    <div className="relative flex p-1 bg-[#050816] rounded-xl border border-[rgba(212,175,55,0.15)]">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative flex-1 py-3 text-[14px] font-medium rounded-lg z-10 transition-colors duration-300 ${
              isSelected ? 'text-[#050816]' : 'text-white/60 hover:text-white/90'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId={`segmented-bg-${options[0].value}`}
                className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] rounded-lg -z-10 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
