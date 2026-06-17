import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const SakinahWelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="sk-viewport relative overflow-hidden h-screen flex flex-col justify-between bg-[#0A0E16]">
      {/* Immersive Deep Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1a1814,transparent_70%)] opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,168,83,0.03)_0%,transparent_100%)]" />
        
        <motion.div 
          animate={{ 
            y: [0, -40, 0], 
            opacity: [0.05, 0.08, 0.05], 
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-[var(--sk-gold)] rounded-[40%] blur-[160px]" 
        />
        <motion.div 
          animate={{ 
            y: [0, 40, 0], 
            opacity: [0.03, 0.06, 0.03], 
            scale: [1, 1.3, 1],
            rotate: [0, -10, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-[#A37B31] rounded-full blur-[180px]" 
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6">
        <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-[850px] mx-auto w-full flex flex-col items-center">
          
          <motion.div variants={itemVars} className="mb-12 relative group cursor-default">
            <div className="w-28 h-28 bg-gradient-to-br from-[#E8C97A] via-[var(--sk-gold)] to-[#b98b39] rounded-[32px] rotate-45 flex items-center justify-center shadow-[0_0_80px_rgba(212,168,83,0.3)] group-hover:shadow-[0_0_120px_rgba(212,168,83,0.5)] group-hover:rotate-[225deg] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
              <span className="-rotate-45 group-hover:-rotate-[225deg] transition-transform duration-1000 text-[#0A0E16] text-[52px] font-display font-bold">S</span>
            </div>
            <div className="absolute inset-0 bg-[var(--sk-gold)] rounded-[32px] rotate-45 blur-[40px] opacity-50 group-hover:opacity-80 -z-10 animate-pulse transition-opacity duration-1000" />
          </motion.div>

          <motion.h1 variants={itemVars} className="font-display text-[48px] md:text-[72px] lg:text-[84px] text-[var(--sk-ink)] leading-[1.05] mb-6 tracking-tight drop-shadow-2xl">
            Find Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FDE6B8] via-[#E8C97A] to-[#D4A853] filter drop-shadow-[0_0_20px_rgba(232,201,122,0.3)]">Righteous Spouse</span>
          </motion.h1>

          <motion.p variants={itemVars} className="text-[16px] md:text-[20px] text-[var(--sk-ink-dim)] max-w-[600px] leading-[1.7] mb-12 font-light drop-shadow-md">
            Sakinah is a premium, halal matchmaking platform designed to help practicing Muslims find their life partner with character and deen at the forefront.
          </motion.p>

          <motion.div variants={itemVars} className="w-full max-w-[400px]">
            <button
              onClick={() => navigate('/matrimony/role')}
              className="relative w-full py-5 px-8 bg-gradient-to-r from-[#FDE6B8] via-[#E8C97A] to-[#D4A853] text-[#0A0E16] text-[18px] font-bold tracking-[0.2em] uppercase rounded-full shadow-[0_0_40px_rgba(212,168,83,0.4)] hover:shadow-[0_0_80px_rgba(212,168,83,0.7)] hover:-translate-y-2 transition-all duration-500 transform overflow-hidden group"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>
          </motion.div>

        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-6 text-center opacity-60">
        <div className="text-[11px] text-[var(--sk-ink-faint)] tracking-[0.3em] font-mono uppercase">© 2026 SAKINAH — A Zaryah Initiative</div>
      </footer>
    </div>
  );
};
