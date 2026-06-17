import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const SakinahRolePage: React.FC = () => {
  const navigate = useNavigate();
  const [showWaliOptions, setShowWaliOptions] = useState(false);

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="sk-viewport relative overflow-hidden bg-gradient-to-br from-[#07090f] via-[#0b0f18] to-[#0a0e16]">
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ opacity: [0.03, 0.05, 0.03], scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(212,168,83,0.15),transparent_60%)] blur-[60px]" 
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <motion.div variants={containerVars} initial="hidden" animate="show" className="w-full max-w-[850px] flex flex-col items-center">
          
          <motion.div variants={itemVars} className="mb-14 text-center">
            <h1 className="font-display text-[48px] md:text-[60px] text-[var(--sk-ink)] mb-4 tracking-tight drop-shadow-lg">Choose Your Path</h1>
            <p className="text-[16px] md:text-[18px] text-[var(--sk-ink-dim)] font-light max-w-[500px] mx-auto">
              Tell us who is managing this profile to personalise your experience.
            </p>
          </motion.div>

          <motion.div variants={itemVars} className="grid md:grid-cols-2 gap-8 w-full">
            
            {/* Seeker Card Wrapper with Glowing Border */}
            <div 
              onClick={() => navigate('/matrimony/register')}
              className="group cursor-pointer relative rounded-[32px] overflow-hidden p-[2px] transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(212,168,83,0.2)] bg-[rgba(255,255,255,0.03)] hover:bg-transparent"
            >
              {/* Spinning Lighting Effect */}
              <div className="absolute inset-[-150%] animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'conic-gradient(from 90deg, transparent 0%, transparent 75%, var(--sk-gold) 100%)' }} />
              
              {/* Inner Card Content */}
              <div className="relative h-[400px] w-full bg-[#0A0E16] rounded-[30px] p-10 flex flex-col items-center text-center z-10 transition-all duration-500 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(212,168,83,0.04)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
                  <div className="w-24 h-24 mb-8 rounded-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center group-hover:scale-110 group-hover:border-[var(--sk-gold)] group-hover:shadow-[0_0_30px_rgba(212,168,83,0.3)] transition-all duration-500">
                    <span className="text-[38px] text-[var(--sk-gold)]">👤</span>
                  </div>
                  <h2 className="font-display text-[32px] text-[var(--sk-ink)] mb-4 group-hover:text-[var(--sk-gold)] transition-colors">I am a Seeker</h2>
                  <p className="text-[15px] text-[var(--sk-ink-dim)] leading-relaxed font-light max-w-[260px]">
                    I am looking for a spouse for myself and will manage my own profile.
                  </p>
                </div>

                <div className="relative z-10 mt-auto pt-6 text-[13px] font-medium text-[var(--sk-gold)] opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 uppercase tracking-widest">
                  Continue as Seeker →
                </div>
              </div>
            </div>

            {/* Wali Card Wrapper with Glowing Border */}
            <div 
              className={`relative rounded-[32px] overflow-hidden p-[2px] transition-all duration-500 bg-[rgba(255,255,255,0.03)] ${showWaliOptions ? 'scale-[1.02] shadow-[0_20px_50px_rgba(212,168,83,0.2)] bg-transparent' : 'cursor-pointer hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(212,168,83,0.2)] hover:bg-transparent group'}`}
              onClick={() => !showWaliOptions && setShowWaliOptions(true)}
            >
              {/* Spinning Lighting Effect */}
              <div className={`absolute inset-[-150%] animate-[spin_4s_linear_infinite] transition-opacity duration-700 ${showWaliOptions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} style={{ background: 'conic-gradient(from 90deg, transparent 0%, transparent 75%, var(--sk-gold) 100%)' }} />
              
              {/* Inner Card Content */}
              <div className="relative h-[400px] w-full bg-[#0A0E16] rounded-[30px] p-10 flex flex-col items-center text-center z-10 transition-all duration-500 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-b from-[rgba(212,168,83,0.04)] to-transparent transition-opacity duration-700 ${showWaliOptions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                
                <div className="relative z-10 flex-1 flex flex-col items-center justify-start w-full">
                  <div className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center transition-all duration-500 ${showWaliOptions ? 'bg-[rgba(212,168,83,0.08)] border border-[var(--sk-gold)] shadow-[0_0_30px_rgba(212,168,83,0.3)] scale-110' : 'bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] group-hover:scale-110 group-hover:border-[var(--sk-gold)] group-hover:shadow-[0_0_30px_rgba(212,168,83,0.3)]'}`}>
                    <span className="text-[38px] text-[var(--sk-gold)]">🛡️</span>
                  </div>
                  <h2 className={`font-display text-[32px] mb-3 transition-colors ${showWaliOptions ? 'text-[var(--sk-gold)]' : 'text-[var(--sk-ink)] group-hover:text-[var(--sk-gold)]'}`}>I am a Wali</h2>
                  
                  {!showWaliOptions && (
                    <p className="text-[15px] text-[var(--sk-ink-dim)] leading-relaxed font-light max-w-[260px] mt-2">
                      I am a parent or guardian managing a profile on behalf of a candidate.
                    </p>
                  )}
                  
                  <AnimatePresence>
                    {showWaliOptions && (
                      <motion.div 
                        key="wali-options-container"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 10 }}
                        className="w-full flex flex-col gap-3 mt-4"
                      >
                        <button onClick={(e) => { e.stopPropagation(); navigate('/matrimony/wali/login'); }} className="w-full py-3.5 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(212,168,83,0.08)] border border-[rgba(255,255,255,0.08)] hover:border-[var(--sk-gold)] text-[var(--sk-ink)] hover:text-[var(--sk-gold)] rounded-2xl transition-all duration-300 text-[14px] font-medium tracking-wide">
                          Login to Dashboard
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); navigate('/matrimony/wali/register'); }} className="w-full py-3.5 bg-gradient-to-r from-[var(--sk-gold)] to-[#E8C97A] hover:from-[#E8C97A] hover:to-[#b98b39] text-[#0A0E16] rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(212,168,83,0.3)] text-[14px] font-bold tracking-wide">
                          Find a Match for Someone
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {!showWaliOptions && (
                  <div className="relative z-10 mt-auto pt-6 text-[13px] font-medium text-[var(--sk-gold)] opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 uppercase tracking-widest">
                    Select Wali Options →
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVars} className="mt-16">
            <button onClick={() => navigate('/raya-gateway')} className="text-[13px] text-[var(--sk-ink-faint)] hover:text-[var(--sk-gold)] transition-colors py-2 px-4 uppercase tracking-[0.2em] font-mono">
              ← Back to Home
            </button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};
