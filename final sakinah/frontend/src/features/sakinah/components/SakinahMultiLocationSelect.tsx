import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, MapPin, MagnifyingGlass, X } from '@phosphor-icons/react';

const INDIA_LOCATIONS: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
  "Telangana": ["Hyderabad", "Warangal"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Noida"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling"],
};

const ALL_STATES = Object.keys(INDIA_LOCATIONS);

interface SakinahMultiLocationSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: boolean;
}

export const SakinahMultiLocationSelect: React.FC<SakinahMultiLocationSelectProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search preferred locations...",
  error 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  
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

  const statesList = useMemo(() => {
    return ALL_STATES.filter(s => s.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const citiesList = useMemo(() => {
    if (!selectedState) return [];
    return INDIA_LOCATIONS[selectedState].filter(c => c.toLowerCase().includes(search.toLowerCase()));
  }, [search, selectedState]);

  const handleSelectCity = (city: string) => {
    const finalLocation = `${city}, ${selectedState}`;
    if (!value.includes(finalLocation)) {
      onChange([...value, finalLocation]);
    }
  };

  const handleRemoveCity = (cityToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== cityToRemove));
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className={`w-full min-h-[56px] px-3 py-3 bg-[#050816] border ${error ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-[rgba(212,175,55,0.15)]'} rounded-xl text-white text-[15px] cursor-pointer flex flex-wrap gap-2 items-center transition-all hover:border-[rgba(212,175,55,0.3)]`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MapPin size={18} className="text-[#D4AF37] shrink-0 ml-2" weight="fill" />
        
        {value.length === 0 && (
          <span className="text-white/40 ml-1">{placeholder}</span>
        )}

        <AnimatePresence>
          {value.map((loc) => (
            <motion.div
              key={loc}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F5D77A] px-3 py-1.5 rounded-full text-[13px] font-medium"
            >
              {loc.split(',')[0]}
              <X 
                size={14} 
                className="cursor-pointer hover:text-white transition-colors" 
                onClick={(e) => handleRemoveCity(loc, e)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="ml-auto mr-2">
          <CaretDown size={16} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-[#0B1020] border border-[rgba(212,175,55,0.2)] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[300px]"
          >
            <div className="p-3 border-b border-[rgba(212,175,55,0.1)] flex items-center gap-3 bg-[#050816]">
              <MagnifyingGlass size={16} className="text-[#D4AF37]" />
              <input 
                autoFocus
                type="text"
                placeholder={selectedState ? `Search cities in ${selectedState}...` : "Search states..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-sm text-white placeholder-white/30"
              />
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1 p-2">
              {selectedState && (
                <div 
                  onClick={() => { setSelectedState(null); setSearch(''); }}
                  className="px-4 py-2 mb-2 text-[11px] uppercase tracking-wider text-[#F5D77A]/80 cursor-pointer hover:bg-white/5 rounded-md transition-colors flex items-center gap-2"
                >
                  ← Back to States
                </div>
              )}

              {!selectedState ? (
                statesList.length > 0 ? (
                  statesList.map(state => (
                    <div 
                      key={state}
                      onClick={(e) => { e.stopPropagation(); setSelectedState(state); setSearch(''); }}
                      className="px-4 py-3 hover:bg-[rgba(212,175,55,0.1)] rounded-lg cursor-pointer transition-colors text-sm text-white/90 flex items-center justify-between group"
                    >
                      {state}
                      <span className="text-[10px] text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">Select →</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-white/40 text-sm">No states found</div>
                )
              ) : (
                citiesList.length > 0 ? (
                  citiesList.map(city => {
                    const finalLoc = `${city}, ${selectedState}`;
                    const isSelected = value.includes(finalLoc);
                    return (
                      <div 
                        key={city}
                        onClick={(e) => { e.stopPropagation(); handleSelectCity(city); }}
                        className={`px-4 py-3 rounded-lg cursor-pointer transition-colors text-sm flex justify-between items-center ${isSelected ? 'bg-[#D4AF37]/20 text-[#F5D77A]' : 'hover:bg-[rgba(212,175,55,0.1)] text-white/90'}`}
                      >
                        {city}
                        {isSelected && <span className="text-[10px] text-[#D4AF37]">Selected</span>}
                      </div>
                    )
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-white/40 text-sm">No cities found</div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
