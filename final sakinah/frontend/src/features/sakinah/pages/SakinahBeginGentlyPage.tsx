/**
 * SakinahBeginGentlyPage
 *
 * Second screen in the onboarding flow. Shown after the Landing Page.
 * Provides a calm, purposeful introduction to the platform before
 * the user selects their role.
 *
 * Flow: Landing → [this page] → Role Selection → Register → ...
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PILLARS = [
  {
    icon: '🤲',
    title: 'Intention First',
    desc: 'Begin with niyyah. Every step here is designed with Islamic adab in mind.',
  },
  {
    icon: '🛡️',
    title: 'Verified & Safe',
    desc: 'Every profile is identity-verified. Your privacy is protected at every layer.',
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Family Involved',
    desc: 'Wali participation is built in. This is a platform that respects your family.',
  },
  {
    icon: '✦',
    title: 'Compatibility Focused',
    desc: 'We go beyond looks. Deep compatibility matching based on values and deen.',
  },
];

export const SakinahBeginGentlyPage: React.FC = () => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const item: any = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center px-6 py-16 relative overflow-hidden">

      {/* Glow backdrop */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(212,168,83,0.07) 0%, transparent 60%)' }} />

      {/* Back */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={() => navigate('/matrimony')}
        className="absolute top-6 left-6 flex items-center gap-2 text-[12px] text-[rgba(212,168,83,0.5)] hover:text-[rgba(212,168,83,0.9)] transition-colors duration-300 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span>
        <span className="uppercase tracking-widest font-medium">Back</span>
      </motion.button>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-[640px] flex flex-col items-center text-center"
      >
        {/* Calligraphy accent */}
        <motion.div variants={item} className="mb-8">
          <div className="w-16 h-16 rounded-2xl rotate-45 mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(212,168,83,0.04))', border: '1px solid rgba(212,168,83,0.2)' }}>
            <span className="-rotate-45 text-[28px]">🕌</span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="font-serif text-[40px] md:text-[56px] text-white leading-[1.15] mb-5"
        >
          Begin Your Journey{' '}
          <span className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #D4A853 0%, #F5D77A 50%, #C19825 100%)' }}>
            With Care
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p variants={item} className="text-[16px] text-[rgba(255,255,255,0.45)] leading-relaxed max-w-[480px] mb-4">
          Sakinah is a serious Muslim matrimonial platform focused on{' '}
          <span className="text-[rgba(212,168,83,0.7)]">trust, family and deep compatibility</span>.
        </motion.p>
        <motion.p variants={item} className="text-[14px] text-[rgba(255,255,255,0.3)] leading-relaxed max-w-[420px] mb-12">
          We'll guide you through each step gently. There is no rush. Your journey begins when you're ready.
        </motion.p>

        {/* Pillars grid */}
        <motion.div
          variants={item}
          className="grid grid-cols-2 gap-4 w-full mb-12"
        >
          {PILLARS.map((p) => (
            <motion.div
              key={p.title}
              whileHover={{ scale: 1.03, borderColor: 'rgba(212,168,83,0.35)' }}
              className="flex flex-col items-start gap-3 p-5 rounded-2xl text-left transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span className="text-[24px]">{p.icon}</span>
              <div>
                <h3 className="text-[14px] font-semibold text-[rgba(212,168,83,0.9)] mb-1">{p.title}</h3>
                <p className="text-[12px] text-[rgba(255,255,255,0.35)] leading-relaxed">{p.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={item} className="flex flex-col gap-4 w-full max-w-[280px]">
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(212,168,83,0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/matrimony/role')}
            className="w-full py-4 px-8 rounded-2xl font-semibold text-[15px] text-[#05080F] tracking-wide"
            style={{ background: 'linear-gradient(135deg, #D4A853 0%, #F5D77A 50%, #C19825 100%)' }}
          >
            Continue →
          </motion.button>
        </motion.div>

        {/* Progress indicator */}
        <motion.div variants={item} className="mt-10 flex items-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`rounded-full transition-all duration-300 ${step === 1 ? 'w-6 h-2 bg-[#D4A853]' : 'w-2 h-2 bg-[rgba(255,255,255,0.1)]'}`}
            />
          ))}
          <span className="ml-2 text-[11px] text-[rgba(255,255,255,0.25)] uppercase tracking-widest">Step 1 of 6</span>
        </motion.div>
      </motion.div>
    </div>
  );
};
