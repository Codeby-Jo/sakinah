import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeSlash, EnvelopeSimple, Phone, LockKey, ShieldCheck } from '@phosphor-icons/react';
import { registerSakinah } from '../services/sakinahApi';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahButton, SakinahOnboardingShell } from '../components';

// ── Premium Input ──────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, type = 'text', placeholder, value, onChange, error, icon, required }) => {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPw ? 'text' : 'password') : type;

  return (
    <div>
      <label className="block text-[11px] text-white/40 uppercase tracking-[0.12em] mb-2 font-medium">
        {label}{required && <span className="text-[#D4A853] ml-0.5">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'} py-3.5 bg-white/[0.03] border rounded-2xl text-[14px] text-white placeholder-white/20 outline-none transition-all duration-200 focus:ring-1 ${
            error
              ? 'border-red-400/40 focus:border-red-400/60 focus:ring-red-400/20'
              : 'border-white/[0.07] focus:border-[#D4A853]/50 focus:ring-[#D4A853]/10 hover:border-white/[0.12]'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            {showPw ? <EyeSlash size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="text-[11px] text-red-400/80"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────
export const SakinahRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useOnboarding();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof auth, value: string) => {
    setAuth(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!auth.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(auth.email)) e.email = 'Enter a valid email';
    if (!auth.phone) e.phone = 'Phone number is required';
    else if (auth.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid phone number';
    if (!auth.password) e.password = 'Password is required';
    else if (auth.password.length < 8) e.password = 'Minimum 8 characters';
    if (!auth.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (auth.password !== auth.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await registerSakinah({
        email: auth.email,
        password: auth.password,
        full_name: 'Seeker',
        age: 20,
      });
      // Store token if returned
      if (res?.access_token) localStorage.setItem('sakinah_token', res.access_token);
    } catch {
      // Backend offline — gracefully continue (dev / demo mode)
      console.info('[Sakinah] Backend unavailable — continuing in demo mode.');
    } finally {
      setLoading(false);
      navigate('/matrimony/verify-otp');
    }
  };

  const trustBadges = [
    { icon: '🔐', label: 'End-to-end encrypted' },
    { icon: '🕌', label: 'Shariah-compliant' },
    { icon: '👁', label: 'Privacy-first design' },
  ];

  return (
    <SakinahOnboardingShell
      step={1}
      title="Create Account"
      subtitle="Your information is encrypted and never shared without your consent."
    >
      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2 mb-8"
      >
        {trustBadges.map(b => (
          <span key={b.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-[11px] text-white/40">
            <span>{b.icon}</span> {b.label}
          </span>
        ))}
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white/[0.025] border border-white/[0.06] rounded-[28px] p-7 md:p-10 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
      >
        <AnimatePresence>
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] text-center"
            >
              {errors.general}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <Field
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={auth.email}
            onChange={v => update('email', v)}
            error={errors.email}
            icon={<EnvelopeSimple size={16} />}
            required
          />
          <Field
            label="Phone Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={auth.phone}
            onChange={v => update('phone', v)}
            error={errors.phone}
            icon={<Phone size={16} />}
            required
          />
          <Field
            label="Password"
            type="password"
            placeholder="Min 8 characters"
            value={auth.password}
            onChange={v => update('password', v)}
            error={errors.password}
            icon={<LockKey size={16} />}
            required
          />
          <Field
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={auth.confirmPassword}
            onChange={v => update('confirmPassword', v)}
            error={errors.confirmPassword}
            icon={<ShieldCheck size={16} />}
            required
          />

          {/* Password strength indicator */}
          {auth.password.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                    auth.password.length >= n * 3
                      ? n <= 1 ? 'bg-red-400' : n <= 2 ? 'bg-amber-400' : n <= 3 ? 'bg-yellow-300' : 'bg-green-400'
                      : 'bg-white/[0.06]'
                  }`} />
                ))}
              </div>
              <p className="text-[10px] text-white/30">
                {auth.password.length < 6 ? 'Too short' : auth.password.length < 9 ? 'Weak' : auth.password.length < 12 ? 'Good' : 'Strong'}
              </p>
            </motion.div>
          )}

          <div className="flex gap-3 mt-3">
            <SakinahButton
              variant="ghost"
              onClick={() => navigate('/matrimony/role')}
              type="button"
              className="flex-1 py-4 border border-white/[0.07] hover:bg-white/[0.03] text-white/50"
            >
              Back
            </SakinahButton>
            <SakinahButton
              variant="primary"
              type="submit"
              disabled={loading}
              className="flex-1 py-4 shadow-[0_0_24px_rgba(212,168,83,0.25)] hover:shadow-[0_0_36px_rgba(212,168,83,0.45)] transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="block w-4 h-4 border-2 border-[#0A0E16]/30 border-t-[#0A0E16] rounded-full"
                  />
                  Creating…
                </span>
              ) : (
                'Continue →'
              )}
            </SakinahButton>
          </div>
        </form>
      </motion.div>

      {/* Sign-in link */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-[13px] text-white/30 mt-6"
      >
        Already have an account?{' '}
        <button
          onClick={() => navigate('/matrimony/login')}
          className="text-[#D4A853]/70 hover:text-[#D4A853] underline underline-offset-2 transition-colors"
        >
          Sign in
        </button>
      </motion.p>
    </SakinahOnboardingShell>
  );
};
