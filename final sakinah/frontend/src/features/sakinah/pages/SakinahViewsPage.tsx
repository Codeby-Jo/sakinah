import React, { useState, useEffect } from 'react';
import { SakinahLayout, SakinahHeader } from '../components';
import { getViews } from '../services/sakinahApi';
import { motion, AnimatePresence } from 'framer-motion';

export const SakinahViewsPage: React.FC = () => {
  const [views, setViews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getViews()
      .then(res => {
        setViews(res.views || []);
      })
      .catch(err => {
        console.error("Failed to fetch views", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SakinahLayout>
      <div className="p-8 max-w-[1000px] mx-auto min-h-screen">
        <SakinahHeader title={`Profile Views (${views.length})`} subtitle="Users who have viewed your profile recently" />
        
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center mt-12"><div className="w-8 h-8 border-2 border-[var(--sk-gold)] border-t-transparent rounded-full animate-spin"></div></div>
          ) : views.length === 0 ? (
            <div className="text-[var(--sk-ink-dim)] text-center mt-12 bg-[#050816]/40 p-10 rounded-2xl border border-[rgba(255,255,255,0.05)]">You have no recent profile views.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {views.map((viewer, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={viewer.id + i} 
                  className="sk-card p-5 border border-[rgba(255,255,255,0.05)] bg-[#0B1020]/40 flex gap-4 items-center"
                >
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--sk-gold)] to-[#A37B31] flex items-center justify-center text-[20px] font-serif text-[#0A0E16] font-bold shrink-0 shadow-[0_0_15px_rgba(212,168,83,0.2)]">
                    {viewer.initial}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-medium text-[var(--sk-ink)]">{viewer.name}</h3>
                    <div className="text-[12px] text-[var(--sk-ink-dim)]">{viewer.age} yrs · {viewer.city}</div>
                    <div className="text-[10px] text-[var(--sk-gold-dim)] mt-1">{viewer.date}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SakinahLayout>
  );
};
