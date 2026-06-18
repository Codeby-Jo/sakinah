import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import { clearProgress } from '../services/sakinahProgress';

const SEEKER_NAV_ITEMS = [
  { label: 'Dashboard', path: '/matrimony/dashboard', icon: '⊞' },
  { label: 'My Profile', path: '/matrimony/profile-creation', icon: '👤' },
  { label: 'Recommended Matches', path: '/matrimony/matches', icon: '♡' },
  { label: 'Wali Setup', path: '/matrimony/wali-setup', icon: '🔒' },
  { label: 'Notifications', path: '/matrimony/notifications', icon: '🔔' },
  { label: 'Help & Support', path: '/matrimony/support', icon: '❓' },
];

const WALI_NAV_ITEMS = [
  { label: 'Wali Dashboard', path: '/matrimony/dashboard', icon: '⊞' },
  { label: 'Candidate Bio', path: '/matrimony/profile-creation', icon: '📝' },
  { label: 'Contact Support', path: '/matrimony/support', icon: '❓' },
];

export const SakinahSidebar: React.FC<{ isExpanded: boolean; setIsExpanded: (v: boolean) => void }> = ({ isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userType, isWaliViewOnly } = useOnboarding();

  const NAV_ITEMS = userType === 'WALI_VIEW' ? WALI_NAV_ITEMS : SEEKER_NAV_ITEMS;

  return (
    <motion.div 
      initial={false}
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen border-r border-[rgba(255,255,255,0.05)] bg-[#0A0E16] flex flex-col sticky top-0 overflow-y-auto overflow-x-hidden custom-scrollbar z-50 shadow-[5px_0_30px_rgba(0,0,0,0.5)]"
    >
      {/* ← Back to Zaryah+ */}
      <div className={`px-3 pt-4 pb-2 border-b border-[rgba(255,255,255,0.05)]`}>
        <motion.button
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/raya-gateway')}
          className={`flex items-center gap-2.5 w-full py-2.5 px-3 rounded-xl bg-[rgba(212,168,83,0.06)] border border-[rgba(212,168,83,0.15)] text-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.12)] hover:border-[rgba(212,168,83,0.35)] transition-all duration-300 group`}
          title="Back to Zaryah+"
        >
          <span className="text-[16px] shrink-0 group-hover:-translate-x-1 transition-transform duration-300">←</span>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0, display: 'none' }}
                className="text-[12px] font-semibold tracking-wide whitespace-nowrap overflow-hidden uppercase"
              >
                Back to Zaryah+
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div className={`p-6 pb-4 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} gap-3 min-h-[80px]`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-[var(--sk-gold)] to-[#A37B31] rounded-xl rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(212,168,83,0.3)] cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsExpanded(!isExpanded)}>
            <span className="-rotate-45 text-[#0A0E16] text-[20px] font-serif font-bold">S</span>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10, display: 'none' }} className="whitespace-nowrap">
                <h2 className="font-serif text-[22px] text-[var(--sk-ink)] leading-none">Sakinah</h2>
                <span className="text-[9px] text-[var(--sk-gold-dim)] uppercase tracking-[0.2em]">Premium</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {isExpanded && (
          <button onClick={() => setIsExpanded(false)} className="text-[var(--sk-ink-dim)] hover:text-[var(--sk-gold)] transition-colors">
            ◀
          </button>
        )}
      </div>

      <AnimatePresence>
        {isWaliViewOnly && isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10, display: 'none' }}
            className="px-6 pb-2"
          >
            <div className="bg-gradient-to-r from-[rgba(26,54,40,0.5)] to-[rgba(16,33,24,0.5)] border border-[rgba(66,135,101,0.3)] rounded-lg py-2 px-3 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(66,135,101,0.15)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.05),transparent)] -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#4BB543] shadow-[0_0_8px_#4BB543] animate-pulse" />
              <span className="text-[10px] font-bold text-[#A8DAB5] uppercase tracking-widest relative z-10">Wali Mode</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`flex-1 ${isExpanded ? 'px-4' : 'px-2'} py-6 flex flex-col gap-1`}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className={`flex items-center ${isExpanded ? 'justify-start px-4' : 'justify-center px-0'} gap-4 w-full py-3 rounded-xl transition-all duration-300 relative group border ${
                isActive 
                  ? 'bg-[rgba(212,168,83,0.07)] border-[rgba(212,168,83,0.18)] text-[var(--sk-gold)] shadow-[0_0_15px_rgba(212,168,83,0.05)]' 
                  : 'text-[var(--sk-ink-dim)] hover:bg-[rgba(212,168,83,0.03)] hover:text-[var(--sk-gold)] border-transparent'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--sk-gold)] rounded-r-full shadow-[0_0_10px_rgba(212,168,83,0.5)]" 
                />
              )}
              <span className={`text-[18px] shrink-0 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} transition-opacity`}>
                {item.icon}
              </span>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0, display: 'none' }} className="text-[14px] font-medium tracking-wide whitespace-nowrap overflow-hidden">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <div className={`p-4 border-t border-[rgba(255,255,255,0.05)] ${isExpanded ? '' : 'flex justify-center'}`}>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { clearProgress(); navigate('/raya-gateway'); }}
          className={`flex items-center ${isExpanded ? 'gap-4 px-4' : 'justify-center px-0'} w-full py-3 rounded-xl text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300`}
        >
          <span className="text-[18px] shrink-0">🚪</span>
          <AnimatePresence>
            {isExpanded && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0, display: 'none' }} className="text-[14px] font-medium tracking-wide whitespace-nowrap overflow-hidden">
                Sign Out of Sakinah
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};

