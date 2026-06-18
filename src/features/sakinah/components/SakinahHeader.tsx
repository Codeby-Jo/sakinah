import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';

export interface SakinahHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
}

export const SakinahHeader: React.FC<SakinahHeaderProps> = ({ 
  title = 'Sakinah', 
  subtitle = 'NEXUS INTELLIGENCE SYSTEM',
  onBack 
}) => {
  const { isWaliViewOnly } = useOnboarding();

  return (
    <header className="flex items-center gap-4 py-3 mb-6 relative justify-between">
      <div className="flex items-center gap-4">
        {onBack && (
        <button 
          onClick={onBack}
          className="group w-[38px] h-[38px] rounded-full border border-[rgba(255,255,255,0.08)] hover:border-[#D4A853] hover:bg-[rgba(212,168,83,0.05)] text-[#9aa0ac] hover:text-[#D4A853] flex items-center justify-center cursor-pointer shrink-0 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4A853] focus:ring-offset-2 focus:ring-offset-[#07090f]"
          aria-label="Go back"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
      )}
        <div>
          <h1 className="font-serif text-[24px] font-medium text-[#EDE7DA] leading-none tracking-wide">{title}</h1>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#D4A853]/70 mt-1.5">{subtitle}</p>
        </div>
      </div>
      
      {isWaliViewOnly && (
        <div className="hidden md:flex bg-gradient-to-r from-[rgba(26,54,40,0.5)] to-[rgba(16,33,24,0.5)] border border-[rgba(66,135,101,0.3)] rounded-lg py-1.5 px-3 items-center justify-center gap-2 shadow-[0_0_15px_rgba(66,135,101,0.15)]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4BB543] shadow-[0_0_8px_#4BB543] animate-pulse" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-[#A8DAB5] uppercase tracking-widest leading-none mb-0.5">WALI MODE</span>
            <span className="text-[8px] text-[#A8DAB5]/60 uppercase tracking-widest leading-none">Family Representative</span>
          </div>
        </div>
      )}
    </header>
  );
};
