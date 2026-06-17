import React from 'react';

export interface SakinahDatePickerProps {
  label: string;
  value: string;
  onChange: (date: string, age: number) => void;
  error?: string;
  required?: boolean;
}

export const SakinahDatePicker: React.FC<SakinahDatePickerProps> = ({
  label, value, onChange, error, required
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    let age = 0;
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    onChange(dob, age);
  };

  return (
    <div className="space-y-2">
      <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#D4A853] flex items-center gap-2">
        {label}
        {required && <span className="text-[#D4A853]/60">*</span>}
      </label>
      <input
        type="date"
        value={value}
        onChange={handleChange}
        required={required}
        className={`w-full bg-[#111826] border ${
          error ? 'border-red-500/50 focus:border-red-500' : 'border-[rgba(255,255,255,0.06)] focus:border-[#D4A853] hover:border-[rgba(255,255,255,0.12)]'
        } rounded-[14px] p-4 text-[14px] font-light focus:outline-none transition-colors text-[#EDE7DA] color-scheme-dark`}
        style={{ colorScheme: 'dark' }}
      />
      {error && <p className="text-[11px] text-[#e87c7c] mt-1 pl-1">{error}</p>}
    </div>
  );
};
