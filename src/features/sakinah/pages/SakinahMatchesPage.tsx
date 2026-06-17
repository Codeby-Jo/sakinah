import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOnboarding } from '../context/OnboardingContext';
import { SakinahLayout, SakinahHeader, SakinahReportModal } from '../components';

const MOCK_MATCHES = [
  { 
    id: '1', initial: 'A', name: 'Aisha', age: 25, city: 'London', profession: 'Software Engineer', match: '92%', 
    mutualInterest: false,
    reasons: ['Similar religious practice', 'Same preferred age range', 'Shared interests', 'Compatible education', 'Location preference matches']
  },
  { 
    id: '2', initial: 'M', name: 'Maryam', age: 27, city: 'Toronto', profession: 'Doctor', match: '87%',
    mutualInterest: true,
    reasons: ['Compatible education level', 'Same Islamic sect', 'Similar family values', 'Shared lifestyle choices']
  },
  { 
    id: '3', initial: 'Z', name: 'Zahra', age: 24, city: 'Dubai', profession: 'Teacher', match: '81%',
    mutualInterest: false,
    reasons: ['Similar family values', 'Location preference matches', 'Compatible age']
  },
];

export const SakinahMatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isWaliViewOnly } = useOnboarding();
  const [saved, setSaved] = React.useState<Record<string, boolean>>({});
  const [interested, setInterested] = React.useState<Record<string, boolean>>({});
  const [reportingProfile, setReportingProfile] = React.useState<string | null>(null);

  const toggleSave = (id: string) => setSaved(p => ({ ...p, [id]: !p[id] }));
  const toggleInterest = (id: string) => setInterested(p => ({ ...p, [id]: !p[id] }));

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
      <div className="p-6 md:p-10 max-w-[1000px] mx-auto min-h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <SakinahHeader title="Recommended Matches" subtitle="Curated profiles based on your preferences" onBack={() => navigate('/matrimony/dashboard')} />
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {MOCK_MATCHES.map(m => (
            <motion.div variants={itemVariants} key={m.id} className="sk-card p-0 overflow-hidden hover:border-[var(--sk-gold)] transition-colors group flex flex-col h-full">
              <div className="p-5 flex items-start gap-4 flex-1">
                <div className="relative shrink-0">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A853] to-[#A37B31] flex items-center justify-center text-[24px] font-serif text-[#0A0E16] font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] group-hover:scale-105 transition-all overflow-hidden ${!m.mutualInterest ? 'blur-[4px] opacity-80' : ''}`}>
                    {m.initial}
                  </div>
                  {!m.mutualInterest && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] bg-[#0A0E16]/80 text-[var(--sk-gold)] px-2 py-0.5 rounded-full font-mono">LOCKED</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-[18px] font-medium text-[var(--sk-ink)]">{m.name}</h3>
                      <div className="text-[13px] text-[var(--sk-ink-dim)] mt-0.5">{m.age} yrs · {m.city}</div>
                      <div className="text-[12px] text-[var(--sk-ink-faint)] mt-0.5">{m.profession}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.2)] text-[var(--sk-gold)] text-[12px] rounded-full font-medium">
                        {m.match} Match
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setReportingProfile(m.name); }}
                        className="text-[11px] text-[var(--sk-ink-dim)] hover:text-[var(--sk-rose)] transition-colors flex items-center gap-1 opacity-60 hover:opacity-100"
                        title="Report this profile"
                      >
                        🚩 Report Profile
                      </button>
                    </div>
                  </div>

                  {/* Match Explanation */}
                  {/* Match Explanation */}
                  {m.mutualInterest && (
                    <div className="mt-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(212,168,83,0.15)] shadow-[0_4px_20px_rgba(212,168,83,0.05)] transition-all">
                      <div className="text-[14px] font-serif text-[var(--sk-gold)] mb-3 flex items-center gap-2">
                        ✨ Why This Profile Matches You
                      </div>
                      <div className="flex flex-col gap-2 mb-3">
                        {m.reasons.map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[13px] text-[var(--sk-ink-dim)]">
                            <span className="text-[var(--sk-green)] shrink-0">✅</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-[13px] text-[var(--sk-ink)] font-medium mb-1">
                        Compatibility Score: <span className="text-[var(--sk-gold)]">{m.match}</span>
                      </div>
                      <div className="text-[11px] italic text-[var(--sk-ink-faint)]">
                        "Based on your profile details and preferences, this person appears to be a strong match for you."
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)] flex gap-3">
                {!isWaliViewOnly && (
                  <button onClick={() => toggleSave(m.id)} className={`flex-1 py-2 rounded-xl border text-[13px] transition-colors ${saved[m.id] ? 'bg-[rgba(212,168,83,0.1)] border-[var(--sk-gold)] text-[var(--sk-gold)]' : 'border-[rgba(255,255,255,0.1)] text-[var(--sk-ink-dim)] hover:bg-[rgba(255,255,255,0.05)]'}`}>
                    {saved[m.id] ? 'Saved ★' : 'Save ☆'}
                  </button>
                )}
                <button className="flex-1 py-2 rounded-xl border border-[rgba(212,168,83,0.3)] text-[var(--sk-gold)] text-[13px] hover:bg-[rgba(212,168,83,0.1)] transition-colors">
                  View Profile
                </button>
                {!isWaliViewOnly && (
                  <button onClick={() => toggleInterest(m.id)} className={`flex-[1.5] py-2 rounded-xl text-[13px] font-medium transition-colors ${interested[m.id] ? 'bg-[rgba(127,176,122,0.1)] text-[var(--sk-green)] border border-[rgba(127,176,122,0.2)]' : 'bg-[var(--sk-gold)] text-[#0A0E16] hover:bg-[#E8C97A]'}`}>
                    {interested[m.id] ? 'Interest Sent ✓' : 'Express Interest'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Report Profile Modal */}
      <SakinahReportModal 
        isOpen={!!reportingProfile} 
        onClose={() => setReportingProfile(null)} 
        profileName={reportingProfile || ''} 
      />
    </SakinahLayout>
  );
};
