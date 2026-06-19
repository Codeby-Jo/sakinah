import React, { type InputHTMLAttributes } from 'react';

export interface SakinahInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
}

export const SakinahInput: React.FC<SakinahInputProps> = ({
  label,
  error,
  className = '',
  required,
  rightElement,
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#D4A853] flex items-center gap-2">
          {label}
          {required && <span className="text-[#D4A853]/60">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          required={required}
          className={`w-full bg-[#111826] border ${
            error 
              ? 'border-red-500/50 focus:border-red-500' 
              : 'border-[rgba(255,255,255,0.06)] focus:border-[#D4A853] hover:border-[rgba(255,255,255,0.12)]'
          } rounded-[14px] p-4 text-[14px] font-light focus:outline-none transition-colors text-[#EDE7DA] placeholder-[#5f6675] disabled:opacity-50 disabled:cursor-not-allowed ${rightElement ? 'pr-12' : ''}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-[#e87c7c] mt-1 pl-1">{error}</p>}
    </div>
  );
};
