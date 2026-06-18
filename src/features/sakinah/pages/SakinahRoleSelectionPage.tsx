import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const SakinahRoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'seeker' | 'wali' | null>(null);

  const handleContinue = () => {
    if (selectedRole === 'wali') {
      navigate('/matrimony/dashboard'); // Wali goes to dashboard mode
    } else if (selectedRole === 'seeker') {
      navigate('/matrimony/register'); // Others go to register
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E16] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(212,168,83,0.03)_0%,transparent_70%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[500px] relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[var(--sk-gold)] to-[#A37B31] rounded-2xl rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(212,168,83,0.3)] mb-8">
            <span className="-rotate-45 text-[#0A0E16] text-[28px] font-serif font-bold">S</span>
          </div>
          <h1 className="font-serif text-[32px] text-[var(--sk-gold)] mb-3 leading-tight">Welcome to Sakinah</h1>
          <p className="text-[15px] text-[var(--sk-ink-dim)] font-light">Please select your role to continue your journey</p>
        </div>

        <div className="space-y-4 mb-10">
          <motion.div
            whileHover={{ scale: selectedRole === 'seeker' ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole('seeker')}
            className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden ${
              selectedRole === 'seeker' 
                ? 'border-[var(--sk-gold)] bg-[rgba(212,168,83,0.05)] shadow-[0_0_30px_rgba(212,168,83,0.15)]' 
                : 'border-[rgba(255,255,255,0.08)] bg-[#111826] hover:border-[rgba(212,168,83,0.3)]'
            }`}
          >
            {selectedRole === 'seeker' && (
              <motion.div layoutId="role-select-bg" className="absolute inset-0 bg-gradient-to-r from-[rgba(212,168,83,0.1)] to-transparent opacity-50" />
            )}
            <div className="relative z-10 flex items-center gap-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-300 ${
                selectedRole === 'seeker' ? 'border-[var(--sk-gold)] text-[var(--sk-gold)] bg-[rgba(212,168,83,0.1)]' : 'border-[rgba(255,255,255,0.1)] text-[var(--sk-ink-dim)]'
              }`}>
                <span className="text-[20px]">👤</span>
              </div>
              <div className="flex-1">
                <h3 className={`font-serif text-[20px] mb-1 transition-colors ${selectedRole === 'seeker' ? 'text-[var(--sk-gold)]' : 'text-[var(--sk-ink)]'}`}>
                  I am a Seeker
                </h3>
                <p className="text-[13px] text-[var(--sk-ink-dim)] leading-relaxed">
                  I am creating a profile for myself to find a spouse.
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                selectedRole === 'seeker' ? 'border-[var(--sk-gold)] bg-[var(--sk-gold)]' : 'border-[rgba(255,255,255,0.1)]'
              }`}>
                {selectedRole === 'seeker' && <span className="text-[#0A0E16] text-[12px] font-bold">✓</span>}
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: selectedRole === 'wali' ? 1 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole('wali')}
            className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 relative overflow-hidden ${
              selectedRole === 'wali' 
                ? 'border-[var(--sk-gold)] bg-[rgba(212,168,83,0.05)] shadow-[0_0_30px_rgba(212,168,83,0.15)]' 
                : 'border-[rgba(255,255,255,0.08)] bg-[#111826] hover:border-[rgba(212,168,83,0.3)]'
            }`}
          >
            {selectedRole === 'wali' && (
              <motion.div layoutId="role-select-bg" className="absolute inset-0 bg-gradient-to-r from-[rgba(212,168,83,0.1)] to-transparent opacity-50" />
            )}
            <div className="relative z-10 flex items-center gap-5">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-300 ${
                selectedRole === 'wali' ? 'border-[var(--sk-gold)] text-[var(--sk-gold)] bg-[rgba(212,168,83,0.1)]' : 'border-[rgba(255,255,255,0.1)] text-[var(--sk-ink-dim)]'
              }`}>
                <span className="text-[20px]">🛡️</span>
              </div>
              <div className="flex-1">
                <h3 className={`font-serif text-[20px] mb-1 transition-colors ${selectedRole === 'wali' ? 'text-[var(--sk-gold)]' : 'text-[var(--sk-ink)]'}`}>
                  I am a Wali / Guardian
                </h3>
                <p className="text-[13px] text-[var(--sk-ink-dim)] leading-relaxed">
                  I am managing the journey for someone else (Searching For Someone Else).
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                selectedRole === 'wali' ? 'border-[var(--sk-gold)] bg-[var(--sk-gold)]' : 'border-[rgba(255,255,255,0.1)]'
              }`}>
                {selectedRole === 'wali' && <span className="text-[#0A0E16] text-[12px] font-bold">✓</span>}
              </div>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {selectedRole && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 20, height: 0 }}
            >
              <button
                onClick={handleContinue}
                className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#050816] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-all duration-300 font-bold rounded-xl text-[15px] tracking-wide"
              >
                Continue as {selectedRole === 'seeker' ? 'Seeker' : 'Wali'} →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SakinahRoleSelectionPage;
