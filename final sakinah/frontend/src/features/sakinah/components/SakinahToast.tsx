import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, WarningCircle } from '@phosphor-icons/react';

export interface SakinahToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export const SakinahToast: React.FC<SakinahToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className={`fixed top-8 left-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-md ${
            type === 'success' 
              ? 'bg-[#0B1020]/90 border-[#D4AF37] shadow-[0_10px_40px_rgba(212,175,55,0.2)] text-[#F5D77A]' 
              : 'bg-[#1a0f14]/90 border-[#e87c7c] shadow-[0_10px_40px_rgba(232,124,124,0.2)] text-[#e87c7c]'
          }`}
        >
          {type === 'success' ? (
            <CheckCircle size={24} weight="fill" className="text-[#D4AF37]" />
          ) : (
            <WarningCircle size={24} weight="fill" className="text-[#e87c7c]" />
          )}
          <span className="text-[14px] font-medium tracking-wide">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
