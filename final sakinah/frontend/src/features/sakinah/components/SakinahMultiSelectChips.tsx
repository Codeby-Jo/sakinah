import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from '@phosphor-icons/react';

export interface SakinahMultiSelectChipsProps {
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
  allowCustom?: boolean;
}

export const SakinahMultiSelectChips: React.FC<SakinahMultiSelectChipsProps> = ({
  options,
  value,
  onChange,
  allowCustom = true,
}) => {
  const [customInput, setCustomInput] = useState('');
  
  const selectedSet = new Set((value || []).map(s => s.trim()).filter(Boolean));
  const selectedArray = Array.from(selectedSet);

  const toggleChip = (chip: string) => {
    const newSet = new Set(selectedSet);
    if (newSet.has(chip)) {
      newSet.delete(chip);
    } else {
      newSet.add(chip);
    }
    onChange(Array.from(newSet));
  };

  const addCustomChip = () => {
    if (customInput.trim()) {
      const newChip = customInput.trim();
      if (!selectedSet.has(newChip)) {
        toggleChip(newChip);
      }
      setCustomInput('');
    }
  };

  const handleCustomAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomChip();
    }
  };

  // Combine predefined options with any custom options already selected
  const allChipsToDisplay = new Set([...options, ...selectedArray]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {Array.from(allChipsToDisplay).map((chip) => {
            const isSelected = selectedSet.has(chip);
            return (
              <motion.button
                key={chip}
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleChip(chip)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium border transition-all duration-300 ${
                  isSelected
                    ? 'bg-[rgba(212,175,55,0.15)] border-[#D4AF37] text-[#F5D77A] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                    : 'bg-[#050816] border-[rgba(212,175,55,0.2)] text-white/60 hover:text-white hover:border-[rgba(212,175,55,0.4)]'
                }`}
              >
                {chip}
                {isSelected && <X size={12} weight="bold" className="opacity-70 hover:opacity-100" />}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {allowCustom && (
        <div className="relative max-w-sm mt-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleCustomAdd}
            placeholder="Type and press Enter to add..."
            className="w-full px-4 py-2.5 bg-[#050816] border border-[rgba(212,175,55,0.3)] rounded-xl text-white text-[13px] focus:border-[#D4AF37]/60 outline-none placeholder-white/30"
          />
          <button
            type="button"
            onClick={addCustomChip}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-[rgba(212,175,55,0.1)] rounded-lg text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#050816] transition-colors"
          >
            <Plus size={14} weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
};
