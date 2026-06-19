import React from 'react';
import { SakinahSidebar } from './SakinahSidebar';
import { useOnboarding } from '../context/OnboardingContext';

interface SakinahLayoutProps {
  children: React.ReactNode;
}

export const SakinahLayout: React.FC<SakinahLayoutProps> = ({ children }) => {
  const { isWaliViewOnly } = useOnboarding();
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <div className="flex h-screen bg-[#0A0E16] overflow-hidden">
      {/* Sidebar hidden on small screens */}
      <div className="hidden md:block shrink-0">
        <SakinahSidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      </div>
      
      {/* Mobile top bar (simplified) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-[#0A0E16] border-b border-[rgba(255,255,255,0.05)] z-40 flex items-center justify-between px-4">
        <div className="text-[var(--sk-gold)] font-serif text-[24px]">S</div>
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-[12px] text-[var(--sk-gold)] bg-[rgba(212,168,83,0.08)] border border-[rgba(212,168,83,0.2)] px-3 py-1.5 rounded-lg"
        >
          ← Back
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col pt-[60px] md:pt-0 relative min-h-screen">
        {isWaliViewOnly && (
          <div className="bg-[rgba(201,138,138,0.1)] border-b border-[rgba(201,138,138,0.2)] text-[var(--sk-rose)] text-[13px] text-center py-2 px-4 font-medium z-50 shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
            🔒 View Only Mode: You are logged in as a Wali. This account has read-only access and cannot modify data or communicate with other users.
          </div>
        )}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

