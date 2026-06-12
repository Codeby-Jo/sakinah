import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahLayout, SakinahHeader } from '../components';

export const SakinahSupportPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SakinahLayout>
      <div className="p-6 md:p-10 max-w-[1000px] mx-auto min-h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <SakinahHeader title="Help & Support" subtitle="We're here for you" onBack={() => navigate('/dashboard')} />
        </motion.div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="sk-card p-8 text-center">
            <div className="text-[40px] text-[var(--sk-gold)] mb-4">💬</div>
            <h3 className="font-serif text-[22px] text-[var(--sk-ink)] mb-2">Live Chat</h3>
            <p className="text-[14px] text-[var(--sk-ink-dim)] mb-6">Chat with our support team instantly.</p>
            <button className="px-6 py-2 bg-[var(--sk-gold)] text-[#0A0E16] font-medium rounded-full hover:bg-[#E8C97A] transition-colors">Start Chat</button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="sk-card p-8 text-center">
            <div className="text-[40px] text-[var(--sk-gold)] mb-4">✉️</div>
            <h3 className="font-serif text-[22px] text-[var(--sk-ink)] mb-2">Email Us</h3>
            <p className="text-[14px] text-[var(--sk-ink-dim)] mb-6">Send us an email and we'll reply within 24h.</p>
            <button className="px-6 py-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-[var(--sk-ink)] font-medium rounded-full hover:border-[var(--sk-gold)] transition-colors">support@sakinah.com</button>
          </motion.div>
        </div>
      </div>
    </SakinahLayout>
  );
};
