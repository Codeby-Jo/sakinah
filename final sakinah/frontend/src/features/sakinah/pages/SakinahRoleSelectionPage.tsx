import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { setProgress, clearProgress, isOnboardingComplete } from '../services/sakinahProgress';

export const SakinahRoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'seeker' | 'wali' | null>(null);

  React.useEffect(() => {
    if (isOnboardingComplete() && localStorage.getItem('sakinah_token')) {
      navigate('/matrimony/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleContinue = () => {
    clearProgress();
    if (selectedRole === 'wali') {
      setProgress({ role: 'WALI_VIEW' });
      navigate('/matrimony/login'); // Wali must authenticate first
    } else if (selectedRole === 'seeker') {
      setProgress({ role: 'SEEKER' });
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
                
                {/* Expandable options for Seeker */}
                <AnimatePresence>
                  {selectedRole === 'seeker' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden space-y-3"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearProgress();
                          setProgress({ role: 'SEEKER' });
                          navigate('/matrimony/register');
                        }}
                        className="w-full text-left p-4 rounded-xl border border-[rgba(212,168,83,0.3)] bg-[rgba(212,168,83,0.05)] hover:bg-[rgba(212,168,83,0.1)] transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <h4 className="text-[15px] text-[var(--sk-gold)] font-bold mb-0.5">Register New Account</h4>
                          <p className="text-[12px] text-[var(--sk-ink-dim)]">Create a new profile for yourself.</p>
                        </div>
                        <span className="text-[var(--sk-gold)] opacity-50 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 duration-300">→</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearProgress();
                          setProgress({ role: 'SEEKER' });
                          navigate('/matrimony/login');
                        }}
                        className="w-full text-left p-4 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#111826] hover:border-[rgba(212,168,83,0.3)] transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <h4 className="text-[15px] text-[var(--sk-ink)] font-bold mb-0.5">Login to Dashboard</h4>
                          <p className="text-[12px] text-[var(--sk-ink-dim)]">Access your existing profile and matches.</p>
                        </div>
                        <span className="text-[var(--sk-gold)] opacity-50 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 duration-300">→</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  I want to view a seeker's progress or manage an account for someone else.
                </p>
                
                {/* Expandable options for Wali */}
                <AnimatePresence>
                  {selectedRole === 'wali' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden space-y-3"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearProgress();
                          setProgress({ role: 'WALI_VIEW' });
                          navigate('/matrimony/login');
                        }}
                        className="w-full text-left p-4 rounded-xl border border-[rgba(212,168,83,0.3)] bg-[rgba(212,168,83,0.05)] hover:bg-[rgba(212,168,83,0.1)] transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <h4 className="text-[15px] text-[var(--sk-gold)] font-bold mb-0.5">Login as Wali</h4>
                          <p className="text-[12px] text-[var(--sk-ink-dim)]">View only access to monitor a seeker's journey.</p>
                        </div>
                        <span className="text-[var(--sk-gold)] opacity-50 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 duration-300">→</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearProgress();
                          setProgress({ role: 'LOOKING_FOR_SOMEONE_ELSE' });
                          navigate('/matrimony/register');
                        }}
                        className="w-full text-left p-4 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#111826] hover:border-[rgba(212,168,83,0.3)] transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <h4 className="text-[15px] text-[var(--sk-ink)] font-bold mb-0.5">Find for Someone Else</h4>
                          <p className="text-[12px] text-[var(--sk-ink-dim)]">Create and manage a profile on behalf of a seeker.</p>
                        </div>
                        <span className="text-[var(--sk-gold)] opacity-50 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 duration-300">→</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 self-start ${
                selectedRole === 'wali' ? 'border-[var(--sk-gold)] bg-[var(--sk-gold)]' : 'border-[rgba(255,255,255,0.1)]'
              }`}>
                {selectedRole === 'wali' && <span className="text-[#0A0E16] text-[12px] font-bold">✓</span>}
              </div>
            </div>
          </motion.div>
      </motion.div>
    </div>
  );
};

export default SakinahRoleSelectionPage;
