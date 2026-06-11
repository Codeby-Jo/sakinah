import React from 'react';

interface SakinahShellProps {
  children: React.ReactNode;
}

export const SakinahShell: React.FC<SakinahShellProps> = ({ children }) => {
  return (
    <div className="sk-viewport pb-0 pt-0 sm:pt-8">
      <div className="flex justify-center items-start gap-8 xl:gap-12 max-w-6xl mx-auto w-full px-0 sm:px-6 h-full flex-1">
        <div className="w-full lg:max-w-[700px] xl:max-w-[800px] flex-1 bg-transparent sm:bg-[linear-gradient(180deg,var(--sk-bg2),#070a10)] sm:border sm:border-[rgba(255,255,255,0.04)] sm:rounded-[32px] sm:shadow-[var(--sk-shadow)] relative flex flex-col shrink-0 min-h-[100dvh] sm:min-h-[calc(100vh-6rem)] sm:mb-12">
          <div className="flex-1 relative h-full">
            <div className="inset-0 px-[22px] sm:px-[48px] lg:px-[64px] pt-6 sm:pt-10 pb-[120px]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
