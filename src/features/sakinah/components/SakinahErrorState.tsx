import React from 'react';
import { SakinahShell } from './SakinahShell';
import { SakinahButton } from './SakinahButton';

export interface SakinahErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

export const SakinahErrorState: React.FC<SakinahErrorStateProps> = ({ 
  title = "A gentle pause",
  message = "We encountered a momentary issue while processing your request. Please take a breath and try again.",
  onRetry,
  fullPage = false 
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <div className="w-16 h-16 rounded-full bg-[rgba(201,138,138,0.1)] border border-[rgba(201,138,138,0.2)] flex items-center justify-center mb-6 text-[#C98A8A]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h2 className="font-serif text-[22px] text-[#EDE7DA] mb-3">{title}</h2>
      <p className="text-[14px] font-light text-[#9aa0ac] max-w-sm mx-auto mb-8 leading-[1.6]">
        {message}
      </p>
      {onRetry && (
        <SakinahButton variant="secondary" onClick={onRetry} fullWidth={false}>
          Try Again
        </SakinahButton>
      )}
    </div>
  );

  if (fullPage) {
    return <SakinahShell>{content}</SakinahShell>;
  }

  return content;
};
