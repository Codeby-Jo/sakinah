import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, MapPin, MagnifyingGlass } from '@phosphor-icons/react';

// Hardcoded map of Indian States & Major Cities
const INDIA_LOCATIONS: Record<string, string[]> = {
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Rohtak"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Kavaratti"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad"],
  "Manipur": ["Imphal"],
  "Meghalaya": ["Shillong"],
  "Mizoram": ["Aizawl"],
  "Nagaland": ["Kohima", "Dimapur"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Puri"],
  "Puducherry": ["Puducherry", "Oulgaret", "Karaikal"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
  "Sikkim": ["Gangtok"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Tripura": ["Agartala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Noida"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Rishikesh"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol"]
};

const ALL_STATES = Object.keys(INDIA_LOCATIONS);

interface SakinahLocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
}

export const SakinahLocationSelect: React.FC<SakinahLocationSelectProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search State or City",
  error 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const parts = value.split(', ');
      if (parts.length === 2 && ALL_STATES.includes(parts[1])) {
        setSelectedState(parts[1]);
      }
    }
  }, []);

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

  const handleSelect = (city: string) => {
    const finalLocation = `${city}, ${selectedState}`;
    onChange(finalLocation);
    setIsOpen(false);
    setSearch('');
  };

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setSearch('');
  };

  const handleBackToStates = () => {
    setSelectedState(null);
    setSearch('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className={`w-full px-5 py-4 bg-[#050816] border ${error ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-[rgba(212,175,55,0.15)]'} rounded-xl text-white text-[15px] cursor-pointer flex items-center justify-between transition-all hover:border-[rgba(212,175,55,0.3)]`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <MapPin size={18} className="text-[#D4AF37] shrink-0" weight="fill" />
          <span className={`truncate ${value ? 'text-white' : 'text-white/40'}`}>
            {value || placeholder}
          </span>
        </div>
        <CaretDown size={16} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
                  onClick={handleBackToStates}
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
                      onClick={() => handleStateSelect(state)}
                      className="px-4 py-3 hover:bg-[rgba(212,175,55,0.1)] rounded-lg cursor-pointer transition-colors text-sm text-white/90 flex items-center justify-between group"
                    >
                      {state}
                      <span className="text-[10px] text-white/30 opacity-0 group-hover:opacity-100 transition-opacity">Select →</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-white/40 text-sm">No states found</div>
                )
              ) : (
                citiesList.length > 0 ? (
                  citiesList.map(city => (
                    <div 
                      key={city}
                      onClick={() => handleSelect(city)}
                      className="px-4 py-3 hover:bg-[rgba(212,175,55,0.1)] rounded-lg cursor-pointer transition-colors text-sm text-white/90"
                    >
                      {city}
                    </div>
                  ))
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
