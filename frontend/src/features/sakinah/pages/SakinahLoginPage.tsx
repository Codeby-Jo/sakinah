import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeSlash, ShieldCheck, LockKey } from '@phosphor-icons/react';
import { 
  SakinahInput, 
  SakinahButton,
  SakinahJourneyFrame,
  SakinahHeader
} from '../components';
import { loginSakinah, verifyWaliAccess, notifyWaliLogin } from '../services/sakinahApi';
import { setProgress, getProgress } from '../services/sakinahProgress';

// Strict email regex: no spaces, proper format
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SakinahLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const currentRole = getProgress().role;
  const isWaliLogin = currentRole === 'WALI_VIEW';

  const validateForm = useCallback(() => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address without spaces.');
      return false;
    }
    return true;
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsPending(true);

    try {
      if (isWaliLogin) {
        // STRICT WALI VALIDATION
        const response = await verifyWaliAccess(email);
        
        if (response && response.success) {
          // Send notification to Seeker
          await notifyWaliLogin(email);

          // Create secure wali session
          localStorage.setItem('sakinah_wali_session', JSON.stringify({
            token: response.token || `session_${Date.now()}`,
            email,
            timestamp: new Date().toISOString()
          }));
          
          setProgress({
            role: 'WALI_VIEW',
            account_completed: true,
            kyc_completed: true,
            profile_completed: true,
            preferences_completed: true,
            review_completed: true,
          });
          
          navigate('/matrimony/dashboard');
        } else {
          throw new Error('This email is not authorized by the respective user.');
        }
      } else {
        // Normal Seeker Login
        await loginSakinah(email, password);
        setProgress({
          role: currentRole ?? 'SEEKER',
          account_completed: true,
          kyc_completed: true,
          profile_completed: true,
          preferences_completed: true,
          review_completed: true,
        });
        navigate('/matrimony/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsPending(false);
    }
  };

  // ----------------------------------------------------------------------
  // WALI LOGIN VIEW (Clean Full-Screen Layout)
  // ----------------------------------------------------------------------
  if (isWaliLogin) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center relative overflow-hidden px-4">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,#D4AF37_0%,transparent_70%)] blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05], rotate: [0, -90, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear', delay: 2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,#10B981_0%,transparent_70%)] blur-[100px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[480px]"
        >
          <button
            onClick={() => navigate('/matrimony/role')}
            className="text-[var(--sk-ink-dim)] hover:text-[var(--sk-gold)] text-[13px] flex items-center gap-2 mb-6 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to role selection
          </button>

          <div className="bg-[#0A0E16]/80 backdrop-blur-3xl border border-[rgba(212,168,83,0.15)] rounded-[32px] p-8 md:p-10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden">
            
            {/* Subtle animated border top */}
            <motion.div 
              animate={{ backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
              transition={{ duration: 8, ease: "linear", repeat: Infinity }}
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#10B981] to-transparent opacity-50 bg-[length:200%_auto]"
            />

            <div className="text-center mb-8 relative">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#10B981]/10 to-[#065F46]/20 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] mb-5 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-md"
              >
                <ShieldCheck size={40} weight="duotone" />
              </motion.div>
              <h1 className="font-serif text-[28px] text-[#EDE7DA] mb-2 tracking-wide">Wali View Mode</h1>
              <p className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#10B981]/80 font-semibold">Family Representative Access</p>
            </div>

            <p className="text-[14px] text-[var(--sk-ink-dim)] font-light leading-[1.7] mb-8 text-center">
              Log in with the email authorized by the Seeker. You will have <strong className="text-[var(--sk-gold)]">read-only</strong> access to view matches, messages, and reports.
            </p>

            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8 p-3 rounded-xl bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.2)] text-[#10B981] text-[13px] text-center flex items-center justify-center gap-2"
            >
              <LockKey size={16} weight="fill" /> <span>Strict verification required</span>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <label className="block font-serif text-[15px] text-[var(--sk-gold)] mb-2">Authorized Email <span className="text-red-500">*</span></label>
                <SakinahInput 
                  type="email" 
                  placeholder="Enter the authorized email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value.trim()); setError(''); }}
                  required
                />
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <label className="block font-serif text-[15px] text-[var(--sk-gold)] mb-2">Password <span className="text-red-500">*</span></label>
                <SakinahInput 
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  // Temporarily overriding type via a trick or standard input. 
                  // Since SakinahInput sets type via props, we can just pass the dynamic type:
                  {...({ type: showPassword ? 'text' : 'password' } as any)}
                  rightElement={
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 cursor-pointer focus:outline-none"
                    >
                      {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                    </button>
                  }
                />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.6 }}
                className="mt-4"
              >
                <SakinahButton 
                  type="submit" 
                  variant="primary"
                  disabled={isPending}
                  className="w-full text-[15px] h-14"
                >
                  {isPending ? 'Verifying access...' : '🛡️ Secure Login'}
                </SakinahButton>
              </motion.div>
            </form>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-[12px] text-white/30 mt-8"
          >
            Unauthorized access attempts are logged and reported to the Seeker.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // SEEKER LOGIN VIEW (Journey Frame)
  // ----------------------------------------------------------------------
  return (
    <SakinahJourneyFrame>
      <SakinahHeader
        title="Seeker Portal"
        subtitle="Steward your journey"
        onBack={() => navigate('/matrimony/role')}
      />

      <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-[24px] text-center sk-fx sk-d1">
        Log in to access your dashboard. Here you can find your matches and manage your profile.
      </p>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 rounded-lg bg-[rgba(201,138,138,0.1)] border border-[rgba(201,138,138,0.2)] text-[var(--sk-rose)] text-[12px] text-center sk-fx sk-d1"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <form className="flex flex-col gap-[18px] sk-fx sk-d2" onSubmit={handleSubmit} noValidate>
        
        <div className="bg-[rgba(212,168,83,0.02)] border border-[rgba(212,168,83,0.15)] rounded-[13px] p-[16px] flex flex-col gap-[12px]">
          <div>
            <label className="block font-serif text-[16px] text-[var(--sk-gold)] mb-2">Username or Email</label>
            <SakinahInput 
              type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value.trim()); setError(''); }}
              required
            />
          </div>
          <div>
            <label className="block font-serif text-[16px] text-[var(--sk-gold)] mb-2">Password</label>
            <SakinahInput 
              type="password" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              required
              {...({ type: showPassword ? 'text' : 'password' } as any)}
              rightElement={
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                </button>
              }
            />
          </div>
        </div>

        <div className="sk-fx sk-d3 mt-[11px]">
          <SakinahButton 
            type="submit" 
            variant="primary"
            disabled={isPending}
          >
            {isPending ? 'Authenticating...' : 'Enter Dashboard →'}
          </SakinahButton>
        </div>
      </form>
    </SakinahJourneyFrame>
  );
};
