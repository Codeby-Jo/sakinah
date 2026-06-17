/**
 * SakinahOnboardingShell — Shared animated layout for all /matrimony onboarding steps.
 * Renders the immersive left-rail step navigator (desktop) + collapsible mobile header.
 * Each page just calls <SakinahOnboardingShell step={N}> and puts its content inside.
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, ShieldCheck, IdentificationCard, UserList, Heart, CheckCircle,
  ArrowLeft, List, X,
} from '@phosphor-icons/react';

export const ONBOARDING_STEPS = [
  {
    num: 1,
    label: 'Registration',
    subtitle: 'Create your account',
    icon: UserPlus,
    path: '/matrimony/register',
  },
  {
    num: 2,
    label: 'Verification',
    subtitle: 'Verify email & phone',
    icon: ShieldCheck,
    path: '/matrimony/verify-otp',
  },
  {
    num: 3,
    label: 'Identity KYC',
    subtitle: 'Upload ID & selfie',
    icon: IdentificationCard,
    path: '/matrimony/kyc',
  },
  {
    num: 4,
    label: 'Profile Details',
    subtitle: 'Basic, religion, lifestyle',
    icon: UserList,
    path: '/matrimony/profile-creation',
  },
  {
    num: 5,
    label: 'Preferences',
    subtitle: 'Set match criteria',
    icon: Heart,
    path: '/matrimony/preferences',
  },
  {
    num: 6,
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

export const SakinahOnboardingShell: React.FC<Props> = ({ step, children, title, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentStep = ONBOARDING_STEPS[step - 1];
  const progress = (step / ONBOARDING_STEPS.length) * 100;

  const handleStepClick = (s: typeof ONBOARDING_STEPS[number]) => {
    if (s.num <= step) {
      navigate(s.path);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#070a10] overflow-x-hidden">

      {/* ── Animated particle background ─────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-[0.04]"
            style={{
              width: `${180 + i * 80}px`,
              height: `${180 + i * 80}px`,
              background: 'radial-gradient(circle, #D4A853, transparent)',
              left: `${[10, 60, 20, 75, 40, 85][i]}%`,
              top: `${[15, 70, 45, 10, 80, 50][i]}%`,
            }}
            animate={{
              x: [0, 20, -10, 0],
              y: [0, -15, 10, 0],
              scale: [1, 1.05, 0.97, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      {/* ── Desktop Left Rail ──────────────────────────────────── */}
      <div className="hidden md:flex flex-col w-[300px] lg:w-[340px] min-h-screen sticky top-0 bg-[#080b12]/95 backdrop-blur-xl border-r border-white/[0.04] z-20 shrink-0">

        {/* Logo / Brand */}
        <div className="p-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4A853] to-[#8C6220] rounded-xl rotate-45 flex items-center justify-center shadow-[0_0_24px_rgba(212,168,83,0.35)] shrink-0">
              <span className="-rotate-45 text-[#0A0E16] text-lg font-bold font-serif">S</span>
            </div>
            <div>
              <h2 className="font-serif text-[20px] text-white leading-none">Sakinah</h2>
              <span className="text-[9px] text-[#D4A853]/50 uppercase tracking-[0.2em]">Matrimony</span>
            </div>
          </motion.div>

          {/* Progress bar */}
          <div className="h-[3px] bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D4A853] to-[#E8C97A] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <p className="text-[10px] text-white/30 mt-2">Step {step} of {ONBOARDING_STEPS.length}</p>
        </div>

        {/* Steps */}
        <div className="flex-1 px-5 pb-8 flex flex-col gap-1">
          <p className="text-[9px] text-white/25 uppercase tracking-[0.18em] mb-3 ml-2">Onboarding Journey</p>
          {ONBOARDING_STEPS.map((s, i) => {
            const isActive = s.num === step;
            const isCompleted = s.num < step;
            const isClickable = s.num <= step;
            const Icon = s.icon;
            return (
              <motion.button
                key={s.num}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleStepClick(s)}
                disabled={!isClickable}
                className={`relative flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-300 group text-left w-full ${
                  isActive
                    ? 'bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.2)]'
                    : isClickable
                    ? 'hover:bg-white/[0.03] cursor-pointer'
                    : 'opacity-35 cursor-default'
                }`}
              >
                {/* Active glow */}
                {isActive && (
                  <motion.div
                    layoutId="step-glow"
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#D4A853] rounded-full shadow-[0_0_12px_rgba(212,168,83,0.8)]"
                  />
                )}

                {/* Icon bubble */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isActive
                    ? 'bg-[#D4A853] text-[#0A0E16] shadow-[0_0_16px_rgba(212,168,83,0.4)]'
                    : isCompleted
                    ? 'bg-[rgba(212,168,83,0.12)] text-[#D4A853]'
                    : 'bg-white/[0.04] text-white/30'
                }`}>
                  {isCompleted ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-sm font-bold"
                    >✓</motion.span>
                  ) : (
                    <Icon weight={isActive ? 'fill' : 'regular'} size={17} />
                  )}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-medium leading-none mb-0.5 transition-colors duration-300 ${
                    isActive ? 'text-[#D4A853]' : isCompleted ? 'text-white/80' : 'text-white/35 group-hover:text-white/55'
                  }`}>
                    {s.label}
                  </div>
                  <div className="text-[11px] text-white/25 truncate">{s.subtitle}</div>
                </div>

                {/* Chevron */}
                <div className={`text-xs transition-colors duration-300 pr-1 ${isActive ? 'text-[#D4A853]' : 'text-white/10 group-hover:text-white/25'}`}>
                  ›
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Exit link */}
        <div className="p-5 border-t border-white/[0.04]">
          <button
            onClick={() => navigate('/raya-gateway')}
            className="flex items-center gap-2.5 text-[12px] text-white/25 hover:text-white/50 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Zaryah+
          </button>
        </div>
      </div>

      {/* ── Mobile Top Bar ─────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-50">
        <div className="bg-[#080b12]/96 backdrop-blur-xl border-b border-white/[0.05] px-5 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center bg-white/[0.04] rounded-full text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <div className="text-center">
            <div className="text-[14px] font-medium text-white">{currentStep?.label}</div>
            <div className="text-[10px] text-white/35">{currentStep?.subtitle}</div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 flex items-center justify-center bg-white/[0.04] rounded-full text-white/60 hover:text-[#D4A853] transition-colors"
          >
            {mobileMenuOpen ? <X size={16} /> : <List size={16} />}
          </button>
        </div>

        {/* Mobile progress */}
        <div className="h-[3px] bg-white/[0.04]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#D4A853] to-[#E8C97A]"
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
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden bg-[#08111a]/98 backdrop-blur-xl border-b border-white/[0.05]"
            >
              <div className="p-4 space-y-1">
                {ONBOARDING_STEPS.map((s) => {
                  const isActive = s.num === step;
                  const isCompleted = s.num < step;
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.num}
                      onClick={() => handleStepClick(s)}
                      disabled={s.num > step}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all ${
                        isActive ? 'bg-[rgba(212,168,83,0.1)]' : s.num <= step ? 'hover:bg-white/[0.03]' : 'opacity-30'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#D4A853] text-[#0A0E16]' : isCompleted ? 'bg-[rgba(212,168,83,0.1)] text-[#D4A853]' : 'bg-white/[0.04] text-white/30'
                      }`}>
                        {isCompleted ? <span className="text-xs font-bold">✓</span> : <Icon size={15} weight={isActive ? 'fill' : 'regular'} />}
                      </div>
                      <span className={`text-[13px] font-medium ${isActive ? 'text-[#D4A853]' : 'text-white/60'}`}>{s.label}</span>
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
        <div className="min-h-screen flex flex-col px-5 py-8 md:px-12 md:py-14 max-w-[680px] mx-auto">
          {/* Desktop page header */}
          {(title || subtitle) && (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block mb-10"
            >
              {title && (
                <h1 className="font-serif text-[38px] lg:text-[46px] text-white leading-tight mb-2"
                  style={{ textShadow: '0 0 40px rgba(212,168,83,0.15)' }}>
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-[15px] text-white/40 font-light leading-relaxed">{subtitle}</p>
              )}
            </motion.div>
          )}

          {/* Page content with enter animation */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
