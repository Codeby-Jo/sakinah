import React from 'react';

interface SafetyNoticeProps {
  message: string;
  className?: string;
}

export const SafetyNotice: React.FC<SafetyNoticeProps> = ({ message, className = '' }) => {
  return (
    <div className={`p-[16px] rounded-[14px] border border-[rgba(201,138,138,0.2)] bg-[rgba(201,138,138,0.05)] flex items-start gap-[12px] ${className}`}>
      <span className="text-[#C98A8A] text-[18px] shrink-0 mt-[2px]">🛡️</span>
      <p className="text-[#9aa0ac] text-[13px] leading-[1.5] font-light">
        <span className="font-medium text-[#C98A8A] mr-1">Safety Notice:</span>
        {message}
      </p>
    </div>
  );
};
