/**
 * SakinahOnboardingShell — Shared animated layout for all /matrimony onboarding steps.
 * Premium, glassmorphism, gold accents.
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, IdentificationCard, UserList, Heart, CheckCircle,
  List, X,
} from '@phosphor-icons/react';

export const ONBOARDING_STEPS = [
  {
    num: 1,
    label: 'Account Setup',
    subtitle: 'Email & Password',
    icon: UserPlus,
    path: '/matrimony/register',
  },
  {
    num: 2,
    label: 'Identity KYC',
    subtitle: 'Selfie & Govt ID',
    icon: IdentificationCard,
    path: '/matrimony/kyc',
  },
  {
    num: 3,
    label: 'Profile Basics',
    subtitle: 'Personal details',
    icon: UserList,
    path: '/matrimony/profile-creation',
  },
  {
    num: 4,
    label: 'Match Preferences',
    subtitle: 'What you seek',
    icon: Heart,
    path: '/matrimony/preferences',
  },
  {
    num: 5,
    label: 'Review & Submit',
    subtitle: 'Finalize & submit',
    icon: CheckCircle,
    path: '/matrimony/review',
  },
];

interface Props {
  step: number;           // 1-based current step
  children: React.ReactNode;
  /** Page title shown in the content area on desktop */
  title?: string;
  subtitle?: string;
}

import { getProgress } from '../services/sakinahProgress';

export const SakinahOnboardingShell: React.FC<Props> = ({ step, children, title, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // STRICT WALI ONBOARDING LOCKDOWN
  React.useEffect(() => {
    if (getProgress().role === 'WALI_VIEW') {
      navigate('/matrimony/wali-dashboard', { replace: true });
    }
  }, [navigate]);

  const currentStep = ONBOARDING_STEPS[step - 1];
  const progress = (step / ONBOARDING_STEPS.length) * 100;

  const handleStepClick = (s: typeof ONBOARDING_STEPS[number]) => {
    if (s.num <= step) {
      navigate(s.path);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050816] overflow-x-hidden font-sans">
      {/* ── Animated background ─────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-[0.03]"
            style={{
              width: `${300 + i * 150}px`,
              height: `${300 + i * 150}px`,
              background: 'radial-gradient(circle, #D4AF37, transparent)',
              left: `${[10, 70, 30][i]}%`,
              top: `${[20, 80, 50][i]}%`,
            }}
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -20, 20, 0],
              scale: [1, 1.1, 0.95, 1],
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 2,
            }}
          />
        ))}
      </div>

      {/* ── Desktop Left Rail ──────────────────────────────────── */}
      <div className="hidden md:flex flex-col w-[320px] lg:w-[360px] min-h-screen sticky top-0 bg-[#0B1020]/90 backdrop-blur-2xl border-r border-[rgba(212,175,55,0.15)] z-20 shrink-0">
        {/* Logo / Brand */}
        <div className="p-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#8C6220] rounded-xl rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)] shrink-0">
              <span className="-rotate-45 text-[#050816] text-xl font-bold font-serif">S</span>
            </div>
            <div>
              <h2 className="font-serif text-[24px] text-white leading-none tracking-wide">Sakinah</h2>
              <span className="text-[10px] text-[#F5D77A]/60 uppercase tracking-[0.25em]">Premium Matrimony</span>
            </div>
          </motion.div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-[#D4AF37]/80 uppercase tracking-widest">Progress</span>
              <span className="text-[10px] text-white/50">{Math.round(progress)}%</span>
            </div>
            <div className="h-[4px] bg-[rgba(212,175,55,0.1)] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 px-6 pb-8 flex flex-col gap-2">
          {ONBOARDING_STEPS.map((s, i) => {
            const isActive = s.num === step;
            const isCompleted = s.num < step;
            const isClickable = s.num <= step;
            const Icon = s.icon;
            return (
              <motion.button
                key={s.num}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleStepClick(s)}
                disabled={!isClickable}
                className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group text-left w-full overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-[rgba(212,175,55,0.15)] to-transparent border border-[rgba(212,175,55,0.25)] shadow-[inset_0_0_20px_rgba(212,175,55,0.05)]'
                    : isClickable
                    ? 'hover:bg-[rgba(212,175,55,0.05)] border border-transparent cursor-pointer'
                    : 'opacity-40 cursor-default border border-transparent'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="active-step"
                    className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,1)]"
                  />
                )}

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                  isActive
                    ? 'bg-gradient-to-br from-[#D4AF37] to-[#8C6220] text-[#050816] shadow-[0_0_20px_rgba(212,175,55,0.5)]'
                    : isCompleted
                    ? 'bg-[rgba(212,175,55,0.15)] text-[#D4AF37] border border-[rgba(212,175,55,0.3)]'
                    : 'bg-white/[0.03] text-white/40 border border-white/[0.05]'
                }`}>
                  {isCompleted ? (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-sm font-bold">✓</motion.span>
                  ) : (
                    <Icon weight={isActive ? 'fill' : 'regular'} size={20} />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <div className={`text-[14px] font-medium leading-tight mb-1 transition-colors duration-300 ${
                    isActive ? 'text-[#F5D77A]' : isCompleted ? 'text-white/90' : 'text-white/50 group-hover:text-white/70'
                  }`}>
                    {s.label}
                  </div>
                  <div className={`text-[11px] truncate transition-colors duration-300 ${isActive ? 'text-[#D4AF37]/80' : 'text-white/30'}`}>
                    {s.subtitle}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Mobile Top Bar ─────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-50">
        <div className="bg-[#0B1020]/95 backdrop-blur-2xl border-b border-[rgba(212,175,55,0.15)] px-5 py-4 flex items-center justify-between">
          <div className="text-center w-full relative">
            <div className="text-[16px] font-serif text-[#F5D77A]">{currentStep?.label}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-0.5">Step {step} of 5</div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="absolute right-5 w-10 h-10 flex items-center justify-center bg-[rgba(212,175,55,0.1)] rounded-full text-[#D4AF37] hover:bg-[rgba(212,175,55,0.2)] transition-colors"
          >
            {mobileMenuOpen ? <X size={18} /> : <List size={18} />}
          </button>
        </div>

        {/* Mobile progress */}
        <div className="h-[2px] bg-white/[0.04]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F5D77A]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Mobile step drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden bg-[#050816]/98 backdrop-blur-xl border-b border-[rgba(212,175,55,0.2)]"
            >
              <div className="p-5 space-y-2">
                {ONBOARDING_STEPS.map((s) => {
                  const isActive = s.num === step;
                  const isCompleted = s.num < step;
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.num}
                      onClick={() => handleStepClick(s)}
                      disabled={s.num > step}
                      className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all ${
                        isActive ? 'bg-[rgba(212,175,55,0.15)] border border-[rgba(212,175,55,0.3)]' : s.num <= step ? 'hover:bg-white/[0.03]' : 'opacity-30'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-gradient-to-br from-[#D4AF37] to-[#8C6220] text-[#050816]' : isCompleted ? 'bg-[rgba(212,175,55,0.1)] text-[#D4AF37]' : 'bg-white/[0.04] text-white/30'
                      }`}>
                        {isCompleted ? <span className="text-xs font-bold">✓</span> : <Icon size={18} weight={isActive ? 'fill' : 'regular'} />}
                      </div>
                      <span className={`text-[14px] font-medium ${isActive ? 'text-[#F5D77A]' : 'text-white/70'}`}>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className="flex-1 relative z-10 overflow-x-hidden">
        <div className="min-h-screen flex flex-col px-6 py-10 md:px-14 md:py-16 max-w-[760px] mx-auto">
          {/* Desktop page header */}
          {(title || subtitle) && (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block mb-12"
            >
              {title && (
                <h1 className="font-serif text-[42px] lg:text-[50px] text-white leading-tight mb-3 tracking-tight"
                  style={{ textShadow: '0 0 50px rgba(212,175,55,0.2)' }}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-[16px] text-white/50 font-light leading-relaxed max-w-xl">{subtitle}</p>
              )}
            </motion.div>
          )}

          {/* Page content with enter animation */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
