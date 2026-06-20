import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from '@phosphor-icons/react';

export const SakinahLogoutPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear storage just in case it wasn't cleared before routing here
    localStorage.removeItem('sakinah_token');
    localStorage.removeItem('sakinah_wali_session');
    localStorage.removeItem('sakinah_onboarding_progress');
    
    // Auto redirect to Sakinah landing page after 3.5 seconds
    const timer = setTimeout(() => {
      navigate('/matrimony', { replace: true });
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle,#D4AF37_0%,transparent_70%)] blur-[120px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center flex flex-col items-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="w-24 h-24 mb-8 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#8C6D23]/10 border border-[#D4AF37]/30 flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.2)] backdrop-blur-md"
        >
          <CheckCircle size={48} className="text-[#D4AF37]" weight="fill" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-5xl font-serif text-[#EDE7DA] mb-4 tracking-wide"
        >
          Successfully Logged Out
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[#D4AF37]/70 text-[15px] max-w-md mx-auto leading-relaxed px-4"
        >
          May Allah bless your journey. You are securely signed out of the Sakinah platform.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <div className="w-8 h-8 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
          <p className="text-[12px] text-white/30 uppercase tracking-[0.2em]">Redirecting to Sakinah...</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SakinahLogoutPage;
