import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahHeader, SakinahLayout } from '../components';

export const SakinahWaliDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <SakinahLayout>
      <div className="px-6 py-8 max-w-[1000px] mx-auto pb-24">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <SakinahHeader title="Wali Dashboard" subtitle="Stewardship & Monitoring" />
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          
          {/* Managing Profile Banner */}
          <motion.div variants={itemVariants} className="p-4 md:p-5 rounded-[20px] bg-gradient-to-r from-[rgba(212,168,83,0.1)] to-[rgba(212,168,83,0.02)] border border-[rgba(212,168,83,0.2)] flex items-center justify-between shadow-[0_0_20px_rgba(212,168,83,0.05)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--sk-gold)] flex items-center justify-center text-[#0A0E16] text-[20px] font-serif shadow-[0_0_15px_rgba(212,168,83,0.3)]">
                A
              </div>
              <div>
                <div className="text-[11px] text-[var(--sk-gold-dim)] uppercase tracking-[0.1em] mb-0.5">Currently Managing</div>
                <div className="text-[16px] font-serif text-[var(--sk-gold)]">Aisha's Profile</div>
                <div className="text-[12px] text-[var(--sk-ink-dim)] mt-0.5">Candidate ID: <span className="font-mono text-[var(--sk-ink-faint)]">SKN-2026-4821</span></div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--sk-green)] animate-pulse" />
              <span className="text-[12px] text-[var(--sk-green)] font-medium">Profile Visible</span>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Recommended', count: '8', icon: '♡', path: '/matches' },
              { label: 'Interests', count: '2', icon: '✦', path: '/interests' },
              { label: 'Messages', count: '1', icon: '✉', path: '/chat' },
              { label: 'Saved', count: '3', icon: '★', path: '/saved' },
            ].map(s => (
              <div key={s.label} onClick={() => navigate(s.path)} className="sk-card p-5 text-center cursor-pointer hover:border-[var(--sk-gold)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="text-[24px] text-[var(--sk-gold)] mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
                <div className="text-[22px] font-serif text-[var(--sk-ink)]">{s.count}</div>
                <div className="text-[10px] text-[var(--sk-ink-faint)] uppercase tracking-[0.2em] mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Suggested Matches */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[22px] text-[var(--sk-ink)]">Suggested Matches</h2>
              <button onClick={() => navigate('/matches')} className="text-[12px] text-[var(--sk-gold)] hover:text-[var(--sk-gold-soft)] transition-colors">View All →</button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { initial: 'A', name: 'Ahmed', age: 28, city: 'Hyderabad', profession: 'Doctor', match: '90%', reasons: ['Family values align', 'Sect match', 'Age range fit'] },
                { initial: 'M', name: 'Mohammad', age: 26, city: 'Chennai', profession: 'Engineer', match: '85%', reasons: ['Location match', 'Education aligns'] },
              ].map(m => (
                <div key={m.name} className="sk-card p-0 overflow-hidden hover:border-[var(--sk-gold)] transition-colors group">
                  <div className="p-5 flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A853] to-[#A37B31] flex items-center justify-center text-[24px] font-serif text-[#0A0E16] font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] group-hover:scale-105 transition-transform">
                      {m.initial}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-[18px] font-medium text-[var(--sk-ink)]">{m.name}</h3>
                          <div className="text-[13px] text-[var(--sk-ink-dim)] mt-1">{m.age} yrs · {m.city} · {m.profession}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-3 py-1 bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.2)] text-[var(--sk-gold)] text-[12px] rounded-full font-medium">
                            {m.match} Match
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button className="px-4 py-2 text-[12px] bg-[rgba(255,255,255,0.02)] text-[var(--sk-ink-dim)] border border-[rgba(255,255,255,0.05)] rounded-full hover:text-[var(--sk-ink)] transition-colors" onClick={() => navigate('/matches')}>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
            <div className="sk-card p-4 cursor-pointer hover:border-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.02)] transition-all group" onClick={() => alert('Viewing profile is available but editing is disabled for Wali accounts.')}>
              <div className="text-[20px] text-[var(--sk-gold)] mb-2 group-hover:-rotate-12 transition-transform">👁</div>
              <div className="text-[14px] text-[var(--sk-ink)] font-medium">View Profile</div>
              <div className="text-[11px] text-[var(--sk-ink-faint)] mt-1">Review candidate information</div>
            </div>
            <div className="sk-card p-4 cursor-pointer hover:border-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.02)] transition-all group" onClick={() => navigate('/chat')}>
              <div className="text-[20px] text-[var(--sk-gold)] mb-2 group-hover:scale-110 transition-transform">💬</div>
              <div className="text-[14px] text-[var(--sk-ink)] font-medium">Conversations</div>
              <div className="text-[11px] text-[var(--sk-ink-faint)] mt-1">Manage active conversations</div>
            </div>
          </motion.div>
          
        </motion.div>
      </div>
    </SakinahLayout>
  );
};
