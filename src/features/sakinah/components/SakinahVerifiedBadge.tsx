import React from 'react';
import { motion } from 'framer-motion';

export type VerificationType = 'phone' | 'email' | 'id';

interface SakinahVerifiedBadgeProps {
  type: VerificationType;
  showLabel?: boolean;
}

const getBadgeConfig = (type: VerificationType) => {
  switch (type) {
    case 'id':
      return {
        icon: '✓',
        tooltip: 'Identity Verified',
        colors: 'bg-green-500/10 text-green-500 border-green-500/20'
      };
    case 'phone':
      return {
        icon: '📱',
        tooltip: 'Phone Verified',
        colors: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      };
    case 'email':
      return {
        icon: '✉',
        tooltip: 'Email Verified',
        colors: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      };
  }
};

export const SakinahVerifiedBadge: React.FC<SakinahVerifiedBadgeProps> = ({ type, showLabel = false }) => {
  const config = getBadgeConfig(type);

  return (
    <div className="relative group inline-flex items-center">
      <div 
        className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-all ${config.colors}`}
      >
        <span className="text-[12px] leading-none">{config.icon}</span>
        {showLabel && <span>{config.tooltip}</span>}
      </div>
      
      {/* Tooltip */}
      {!showLabel && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111826] border border-[rgba(255,255,255,0.1)] text-[#EDE7DA] text-[11px] rounded-lg shadow-xl whitespace-nowrap pointer-events-none hidden group-hover:block z-50"
        >
          {config.tooltip}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-solid border-t-[#111826] border-t-4 border-x-transparent border-x-4 border-b-0" />
        </motion.div>
      )}
    </div>
  );
};
