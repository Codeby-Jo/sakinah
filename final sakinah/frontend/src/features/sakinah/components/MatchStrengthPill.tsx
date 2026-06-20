import React from 'react';

interface MatchStrengthPillProps {
  strengthLevel: 'STRONG' | 'MODERATE' | 'SUITABLE';
  className?: string;
}

export const MatchStrengthPill: React.FC<MatchStrengthPillProps> = ({ strengthLevel, className = '' }) => {
  // No percentages shown as per safety rule
  const strengthLabels = {
    STRONG: 'Strong Compatibility',
    MODERATE: 'Moderate Compatibility',
    SUITABLE: 'Suitable Match'
  };

  return (
    <div className={`inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-full border border-[rgba(212,168,83,0.2)] bg-[rgba(212,168,83,0.08)] ${className}`}>
      <span className="w-[6px] h-[6px] rounded-full bg-[#D4A853]" />
      <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#e7c984]">
        {strengthLabels[strengthLevel]}
      </span>
    </div>
  );
};
