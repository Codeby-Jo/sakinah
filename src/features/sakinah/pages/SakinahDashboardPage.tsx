import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahHeader, SakinahLayout } from '../components';

export const SakinahDashboardPage: React.FC = () => {
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
          <SakinahHeader title="Dashboard" subtitle="Your Matrimony Journey" />
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          
          {/* Profile Completion */}
          <motion.div variants={itemVariants} className="sk-card gold-edge p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--sk-gold)]/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-[var(--sk-gold)]/10 transition-colors duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-[18px] text-[var(--sk-gold)]">Profile Completion</h3>
                <span className="text-[var(--sk-green)] text-[14px] font-medium px-3 py-1 bg-[var(--sk-green)]/10 rounded-full">100%</span>
              </div>
              <div className="w-full bg-[rgba(255,255,255,0.05)] h-[6px] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
                  className="h-full bg-gradient-to-r from-[var(--sk-green)] to-[#4ade80] rounded-full" 
                />
              </div>
              <p className="text-[12px] text-[var(--sk-ink-dim)] mt-3">Your profile is complete and visible to the matching engine.</p>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Recommended', count: '12', icon: '♡', path: '/matches' },
              { label: 'Interests', count: '3', icon: '✦', path: '/interests' },
              { label: 'Messages', count: '2', icon: '✉', path: '/chat' },
              { label: 'Saved', count: '5', icon: '★', path: '/saved' },
            ].map(s => (
              <div key={s.label} onClick={() => navigate(s.path)} className="sk-card p-5 text-center cursor-pointer hover:border-[var(--sk-gold)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="text-[24px] text-[var(--sk-gold)] mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
                <div className="text-[22px] font-serif text-[var(--sk-ink)]">{s.count}</div>
                <div className="text-[10px] text-[var(--sk-ink-faint)] uppercase tracking-[0.2em] mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Recommended Matches */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[22px] text-[var(--sk-ink)]">Recommended Matches</h2>
              <button onClick={() => navigate('/matches')} className="text-[12px] text-[var(--sk-gold)] hover:text-[var(--sk-gold-soft)] transition-colors">View All →</button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { 
                  initial: 'A', name: 'Aisha', age: 25, city: 'London', profession: 'Software Engineer', match: '92%', 
                  reasons: ['Similar religious practice', 'Same preferred age range', 'Shared interests', 'Compatible education', 'Location preference matches']
                },
                { 
                  initial: 'M', name: 'Maryam', age: 27, city: 'Toronto', profession: 'Doctor', match: '87%',
                  reasons: ['Compatible education level', 'Same Islamic sect', 'Similar family values', 'Shared lifestyle choices']
                },
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
                          <button className="text-[12px] px-4 py-1.5 bg-[var(--sk-gold)] text-[#0A0E16] rounded-full font-medium hover:bg-[#E8C97A] transition-colors">
                            Send Interest
                          </button>
                        </div>
                      </div>

                      {/* Match Explanation */}
                      <div className="mt-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                        <div className="text-[11px] font-mono tracking-[0.1em] text-[var(--sk-gold-dim)] uppercase mb-3">Why this profile matches you</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {m.reasons.map((reason, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[12px] text-[var(--sk-ink-dim)]">
                              <span className="text-[var(--sk-green)]">✓</span>
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
            <div className="sk-card p-4 cursor-pointer hover:border-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.02)] transition-all group" onClick={() => navigate('/profile-creation')}>
              <div className="text-[20px] text-[var(--sk-gold)] mb-2 group-hover:-rotate-12 transition-transform">⚙</div>
              <div className="text-[14px] text-[var(--sk-ink)] font-medium">Edit Profile</div>
              <div className="text-[11px] text-[var(--sk-ink-faint)] mt-1">Update your personal information and photos</div>
            </div>
            <div className="sk-card p-4 cursor-pointer hover:border-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.02)] transition-all group" onClick={() => navigate('/preferences')}>
              <div className="text-[20px] text-[var(--sk-gold)] mb-2 group-hover:scale-110 transition-transform">♡</div>
              <div className="text-[14px] text-[var(--sk-ink)] font-medium">Edit Preferences</div>
              <div className="text-[11px] text-[var(--sk-ink-faint)] mt-1">Refine your desired partner criteria</div>
            </div>
          </motion.div>
          
        </motion.div>
      </div>
    </SakinahLayout>
  );
};
