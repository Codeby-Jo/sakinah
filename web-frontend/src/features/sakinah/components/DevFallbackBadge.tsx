import React from 'react';

export interface DevFallbackBadgeProps {
  message?: string;
}

export const DevFallbackBadge: React.FC<DevFallbackBadgeProps> = ({ 
  message = "Backend is not connected, so safe demo data is being used." 
}) => {
  return (
    <div className="relative overflow-hidden bg-[rgba(212,168,83,0.05)] border border-[rgba(212,168,83,0.2)] rounded-[14px] p-4 my-4 group">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#D4A853] to-transparent opacity-50"></div>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 animate-pulse text-[#D4A853]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div>
          <h4 className="font-serif text-[14px] text-[#D4A853] mb-1 font-medium tracking-wide">
            Development Preview Mode
          </h4>
          <p className="text-[13px] text-[#D4A853]/70 leading-relaxed font-light">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};
