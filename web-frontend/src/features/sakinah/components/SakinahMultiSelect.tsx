import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SakinahMultiSelectProps {
  label: string;
  value: string; // Comma separated string
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export const SakinahMultiSelect: React.FC<SakinahMultiSelectProps> = ({
  label, value, onChange, options, placeholder = 'Search...', error, required
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValues = value ? value.split(',').map(v => v.trim()).filter(Boolean) : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase()) && !selectedValues.includes(o.value)
  );

  const handleSelect = (optVal: string) => {
    const newVals = [...selectedValues, optVal];
    onChange(newVals.join(', '));
    setSearch('');
  };

  const handleRemove = (optVal: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newVals = selectedValues.filter(v => v !== optVal);
    onChange(newVals.join(', '));
  };

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#D4A853] flex items-center gap-2">
        {label}
        {required && <span className="text-[#D4A853]/60">*</span>}
      </label>
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#111826] border ${
          error ? 'border-red-500/50' : isOpen ? 'border-[#D4A853]' : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'
        } rounded-[14px] p-3 min-h-[50px] font-light cursor-pointer flex flex-wrap gap-2 items-center transition-colors`}
      >
        {selectedValues.length === 0 ? (
          <span className="text-[#5f6675] px-1 text-[14px]">{placeholder}</span>
        ) : (
          selectedValues.map(val => {
            const label = options.find(o => o.value === val)?.label || val;
            return (
              <span key={val} className="flex items-center gap-1 bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.2)] text-[#D4A853] px-2 py-1 rounded-[8px] text-[12px]">
                {label}
                <button onClick={(e) => handleRemove(val, e)} className="text-[#D4A853]/60 hover:text-[#D4A853] ml-1">
                  ✕
                </button>
              </span>
            );
          })
        )}
      </div>

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
                autoFocus
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
              {filteredOptions.length === 0 ? (
                <div className="p-3 text-[12px] text-[#5f6675] text-center">No more options</div>
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
