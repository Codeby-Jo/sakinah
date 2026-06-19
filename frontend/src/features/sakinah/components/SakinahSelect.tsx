import React, { type SelectHTMLAttributes } from 'react';

export interface SakinahSelectOption {
  value: string;
  label: string;
}

export interface SakinahSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
  label?: string;
  placeholder?: string;
  options: SakinahSelectOption[];
  error?: string;
}

export const SakinahSelect: React.FC<SakinahSelectProps> = ({
  label,
  placeholder,
  options,
  error,
  className = '',
  required,
  value,
  ...props
}) => {
  // If no value is provided, fallback to "" so it shows the placeholder
  const currentValue = value ?? "";
  
  // To style the select text when placeholder is selected
  const isPlaceholderSelected = currentValue === "";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#D4A853] flex items-center gap-2">
          {label}
          {required && <span className="text-[#D4A853]/60">*</span>}
        </label>
      )}
      <div className="relative group">
        <select
          value={currentValue}
          required={required}
          className={`w-full bg-[#111826] border ${
            error 
              ? 'border-red-500/50 focus:border-red-500' 
              : 'border-[rgba(255,255,255,0.06)] focus:border-[#D4A853] hover:border-[rgba(255,255,255,0.12)]'
          } rounded-[14px] p-4 pr-12 text-[14px] font-light focus:outline-none appearance-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isPlaceholderSelected ? 'text-[#5f6675]' : 'text-[#EDE7DA]'
          }`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-[#5f6675] hidden">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#111826] text-[#EDE7DA] py-2">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#5f6675] group-hover:text-[#D4A853] transition-colors">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {error && <p className="text-[11px] text-[#e87c7c] mt-1 pl-1">{error}</p>}
    </div>
  );
};
