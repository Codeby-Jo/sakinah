import React from 'react';
import { SakinahShell } from './SakinahShell';

export interface SakinahLoadingStateProps {
  message?: string;
  fullPage?: boolean;
}

export const SakinahLoadingState: React.FC<SakinahLoadingStateProps> = ({ 
  message = "Seeking alignment...",
  fullPage = false 
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 border-2 border-[#D4A853] rounded-full opacity-20 animate-ping"></div>
        <div className="absolute inset-2 border-2 border-[#D4A853] rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute inset-4 bg-[#D4A853] rounded-full shadow-[0_0_15px_rgba(212,168,83,0.5)]"></div>
      </div>
      <p className="font-serif text-[18px] text-[#D4A853] animate-pulse">
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return <SakinahShell>{content}</SakinahShell>;
  }

  return content;
};
