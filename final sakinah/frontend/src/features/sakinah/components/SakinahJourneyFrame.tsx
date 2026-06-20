import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SakinahJourneyNavigator } from './SakinahJourneyNavigator';

interface SakinahJourneyFrameProps {
  children: React.ReactNode;
  leftRail?: React.ReactNode;
  rightRail?: React.ReactNode;
}

export const SakinahJourneyFrame: React.FC<SakinahJourneyFrameProps> = ({ 
  children, 
  leftRail, 
  rightRail 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="sk-viewport pb-0 pt-0 sm:pt-0 flex flex-col min-h-screen relative">
      {/* Mobile Journey Toggle Bar */}
      <div className="lg:hidden w-full bg-[#070a10] border-b border-[rgba(255,255,255,0.05)] p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="text-[14px] font-medium text-[#c8a153] tracking-wider">SAKINAH JOURNEY</div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-lg text-[13px] font-medium text-white transition-colors"
        >
          {isMobileMenuOpen ? 'Close Menu' : 'Open Journey'}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[#070a10] flex flex-col animate-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 flex justify-end border-b border-[rgba(255,255,255,0.05)]">
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-4 py-2 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] rounded-lg text-[13px] font-medium text-white transition-colors"
            >
              Close Menu
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <SakinahJourneyNavigator onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="flex w-full min-h-screen flex-1">
        
        {/* Left Rail (Desktop only) - Fixed */}
        <aside className="hidden lg:flex flex-col w-[280px] xl:w-[312px] flex-shrink-0 pt-2 shrink-0 fixed left-0 top-0 bottom-0 bg-[#070a10]/50 backdrop-blur-md border-r border-[rgba(255,255,255,0.05)] z-40 overflow-y-auto custom-scrollbar">
          <SakinahJourneyNavigator />
          {leftRail}
        </aside>

        {/* Main Content Area - Offset by fixed sidebar */}
        <div className="flex-1 lg:ml-[280px] xl:ml-[312px] flex justify-center items-start gap-8 xl:gap-12 w-full px-0 sm:px-6 h-full min-h-screen py-0 sm:py-8">
          
          <div className="w-full lg:max-w-[700px] xl:max-w-[800px] flex-1 bg-transparent sm:bg-[linear-gradient(180deg,var(--sk-bg2),#070a10)] sm:border sm:border-[rgba(255,255,255,0.04)] sm:rounded-[32px] sm:shadow-[var(--sk-shadow)] relative flex flex-col shrink-0 min-h-[100dvh] sm:min-h-[calc(100vh-4rem)]">
            
            {/* Viewport for screens */}
            <div className="flex-1 relative h-full">
              <div className="inset-0 px-[22px] sm:px-[48px] lg:px-[64px] pt-6 sm:pt-10 pb-[120px]">
                {children}
              </div>
            </div>
          </div>

          {/* Right Rail (Desktop only) */}
          {rightRail && (
            <aside className="hidden xl:block w-[300px] flex-shrink-0 pt-2 shrink-0 sticky top-[32px]">
              {rightRail}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
