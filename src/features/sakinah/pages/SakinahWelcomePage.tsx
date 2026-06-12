import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const SakinahWelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="sk-viewport relative overflow-x-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--sk-gold)] rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ y: [0, 20, 0], opacity: [0.02, 0.04, 0.02] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#A37B31] rounded-full blur-[150px]" 
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-10 pb-20">
        <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-[800px] mx-auto w-full flex flex-col items-center">
          
          <motion.div variants={itemVars} className="mb-8 relative">
            <div className="w-20 h-20 bg-gradient-to-br from-[var(--sk-gold)] to-[#A37B31] rounded-[24px] rotate-45 flex items-center justify-center shadow-[0_0_50px_rgba(212,168,83,0.4)]">
              <span className="-rotate-45 text-[#0A0E16] text-[36px] font-serif font-bold">S</span>
            </div>
            <div className="absolute inset-0 bg-[var(--sk-gold)] rounded-[24px] rotate-45 blur-2xl opacity-50 -z-10 animate-pulse" />
          </motion.div>

          <motion.h1 variants={itemVars} className="font-serif text-[48px] md:text-[64px] lg:text-[72px] text-[var(--sk-ink)] leading-[1.1] mb-6 tracking-tight">
            Find Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--sk-gold)] to-[#E8C97A]">Righteous Spouse</span>
          </motion.h1>

          <motion.p variants={itemVars} className="text-[16px] md:text-[20px] text-[var(--sk-ink-dim)] max-w-[560px] leading-[1.6] mb-12 font-light">
            Sakinah is a premium, halal matchmaking platform designed to help practicing Muslims find their life partner with character and deen at the forefront.
          </motion.p>

          <motion.div variants={itemVars} className="w-full max-w-[340px]">
            <button
              onClick={() => navigate('/role')}
              className="w-full py-4 px-8 bg-gradient-to-r from-[var(--sk-gold)] to-[#E8C97A] text-[#0A0E16] text-[16px] font-medium rounded-full shadow-[0_0_30px_rgba(212,168,83,0.3)] hover:shadow-[0_0_50px_rgba(212,168,83,0.5)] hover:-translate-y-1 transition-all duration-300"
            >
              Get Started →
            </button>
            <p className="text-[12px] text-[var(--sk-ink-faint)] mt-5">
              Already have an account? <span className="text-[var(--sk-gold)] cursor-pointer hover:underline">Sign In</span>
            </p>
          </motion.div>

        </motion.div>
      </section>

      {/* About Section - Scroll Reveal */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-[900px] mx-auto px-6 py-24"
      >
        <h2 className="font-serif text-[36px] text-center text-[var(--sk-ink)] mb-6">About Sakinah</h2>
        <p className="text-center text-[16px] md:text-[18px] text-[var(--sk-ink-dim)] font-light leading-[1.8] max-w-[700px] mx-auto">
          Sakinah is a premium Islamic matrimony platform that prioritises character, values, and genuine compatibility. 
          We don't start with a photo or a checklist. We start with <em className="text-[var(--sk-gold-soft)] not-italic font-medium">you</em> — 
          your intentions, your values, and the kind of life you wish to build together.
        </p>
      </motion.section>

      {/* Features - Scroll Reveal with Stagger */}
      <section className="relative z-10 max-w-[1100px] mx-auto px-6 py-24">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="font-serif text-[36px] text-center text-[var(--sk-ink)] mb-16"
        >
          How It Works
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '◉', title: 'Verified Identity', desc: 'Every user passes government ID verification and liveness checks. No fakes, no catfishing.' },
            { icon: '♡', title: 'Character-First Matching', desc: 'Our proprietary NIS engine evaluates compatibility through values, psychology, and life goals — not just demographics.' },
            { icon: '⌥', title: 'Privacy Protected', desc: 'Photos are blurred by default. Your data is encrypted. Nothing is shared without your explicit consent.' },
          ].map((f, i) => (
            <motion.div 
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="sk-card p-8 text-center bg-[rgba(255,255,255,0.02)] backdrop-blur-sm hover:border-[var(--sk-gold)] hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="text-[32px] text-[var(--sk-gold)] mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="font-serif text-[20px] text-[var(--sk-ink)] mb-3">{f.title}</h3>
              <p className="text-[14px] text-[var(--sk-ink-dim)] font-light leading-[1.6]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center py-32 px-6"
      >
        <div className="max-w-[600px] mx-auto bg-gradient-to-b from-[rgba(212,168,83,0.05)] to-transparent border border-[rgba(212,168,83,0.1)] rounded-[32px] p-12 backdrop-blur-sm">
          <h2 className="font-serif text-[32px] md:text-[40px] text-[var(--sk-ink)] mb-4">Begin Your Journey</h2>
          <p className="text-[16px] text-[var(--sk-ink-dim)] font-light mb-10">Your path to a blessed union starts with a single step.</p>
          <button
            onClick={() => navigate('/role')}
            className="w-[200px] py-4 bg-[var(--sk-gold)] text-[#0A0E16] text-[15px] font-medium rounded-full hover:bg-[#E8C97A] hover:shadow-[0_0_30px_rgba(212,168,83,0.4)] transition-all duration-300"
          >
            Get Started →
          </button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[rgba(255,255,255,0.05)] py-8 px-6 text-center">
        <div className="text-[12px] text-[var(--sk-ink-faint)] tracking-wider">© 2026 SAKINAH — A ZARYAH INITIATIVE.</div>
      </footer>
    </div>
  );
};
