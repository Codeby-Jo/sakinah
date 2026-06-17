import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: '⊞' },
  { label: 'My Profile', path: '/profile-creation', icon: '👤' },
  { label: 'Recommended Matches', path: '/matches', icon: '♡' },
  { label: 'Interests', path: '/interests', icon: '✦' },
  { label: 'Messages', path: '/chat', icon: '✉' },
  { label: 'Saved Profiles', path: '/saved', icon: '★' },
  { label: 'Notifications', path: '/notifications', icon: '🔔' },
  { label: 'Settings', path: '/settings', icon: '⚙' },
  { label: 'Verification Status', path: '/kyc', icon: '✓' },
  { label: 'Help & Support', path: '/support', icon: '❓' },
];

export const SakinahSidebar: React.FC<{ isExpanded: boolean; setIsExpanded: (v: boolean) => void }> = ({ isExpanded, setIsExpanded }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div 
      initial={false}
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen border-r border-[rgba(255,255,255,0.05)] bg-[#0A0E16] flex flex-col fixed left-0 top-0 overflow-y-auto overflow-x-hidden custom-scrollbar z-50 shadow-[5px_0_30px_rgba(0,0,0,0.5)]"
    >
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

      <div className={`flex-1 ${isExpanded ? 'px-4' : 'px-2'} py-6 flex flex-col gap-1`}>
        {NAV_ITEMS.map((item, i) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className={`flex items-center ${isExpanded ? 'justify-start px-4' : 'justify-center px-0'} gap-4 w-full py-3 rounded-xl transition-all duration-300 relative group ${
                isActive 
                  ? 'bg-[rgba(212,168,83,0.1)] text-[var(--sk-gold)]' 
                  : 'text-[var(--sk-ink-dim)] hover:bg-[rgba(255,255,255,0.02)] hover:text-[var(--sk-ink)]'
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
          onClick={() => { localStorage.removeItem('sakinah_token'); localStorage.removeItem('sakinah_role'); navigate('/raya-gateway'); }}
          className={`flex items-center ${isExpanded ? 'gap-4 px-4' : 'justify-center px-0'} w-full py-3 rounded-xl text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300`}
        >
          <span className="text-[18px] shrink-0">🚪</span>
          <AnimatePresence>
            {isExpanded && (
              <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0, display: 'none' }} className="text-[14px] font-medium tracking-wide whitespace-nowrap overflow-hidden">
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};
