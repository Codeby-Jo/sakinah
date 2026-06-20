import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SakinahLayout, SakinahHeader } from '../components';
import { getSavedProfiles, saveProfile } from '../services/sakinahApi';
import { useOnboarding } from '../context/OnboardingContext';
import { BookmarkSimple } from '@phosphor-icons/react';

export const SakinahSavedPage: React.FC = () => {
  const navigate = useNavigate();
  const { isWaliViewOnly } = useOnboarding();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedProfiles()
      .then((res: any) => {
        setItems(res.saved || []);
      })
      .catch((err: any) => console.warn('Failed to load saved profiles', err))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await saveProfile(candidateId); // Toggles it off in backend
      setItems(prev => prev.filter(i => i.id !== candidateId));
    } catch (err) {
      console.warn("Failed to unsave", err);
    }
  };

  return (
    <SakinahLayout>
      <div className="p-6 md:p-10 max-w-[1000px] mx-auto min-h-screen">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <SakinahHeader title="Saved Profiles" subtitle="Profiles you have bookmarked" onBack={() => navigate(isWaliViewOnly ? '/matrimony/wali-dashboard' : '/matrimony/dashboard')} />
        </motion.div>

        <div className="mt-8">
          {loading ? (
            <div className="text-center text-[var(--sk-gold)] animate-pulse mt-12">Loading saved profiles...</div>
          ) : items.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[400px] mx-auto text-center mt-12">
              <div className="w-20 h-20 mx-auto rounded-full bg-[rgba(212,168,83,0.05)] border border-[rgba(212,168,83,0.1)] flex items-center justify-center text-[var(--sk-gold)] mb-6 shadow-[0_0_30px_rgba(212,168,83,0.1)]">
                <BookmarkSimple weight="fill" className="text-[32px]" />
              </div>
              <h3 className="font-serif text-[22px] text-[var(--sk-ink)] mb-3">No Saved Profiles</h3>
              <p className="text-[14px] text-[var(--sk-ink-dim)] mb-8">
                You haven't bookmarked any profiles yet. When you save a profile from your Recommended Matches, it will appear here.
              </p>
              {!isWaliViewOnly && (
                <button onClick={() => navigate('/matrimony/matches')} className="px-6 py-3 bg-[var(--sk-gold)] text-[#0A0E16] rounded-full text-[14px] font-medium hover:bg-[#E8C97A] transition-colors shadow-[0_0_20px_rgba(212,168,83,0.3)]">
                  Discover Matches
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div 
                    key={item.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="sk-card p-5 hover:border-[var(--sk-gold)] transition-all cursor-pointer group" 
                    onClick={() => !isWaliViewOnly && navigate(`/matrimony/candidates/${item.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4A853] to-[#A37B31] flex items-center justify-center text-[20px] font-serif text-[#0A0E16] font-bold group-hover:scale-105 transition-transform shrink-0">
                        {item.initial}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[16px] font-medium text-[var(--sk-ink)] group-hover:text-[var(--sk-gold)] transition-colors">{item.name}</h3>
                        <div className="text-[12px] text-[var(--sk-ink-dim)]">{item.age} yrs · {item.city}</div>
                        <div className="text-[10px] text-[var(--sk-ink-faint)] mt-1">{item.profession}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] flex gap-2">
                      {!isWaliViewOnly ? (
                        <>
                          <button className="flex-1 py-1.5 bg-[rgba(255,255,255,0.02)] text-[var(--sk-ink-dim)] border border-[rgba(255,255,255,0.05)] rounded-full text-[12px] hover:text-[var(--sk-rose)] transition-colors" onClick={(e) => handleUnsave(item.id, e)}>Unsave</button>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/matrimony/candidates/${item.id}`); }} className="flex-1 py-1.5 bg-[var(--sk-gold)] text-[#0A0E16] rounded-full text-[12px] font-medium hover:bg-[#E8C97A] transition-colors shadow-[0_0_15px_rgba(212,168,83,0.2)]">View Profile</button>
                        </>
                      ) : (
                        <button className="w-full py-1.5 bg-[rgba(255,255,255,0.02)] text-[var(--sk-ink-dim)] border border-[rgba(255,255,255,0.05)] rounded-full text-[12px] transition-colors cursor-default">Saved</button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </SakinahLayout>
  );
};
