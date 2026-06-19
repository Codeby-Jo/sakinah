import React from 'react';
import { SakinahCard } from './SakinahCard';

export const EmptyMatchState: React.FC = () => {
  return (
    <SakinahCard padding="lg" className="flex flex-col items-center justify-center text-center py-[60px] px-[20px]">
      <div className="relative w-[80px] h-[80px] rounded-full border border-[rgba(212,168,83,0.16)] flex items-center justify-center mb-[24px] shadow-[0_0_20px_rgba(212,168,83,0.05)]">
        <div className="absolute inset-0 bg-[#D4A853] rounded-full opacity-5"></div>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(212,168,83,0.6)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v4"></path>
          <path d="M12 16h.01"></path>
        </svg>
      </div>
      <h2 className="font-serif text-[28px] text-[#EDE7DA] mb-[12px]">No Matches Right Now</h2>
      <p className="text-[14px] text-[#9aa0ac] font-light leading-[1.6] max-w-[280px]">
        We do not have someone suitable enough to show right now. We would rather wait than show the wrong person.
      </p>
    </SakinahCard>
  );
};
