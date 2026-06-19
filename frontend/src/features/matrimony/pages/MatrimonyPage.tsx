/**
 * MatrimonyPage — Sakinah Landing Page
 *
 * This is the FIRST page shown when a user clicks "Sakinah" in the main nav.
 * It NEVER redirects to dashboard. It shows the premium landing experience
 * and offers two paths: "Begin Gently" (new users) or "Login" (returning).
 */
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function MatrimonyPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Subtle particle animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; r: number; alpha: number; vx: number; vy: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.4 + 0.1,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 168, 83, ${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#05080F] flex flex-col items-center justify-center overflow-hidden">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* Decorative geometric ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[rgba(212,168,83,0.06)] pointer-events-none"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[rgba(212,168,83,0.03)] pointer-events-none"
      />

      {/* Back to main app */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate('/raya-gateway')}
        className="absolute top-6 left-6 flex items-center gap-2 text-[12px] text-[rgba(212,168,83,0.6)] hover:text-[rgba(212,168,83,1)] transition-colors duration-300 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
        <span className="uppercase tracking-widest font-medium">Zaryah+</span>
      </motion.button>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-[700px]">

        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#D4A853] to-[#7A4F1A] rounded-2xl rotate-45 flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(212,168,83,0.25)]">
            <span className="-rotate-45 text-[#05080F] font-serif font-bold text-[36px]">س</span>
          </div>
        </motion.div>

        {/* Arabic subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[13px] text-[rgba(212,168,83,0.5)] uppercase tracking-[0.3em] mb-4 font-medium"
        >
          سكينة · Premium Muslim Matrimony
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-[52px] md:text-[72px] leading-[1.1] text-white mb-6"
          style={{ fontVariantLigatures: 'common-ligatures' }}
        >
          Find Your <br />
          <span className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(135deg, #D4A853 0%, #F5D77A 50%, #C19825 100%)' }}>
            Sakinah
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="text-[16px] md:text-[18px] text-[rgba(255,255,255,0.4)] leading-relaxed max-w-[500px] mb-12 font-light"
        >
          The world's first premium Muslim matrimonial platform built on{' '}
          <span className="text-[rgba(212,168,83,0.7)]">trust, family and compatibility</span>.
          Every step is guided with care.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-4 w-full max-w-[280px]"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(212,168,83,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/matrimony/begin')}
            className="w-full py-4 px-8 rounded-2xl font-semibold text-[15px] text-[#05080F] tracking-wide"
            style={{ background: 'linear-gradient(135deg, #D4A853 0%, #F5D77A 50%, #C19825 100%)' }}
          >
            Begin Gently
          </motion.button>
        </motion.div>

        {/* Trust pillars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 flex items-center gap-8 text-center"
        >
          {[
            { icon: '🛡️', label: 'ID Verified' },
            { icon: '🤲', label: 'Shariah Guided' },
            { icon: '👨‍👩‍👧', label: 'Wali Supported' },
            { icon: '🔒', label: 'Private & Safe' },
          ].map((pill, i) => (
            <motion.div
              key={pill.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="text-[20px]">{pill.icon}</span>
              <span className="text-[10px] text-[rgba(255,255,255,0.3)] uppercase tracking-widest">{pill.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
