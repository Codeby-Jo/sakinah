import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: '⊞' },
  { label: 'My Profile', path: '/profile-creation', icon: '👤' },
  { label: 'Recommended Matches', path: '/matches', icon: '♡' },
  { label: 'Interests', path: '/interests', icon: '✦' },
  { label: 'Messages', path: '/chat', icon: '✉' },
  { label: 'Saved Profiles', path: '/saved', icon: '★' },
  { label: 'Notifications', path: '/notifications', icon: '🔔' },
  { label: 'Settings', path: '/settings', icon: '⚙' },
];

export const SakinahSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="w-[280px] h-screen border-r border-[rgba(255,255,255,0.05)] bg-[#0A0E16] flex flex-col fixed left-0 top-0 overflow-y-auto custom-scrollbar z-50 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
      <div className="p-8 pb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--sk-gold)] to-[#A37B31] rounded-xl rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(212,168,83,0.3)]">
          <span className="-rotate-45 text-[#0A0E16] text-[20px] font-serif font-bold">S</span>
        </div>
        <div>
          <h2 className="font-serif text-[22px] text-[var(--sk-ink)] leading-none">Sakinah</h2>
          <span className="text-[9px] text-[var(--sk-gold-dim)] uppercase tracking-[0.2em]">Premium</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all duration-300 relative group ${
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
              <span className={`text-[18px] ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'} transition-opacity`}>
                {item.icon}
              </span>
              <span className="text-[14px] font-medium tracking-wide">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
        >
          <span className="text-[18px]">🚪</span>
          <span className="text-[14px] font-medium tracking-wide">Logout</span>
        </button>
      </div>
    </div>
  );
};
