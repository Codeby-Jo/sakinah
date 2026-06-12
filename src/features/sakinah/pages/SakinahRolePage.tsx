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
    <div className="sk-viewport relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#0A0E16] to-[#0d121c]">
        <motion.div 
          animate={{ opacity: [0.03, 0.05, 0.03], scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(212,168,83,0.1),transparent_70%)] blur-[50px]" 
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <motion.div variants={containerVars} initial="hidden" animate="show" className="w-full max-w-[800px] flex flex-col items-center">
          
          <motion.div variants={itemVars} className="mb-12 text-center">
            <h1 className="font-serif text-[36px] md:text-[42px] text-[var(--sk-ink)] mb-4">Choose Your Path</h1>
            <p className="text-[16px] text-[var(--sk-ink-dim)] font-light max-w-[500px] mx-auto">
              Tell us who is managing this profile to personalise your experience.
            </p>
          </motion.div>

          <motion.div variants={itemVars} className="grid md:grid-cols-2 gap-6 w-full max-w-[700px] mx-auto">
            {/* Seeker Card */}
            <div 
              onClick={() => navigate('/register')}
              className="sk-card group cursor-pointer p-8 relative overflow-hidden transition-all duration-500 hover:border-[var(--sk-gold)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(212,168,83,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 mb-6 rounded-full bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex items-center justify-center group-hover:scale-110 group-hover:border-[var(--sk-gold)] transition-all duration-500">
                  <span className="text-[32px] text-[var(--sk-gold)]">👤</span>
                </div>
                <h2 className="font-serif text-[24px] text-[var(--sk-ink)] mb-3 group-hover:text-[var(--sk-gold)] transition-colors">I am a Seeker</h2>
                <p className="text-[13px] text-[var(--sk-ink-dim)] leading-relaxed font-light">
                  I am looking for a spouse for myself and will manage my own profile.
                </p>
                <div className="mt-8 text-[12px] font-medium text-[var(--sk-gold)] opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  Continue as Seeker →
                </div>
              </div>
            </div>

            {/* Wali Card */}
            <div 
              className={`sk-card p-8 relative overflow-hidden transition-all duration-500 ${showWaliOptions ? 'border-[var(--sk-gold)] shadow-[0_20px_40px_rgba(0,0,0,0.4)] scale-[1.02]' : 'hover:border-[var(--sk-gold)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] cursor-pointer group'}`}
              onClick={() => !showWaliOptions && setShowWaliOptions(true)}
            >
              <div className="absolute inset-0 bg-gradient-to-bl from-[rgba(212,168,83,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-20 h-20 mb-6 rounded-full flex items-center justify-center transition-all duration-500 ${showWaliOptions ? 'bg-[rgba(212,168,83,0.1)] border border-[var(--sk-gold)] scale-110' : 'bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] group-hover:scale-110 group-hover:border-[var(--sk-gold)]'}`}>
                  <span className="text-[32px] text-[var(--sk-gold)]">🛡️</span>
                </div>
                <h2 className={`font-serif text-[24px] mb-3 transition-colors ${showWaliOptions ? 'text-[var(--sk-gold)]' : 'text-[var(--sk-ink)] group-hover:text-[var(--sk-gold)]'}`}>I am a Wali</h2>
                <p className="text-[13px] text-[var(--sk-ink-dim)] leading-relaxed font-light mb-6">
                  I am a parent or guardian managing a profile on behalf of a candidate.
                </p>
                
                <AnimatePresence>
                  {showWaliOptions ? (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="w-full flex flex-col gap-3 mt-2"
                    >
                      <button onClick={(e) => { e.stopPropagation(); navigate('/wali/login'); }} className="w-full py-3 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(212,168,83,0.1)] border border-[rgba(255,255,255,0.1)] hover:border-[var(--sk-gold)] text-[var(--sk-ink)] hover:text-[var(--sk-gold)] rounded-xl transition-all duration-300 text-[14px]">
                        Login to Dashboard
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); navigate('/wali/register'); }} className="w-full py-3 bg-[var(--sk-gold)] hover:bg-[#E8C97A] text-[#0A0E16] rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(212,168,83,0.2)] text-[14px] font-medium">
                        Find a Match for Someone
                      </button>
                    </motion.div>
                  ) : (
                    <div className="mt-2 text-[12px] font-medium text-[var(--sk-gold)] opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Select Wali Options →
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVars} className="mt-12">
            <button onClick={() => navigate('/')} className="text-[13px] text-[var(--sk-ink-faint)] hover:text-[var(--sk-gold)] transition-colors py-2 px-4">
              ← Back to Home
            </button>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};
