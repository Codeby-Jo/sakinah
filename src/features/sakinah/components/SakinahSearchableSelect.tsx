import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SakinahSearchableSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  allowOther?: boolean;
}

export const SakinahSearchableSelect: React.FC<SakinahSearchableSelectProps> = ({
  label, value, onChange, options, placeholder = 'Search...', error, required, allowOther = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isOther, setIsOther] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Check if current value is in options, if not and it's not empty, it must be 'other'
    if (allowOther && value && !options.find(o => o.value === value || o.label === value)) {
      setIsOther(true);
    }
  }, [value, options, allowOther]);

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  );
  
  if (allowOther && !filteredOptions.find(o => o.value === 'other')) {
    filteredOptions.push({ value: 'other', label: 'Other' });
  }

  const handleSelect = (optVal: string) => {
    if (optVal === 'other') {
      setIsOther(true);
      onChange(''); // clear so user can type
    } else {
      setIsOther(false);
      onChange(optVal);
    }
    setIsOpen(false);
    setSearch('');
  };

  const selectedLabel = isOther ? 'Other' : (options.find(o => o.value === value)?.label || value);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#D4A853] flex items-center gap-2">
        {label}
        {required && <span className="text-[#D4A853]/60">*</span>}
      </label>
      
      {!isOther ? (
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-[#111826] border ${
            error ? 'border-red-500/50' : isOpen ? 'border-[#D4A853]' : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'
          } rounded-[14px] p-4 text-[14px] font-light cursor-pointer flex justify-between items-center transition-colors`}
        >
          <span className={selectedLabel ? 'text-[#EDE7DA]' : 'text-[#5f6675]'}>
            {selectedLabel || placeholder}
          </span>
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            <path d="M1 1.5L6 6.5L11 1.5" stroke="#5f6675" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ) : (
        <div className="flex gap-2">
          <input 
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Please specify ${label.toLowerCase()}`}
            className={`flex-1 bg-[#111826] border ${error ? 'border-red-500/50' : 'border-[#D4A853]'} rounded-[14px] p-4 text-[14px] font-light text-[#EDE7DA] outline-none`}
            autoFocus
          />
          <button 
            type="button"
            onClick={() => { setIsOther(false); onChange(''); }}
            className="px-4 text-[12px] border border-[rgba(255,255,255,0.06)] rounded-[14px] text-[#5f6675] hover:text-[#EDE7DA] bg-[#111826]"
          >
            Cancel
          </button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-[#161D2C] border border-[rgba(255,255,255,0.08)] rounded-[14px] shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-[rgba(255,255,255,0.04)]">
              <input 
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0F141F] border border-[rgba(255,255,255,0.04)] rounded-[10px] p-2 text-[13px] text-[#EDE7DA] outline-none focus:border-[#D4A853]/50"
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-[12px] text-[#5f6675] text-center">No options found</div>
              ) : (
                filteredOptions.map(opt => (
                  <div 
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className="p-3 text-[13px] text-[#EDE7DA] hover:bg-[#D4A853]/10 hover:text-[#D4A853] rounded-[8px] cursor-pointer transition-colors"
                  >
                    {opt.label}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-[11px] text-[#e87c7c] mt-1 pl-1">{error}</p>}
    </div>
  );
};
