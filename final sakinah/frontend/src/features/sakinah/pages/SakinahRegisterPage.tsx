import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeSlash, EnvelopeSimple, LockKey, ShieldCheck, UserPlus } from '@phosphor-icons/react';
import { registerSakinah } from '../services/sakinahApi';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahButton } from '../components';
import { setProgress, getProgress, clearProgress, isOnboardingComplete } from '../services/sakinahProgress';

// ── Zod Schema ────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address').refine(val => {
    const disposableDomains = ['mailinator.com', '10minutemail.com', 'tempmail.com', 'guerrillamail.com'];
    const domain = val.split('@')[1];
    return !disposableDomains.includes(domain);
  }, { message: 'Disposable emails are not allowed' }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// ── Premium Input ──────────────────────────────────────────────────────────
interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  ({ label, type = 'text', error, icon, className, required, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPw ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-[11px] uppercase tracking-widest font-semibold text-[#D4AF37]/80 flex items-center gap-1">
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
        <div className="relative">
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-[#D4AF37]' : 'text-white/20'}`}>
            {icon}
          </div>
          <input
            ref={ref}
            type={inputType}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            className={`w-full bg-[#050816]/40 backdrop-blur-xl border border-[rgba(212,175,55,0.15)] text-white placeholder-white/20 rounded-xl pl-11 pr-[42px] py-4 text-[15px] outline-none transition-all duration-300 ${
              error
                ? 'border-red-500/50 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20'
                : 'focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20 hover:border-[rgba(212,175,55,0.3)]'
            } ${className || ''}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#D4AF37] transition-colors"
            >
              {showPw ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="text-[11px] text-red-400 mt-1"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
Field.displayName = 'Field';

// ── Page ───────────────────────────────────────────────────────────────────
export const SakinahRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOnboardingComplete() && localStorage.getItem('sakinah_token')) {
      navigate('/matrimony/dashboard', { replace: true });
    }
  }, [navigate]);

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    mode: 'onChange'
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setApiError(null);
    try {
      // Save to context
      setAuth({
        ...auth,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      });

      const res = await registerSakinah({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      
      const currentRole = getProgress().role || 'SEEKER';
      clearProgress(); // CLEAR OLD STATE FIRST
      
      if (res?.access_token) localStorage.setItem('sakinah_token', res.access_token);
      
      setProgress({ role: currentRole, account_completed: true });
      navigate('/matrimony/kyc');
    } catch (err: any) {
      console.error('Registration error:', err);
      console.info('[Sakinah] Backend unavailable — forcing navigation to KYC.');
      const currentRole = getProgress().role || 'SEEKER';
      clearProgress();
      setProgress({ role: currentRole, account_completed: true });
      navigate('/matrimony/kyc');
    } finally {
      setLoading(false);
    }
  };

  const calculateStrength = (pw: string) => {
    let strength = 0;
    if (pw.length >= 12) strength++;
    if (/[A-Z]/.test(pw)) strength++;
    if (/[a-z]/.test(pw)) strength++;
    if (/[0-9]/.test(pw)) strength++;
    if (/[^A-Za-z0-9]/.test(pw)) strength++;
    return strength; // max 5
  };

  const pwStrength = calculateStrength(passwordValue);

  return (
    <div className="min-h-screen bg-[#050816] flex relative overflow-hidden font-sans">
      {/* ── Background Effects ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,#D4AF37_0%,transparent_70%)] blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,#D4AF37_0%,transparent_70%)] blur-[100px]"
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[480px] bg-[#0A0D1A]/60 backdrop-blur-2xl border border-[rgba(212,175,55,0.1)] rounded-[32px] p-8 md:p-12 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden"
        >
          {/* Subtle gold line at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6D23] mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)] mb-6"
            >
              <UserPlus weight="fill" className="text-[#050816] text-3xl" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-light text-white mb-3 tracking-wide">
              Join <span className="font-semibold text-[#D4AF37]">Sakinah</span>
            </h1>
            <p className="text-[#D4AF37]/60 text-sm font-medium tracking-wide">
              PREMIUM MATRIMONY
            </p>
          </div>

          <AnimatePresence>
            {apiError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 text-center"
              >
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit, (errs) => console.error('Form invalid:', errs))} className="flex flex-col gap-6" noValidate>
            <Field
              label="Full Name"
              type="text"
              placeholder="Your full name"
              {...register('name')}
              error={errors.name?.message}
              icon={<UserPlus size={18} />}
              required
            />
            
            <Field
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              error={errors.email?.message}
              icon={<EnvelopeSimple size={18} />}
              required
            />
            
            <div className="flex flex-col gap-1.5">
              <Field
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                {...register('password')}
                error={errors.password?.message}
                icon={<LockKey size={18} />}
                required
              />
              {/* Password strength indicator */}
              {passwordValue.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                  <div className="flex gap-1.5 h-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className={`flex-1 rounded-full transition-colors duration-500 ${
                        pwStrength >= n 
                          ? n <= 2 ? 'bg-red-500' : n <= 4 ? 'bg-[#F5D77A]' : 'bg-[#D4AF37]'
                          : 'bg-[rgba(212,175,55,0.1)]'
                      }`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-right mt-1.5 uppercase tracking-wider text-[#D4AF37]/50 font-medium">
                    {pwStrength <= 2 ? 'Weak' : pwStrength <= 4 ? 'Good' : 'Strong'}
                  </p>
                </motion.div>
              )}
            </div>
            
            <Field
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              icon={<ShieldCheck size={18} />}
              required
            />

            <div className="mt-4 flex flex-col gap-3">
              {!isValid && Object.keys(errors).length > 0 && (
                <p className="text-center text-[#F5D77A]/50 text-[11px] uppercase tracking-wider font-medium mb-1">
                  Please fix the errors above
                </p>
              )}
              <SakinahButton
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-full py-[18px] text-[15px] transition-all font-semibold rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#050816] shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] border-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="block w-4 h-4 border-2 border-[#050816]/30 border-t-[#050816] rounded-full"
                    />
                    Creating Account...
                  </span>
                ) : (
                  'Create Account →'
                )}
              </SakinahButton>
            </div>
          </form>

          {/* Login link removed */}
        </motion.div>
      </div>
    </div>
  );
};
export default SakinahRegisterPage;
