import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahInput, SakinahButton, SakinahHeader } from '../components';
import { loginSakinah } from '../services/sakinahApi';

export const SakinahWaliLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setIsWaliViewOnly } = useOnboarding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) {
      e.email = 'Email or User ID is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email !== 'admin') {
      e.email = 'Please enter a valid email';
    }
    
    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 6) {
      e.password = 'Password must be at least 6 characters';
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsPending(true);
    
    try {
      const response = await loginSakinah(email, password);
      // Store JWT token and mark as Wali role in localStorage
      localStorage.setItem('sakinah_token', response.access_token);
      setIsWaliViewOnly(true);
      setIsPending(false);
      setLoginSuccess(true);
      // Redirect after the success animation
      setTimeout(() => navigate('/matrimony/wali/dashboard'), 2000);
    } catch (err: any) {
      setIsPending(false);
      setErrors({ general: err.message || 'Login failed. Please check your credentials.' });
    }
  };

  return (
    <div className="sk-viewport relative overflow-hidden">
      <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-b from-[#0A0E16] to-[#0d121c]">
        
        <AnimatePresence>
          {loginSuccess && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#0A0E16]/90 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-[#111826] border border-[rgba(212,168,83,0.3)] rounded-[24px] p-8 max-w-[400px] w-full text-center shadow-[0_0_50px_rgba(212,168,83,0.2)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(212,168,83,0.05)] to-transparent" />
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--sk-gold)] to-[#E8C97A] flex items-center justify-center shadow-[0_0_30px_rgba(212,168,83,0.4)]"
                >
                  <span className="text-[32px] text-[#0A0E16]">✓</span>
                </motion.div>
                <h3 className="font-serif text-[24px] text-[var(--sk-gold)] mb-2 relative z-10">Welcome Back</h3>
                <p className="text-[14px] text-[var(--sk-ink-dim)] mb-4 relative z-10">Preparing your dashboard...</p>
                <div className="w-full bg-[rgba(255,255,255,0.05)] h-[2px] rounded-full overflow-hidden relative z-10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-full bg-[var(--sk-gold)]"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[440px] relative z-10"
        >
          <SakinahHeader title="Wali Login" subtitle="Access your account" onBack={() => navigate('/matrimony/role')} />

          <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-8 text-center">
            Log in to manage profiles, view matches, and communicate on behalf of your loved one.
          </p>

          {(errors as any).general && (
            <div className="mb-4 p-3 rounded-lg bg-[rgba(201,138,138,0.1)] border border-[rgba(201,138,138,0.2)] text-[var(--sk-rose)] text-[12px] text-center">
              {(errors as any).general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[20px] p-6 flex flex-col gap-5 shadow-2xl backdrop-blur-sm">
              <SakinahInput
                label="Email / User ID"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})); }}
                error={errors.email}
                required
              />
              <SakinahInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})); }}
                error={errors.password}
                required
              />
            </div>

            <div className="flex gap-4">
              <SakinahButton variant="ghost" onClick={() => navigate('/matrimony/role')} type="button" className="flex-1 hover:bg-[rgba(255,255,255,0.05)]">
                Back
              </SakinahButton>
              <SakinahButton variant="primary" type="submit" disabled={isPending || loginSuccess} className="flex-1 shadow-[0_0_20px_rgba(212,168,83,0.3)] hover:shadow-[0_0_30px_rgba(212,168,83,0.5)] transition-shadow">
                {isPending ? 'Authenticating...' : 'Login →'}
              </SakinahButton>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
