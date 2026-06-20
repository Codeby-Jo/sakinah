import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SakinahButton } from './SakinahButton';

interface Props {
  matchedUserName: string;
  myInitial?: string;
  matchedUserInitial?: string;
  onStartConversation: () => void;
}

export const SakinahMutualMatchCelebration: React.FC<Props> = ({
  matchedUserName,
  myInitial = 'M',
  matchedUserInitial = 'C',
  onStartConversation
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    // Auto-redirect after 6 seconds if they don't click
    const timer = setTimeout(() => {
      onStartConversation();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onStartConversation]);

  // Generate random confetti particles
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100 - 50, // -50vw to 50vw
    y: Math.random() * 100 - 50,
    scale: Math.random() * 0.5 + 0.5,
    delay: Math.random() * 0.5,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0E16]/95 backdrop-blur-xl flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,168,83,0.15)_0%,transparent_60%)] pointer-events-none" />
      
      {/* Confetti / Sparkles */}
      {showConfetti && particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0, rotate: 0 }}
          animate={{ 
            opacity: [0, 1, 0], 
            x: `${p.x}vw`, 
            y: `${p.y > 0 ? p.y : p.y - 50}vh`, 
            scale: p.scale, 
            rotate: p.rotation + 180 
          }}
          transition={{ duration: 2.5 + Math.random() * 2, delay: p.delay, ease: "easeOut", repeat: Infinity }}
          className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
          style={{
            backgroundColor: p.id % 2 === 0 ? '#D4A853' : p.id % 3 === 0 ? '#E8C97A' : '#ffffff',
            boxShadow: '0 0 10px rgba(212,168,83,0.8)'
          }}
        />
      ))}

      <div className="max-w-md w-full p-8 flex flex-col items-center text-center relative z-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          {/* Profile Avatars */}
          <div className="flex items-center justify-center mb-8 relative h-28 w-full max-w-[240px]">
            {/* Connection Line */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
              className="absolute top-1/2 -translate-y-1/2 left-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--sk-gold)] to-transparent"
            />
            
            {/* My Avatar */}
            <motion.div 
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute left-0 w-24 h-24 rounded-full bg-[#161D2C] border-2 border-[var(--sk-gold)] shadow-[0_0_20px_rgba(212,168,83,0.3)] flex items-center justify-center text-[32px] font-serif font-bold text-[#EDE7DA] z-10"
            >
              {myInitial}
            </motion.div>

            {/* Pulsing Heart */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
            >
              <div className="relative">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-[40px] text-[var(--sk-gold)] drop-shadow-[0_0_15px_rgba(212,168,83,0.6)]"
                >
                  ♡
                </motion.div>
              </div>
            </motion.div>

            {/* Match Avatar */}
            <motion.div 
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute right-0 w-24 h-24 rounded-full bg-gradient-to-br from-[#D4A853] to-[#A37B31] border-2 border-[var(--sk-gold)] shadow-[0_0_20px_rgba(212,168,83,0.5)] flex items-center justify-center text-[32px] font-serif font-bold text-[#0A0E16] z-10"
            >
              {matchedUserInitial}
            </motion.div>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-[32px] md:text-[40px] font-serif text-[var(--sk-gold)] mb-3 leading-tight"
          >
            ✨ It's a Mutual Match!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="text-[15px] md:text-[16px] text-[#EDE7DA] font-medium mb-4"
          >
            You and {matchedUserName} have expressed interest in each other.
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="text-[13px] md:text-[14px] text-[var(--sk-ink-dim)] italic mb-10 max-w-[280px]"
          >
            "May Allah place barakah in this connection and guide you both towards goodness."
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 0.6 }}
            className="w-full flex flex-col gap-3"
          >
            <SakinahButton 
              variant="primary" 
              onClick={onStartConversation}
              className="w-full py-4 text-[16px] bg-gradient-to-r from-[var(--sk-gold)] to-[#E8C97A] text-[#0A0E16] shadow-[0_0_20px_rgba(212,168,83,0.3)] hover:scale-105"
            >
              Start Conversation
            </SakinahButton>
            <p className="text-[11px] text-[var(--sk-ink-dim)] mt-2">
              Opening automatically...
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
