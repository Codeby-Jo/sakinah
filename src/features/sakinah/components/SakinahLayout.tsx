import React from 'react';
import { SakinahSidebar } from './SakinahSidebar';
import { useOnboarding } from '../context/OnboardingContext';

interface SakinahLayoutProps {
  children: React.ReactNode;
}

export const SakinahLayout: React.FC<SakinahLayoutProps> = ({ children }) => {
  const { isWaliViewOnly } = useOnboarding();

  return (
    <div className="flex min-h-screen bg-[#0A0E16]">
      {/* Sidebar hidden on small screens */}
      <div className="hidden md:block w-[280px] shrink-0">
        <SakinahSidebar />
      </div>
      
      {/* Mobile top bar (simplified) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-[#0A0E16] border-b border-[rgba(255,255,255,0.05)] z-40 flex items-center px-4">
        <div className="text-[var(--sk-gold)] font-serif text-[24px]">S</div>
      </div>

      <div className="flex-1 overflow-x-hidden flex flex-col pt-[60px] md:pt-0 relative">
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
