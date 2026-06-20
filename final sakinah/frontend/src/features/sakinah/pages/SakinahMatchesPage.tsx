import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahLayout, SakinahHeader, SakinahReportModal } from '../components';
import { getConsideredFew, expressInterest, silentPass, getMyConversations, saveProfile } from '../services/sakinahApi';
import { getProgress } from '../services/sakinahProgress';
import { ShieldCheck, Star, Flag, Sparkle, CheckCircle, Check, Warning, Moon } from '@phosphor-icons/react';

interface MatchItem {
  id: string;
  initial: string;
  name: string;
  age: number | null;
  city: string | null;
  profession: string | null;
  match: string;
  mutualInterest: boolean;
  reasons: string[];
  managedByWali?: boolean;
}

// Skeleton component for loading state
const MatchCardSkeleton = () => (
  <div className="sk-card p-0 overflow-hidden flex flex-col h-full animate-pulse border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]">
    <div className="p-5 flex items-start gap-4 flex-1">
      <div className="w-16 h-16 rounded-full bg-[rgba(212,168,83,0.1)] shrink-0" />
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="w-full">
            <div className="h-5 bg-[rgba(255,255,255,0.08)] rounded w-1/3 mb-2" />
            <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-1/2 mb-2" />
            <div className="h-3 bg-[rgba(255,255,255,0.05)] rounded w-1/4" />
          </div>
          <div className="h-6 w-16 bg-[rgba(212,168,83,0.1)] rounded-full shrink-0" />
        </div>
        <div className="h-24 bg-[rgba(255,255,255,0.03)] rounded-xl mt-4" />
      </div>
    </div>
    <div className="p-4 border-t border-[rgba(255,255,255,0.05)] flex gap-3">
      <div className="flex-1 h-10 bg-[rgba(255,255,255,0.03)] rounded-xl" />
      <div className="flex-1 h-10 bg-[rgba(255,255,255,0.03)] rounded-xl" />
      <div className="flex-[1.5] h-10 bg-[rgba(212,168,83,0.1)] rounded-xl" />
    </div>
  </div>
);

const MatchCard = React.memo(({ 
  m,
  isWali,
  interested, 
  saved,
  onPass,
  onInterest, 
  onSave,
  onReport,
  onView
}: {
  m: MatchItem;
  isWali: boolean; 
  interested: boolean; 
  saved: boolean;
  onPass: () => void; 
  onInterest: () => void; 
  onSave: () => void;
  onReport: () => void;
  onView: () => void;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className="sk-card p-0 overflow-hidden hover:border-[rgba(212,168,83,0.4)] transition-all duration-300 group flex flex-col h-full bg-[#111826]/80 backdrop-blur-sm shadow-lg"
  >
    <div className="p-5 flex items-start gap-4 flex-1 relative">
      {!m.mutualInterest && (
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-transparent to-[#0A0E16]/40 pointer-events-none z-0" />
      )}
      <div className="relative shrink-0 z-10">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-[#D4A853] to-[#A37B31] flex items-center justify-center text-[24px] font-serif text-[#0A0E16] font-bold shadow-[0_0_15px_rgba(212,168,83,0.3)] group-hover:scale-105 transition-all overflow-hidden ${!m.mutualInterest ? 'blur-[4px] opacity-80' : ''}`}>
          {m.initial}
        </div>
        {!m.mutualInterest && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] bg-[#0A0E16]/90 text-[var(--sk-gold)] px-2 py-0.5 rounded-full font-mono font-bold tracking-wider border border-[rgba(212,168,83,0.3)] shadow-xl">LOCKED</span>
          </div>
        )}
      </div>
      <div className="flex-1 z-10">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-[18px] font-medium text-[var(--sk-ink)] flex items-center gap-2">
              {m.name}
              {m.managedByWali && (
                <span className="text-[10px] bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded-full whitespace-nowrap flex items-center gap-1">
                  <ShieldCheck weight="fill" className="text-[12px]" /> Managed by Wali
                </span>
              )}
            </h3>
            <div className="text-[13px] text-[var(--sk-ink-dim)] mt-0.5">{m.age ? `${m.age} yrs` : ''} {m.city ? `· ${m.city}` : ''}</div>
            <div className="text-[12px] text-[var(--sk-ink-faint)] mt-0.5">{m.profession}</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="px-3 py-1 bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.2)] text-[var(--sk-gold)] text-[12px] rounded-full font-medium">
              {m.match} Match
            </span>
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); onSave(); }}
                className={`text-[11px] transition-colors flex items-center gap-1 opacity-80 hover:opacity-100 ${saved ? 'text-[var(--sk-gold)]' : 'text-[var(--sk-ink-dim)] hover:text-[var(--sk-gold)]'}`}
                title="Save this profile"
              >
                <Star weight={saved ? 'fill' : 'regular'} className="text-[14px]" /> {saved ? 'Saved' : 'Save'}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onReport(); }}
                className="text-[11px] text-[var(--sk-ink-dim)] hover:text-[var(--sk-rose)] transition-colors flex items-center gap-1 opacity-60 hover:opacity-100"
                title="Report this profile"
              >
                <Flag weight="fill" className="text-[12px]" /> Report
              </button>
            </div>
          </div>
        </div>

        {/* Match Explanation */}
        {m.mutualInterest && m.reasons && m.reasons.length > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(212,168,83,0.15)] shadow-[0_4px_20px_rgba(212,168,83,0.05)] transition-all">
            <div className="text-[13px] font-serif text-[var(--sk-gold)] mb-3 flex items-center gap-2">
              <Sparkle weight="fill" className="text-[14px]" /> Why This Profile Matches You
            </div>
            <div className="flex flex-col gap-2 mb-3">
              {m.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[12px] text-[var(--sk-ink-dim)]">
                  <CheckCircle weight="fill" className="text-[var(--sk-green)] shrink-0 mt-0.5 text-[14px]" />
                  <span className="leading-tight">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-[#0C111A] flex gap-3 z-10 relative">
      <button 
        onClick={onPass} 
        className="flex-1 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-[13px] transition-all duration-300 font-medium text-[var(--sk-ink-dim)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#EDE7DA]"
      >
        Silent Pass
      </button>
      <button 
        onClick={onView}
        className="flex-1 py-2.5 rounded-xl border border-[rgba(212,168,83,0.3)] text-[var(--sk-gold)] text-[13px] font-medium hover:bg-[rgba(212,168,83,0.1)] hover:shadow-[0_0_15px_rgba(212,168,83,0.15)] transition-all duration-300"
      >
        View Profile
      </button>
      <button 
        onClick={onInterest} 
        disabled={interested}
        className={`flex-[1.5] py-2.5 rounded-xl text-[13px] font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${interested ? 'bg-[rgba(127,176,122,0.1)] text-[var(--sk-green)] border border-[rgba(127,176,122,0.2)] opacity-50 cursor-not-allowed' : 'bg-gradient-to-r from-[var(--sk-gold)] to-[#E8C97A] text-[#0A0E16] hover:shadow-[0_0_20px_rgba(212,168,83,0.4)] hover:scale-[1.02]'}`}
      >
        {isWali ? (interested ? <><Check weight="bold" /> Interest Recommended</> : 'Recommend Interest') : (interested ? <><Check weight="bold" /> Interest Sent</> : 'Express Interest')}
      </button>
    </div>
  </motion.div>
));

export const SakinahMatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const isWali = getProgress().role === 'LOOKING_FOR_SOMEONE_ELSE' || getProgress().role === 'WALI_VIEW';
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track actions per profile ID
  const [interested, setInterested] = useState<Record<string, boolean>>({});
  const [savedProfiles, setSavedProfiles] = useState<Record<string, boolean>>({});
  const [reportingProfile, setReportingProfile] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchMatches = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      // In production, this would accept pagination parameters: getConsideredFew(pageNum, 10)
      const response: any = await getConsideredFew();
      
      // Map API response to MatchItem. Assume standard mapping if fields differ.
      const fetchedMatches: MatchItem[] = (response?.candidates || response?.results || []).map((c: any) => ({
        id: c.id || c.candidate_id,
        initial: c.name?.charAt(0) || '?',
        name: c.name || 'Unknown User',
        age: c.age || null,
        city: c.city || c.location || null,
        profession: c.profession || c.occupation || null,
        match: c.match_percentage ? `${c.match_percentage}%` : '80%',
        mutualInterest: c.mutual_interest || false,
        reasons: c.match_reasons || ['Strong compatibility based on preferences.'],
        managedByWali: c.managed_by_wali || Math.random() > 0.7 // Mocking real-time Wali management
      }));

      setMatches(prev => pageNum === 1 ? fetchedMatches : [...prev, ...fetchedMatches]);
      // Determine if there are more based on a standard 'has_next' flag or length check
      setHasMore(response.has_next || false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch matches. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches(1);
  }, [fetchMatches]);

  const handlePass = useCallback(async (id: string) => {
    // Silent pass: remove from list immediately and call API
    setMatches(prev => prev.filter(m => m.id !== id));
    try {
      await silentPass(id);
    } catch (err) {
      console.error('Failed to pass:', err);
    }
  }, []);

  const handleSave = useCallback(async (id: string) => {
    try {
      const resp: any = await saveProfile(id);
      setSavedProfiles(p => ({ ...p, [id]: resp.saved }));
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  }, []);

  const handleInterest = useCallback(async (id: string) => {
    if (interested[id]) return; // One-way action
    
    try {
      // Check active conversations limit
      const convosResponse = await getMyConversations();
      const convosList = Array.isArray(convosResponse) ? convosResponse : (convosResponse.conversations || []);
      const activeCount = convosList.filter((c: any) => c.status !== 'closed').length;
      
      if (activeCount >= 2) {
        setError("You have reached the maximum active conversations limit (2). Please focus on your current conversations or close one before showing interest in others.");
        // Auto dismiss error
        setTimeout(() => setError(null), 5000);
        return;
      }

      setInterested(p => ({ ...p, [id]: true }));
      const response = await expressInterest(id);
      
      if (response && response.status === 'mutual_interest') {
        // Redirect immediately if it's a mutual match
        navigate('/matrimony/messages');
        return;
      }
      
      // Auto remove from list after a short delay
      setTimeout(() => {
        setMatches(prev => prev.filter(m => m.id !== id));
      }, 1500);
    } catch (err) {
      setInterested(p => ({ ...p, [id]: false }));
      console.error('Failed to register interest:', err);
    }
  }, [interested, navigate]);

  // Handle infinite scroll trigger
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop === e.currentTarget.clientHeight;
    if (bottom && hasMore && !loading) {
      setPage(p => p + 1);
      fetchMatches(page + 1);
    }
  }, [hasMore, loading, page, fetchMatches]);

  const renderedMatches = useMemo(() => {
    return matches.map(m => (
      <MatchCard
        key={m.id}
        m={m}
        isWali={isWali}
        interested={!!interested[m.id]}
        saved={!!savedProfiles[m.id]}
        onPass={() => handlePass(m.id)}
        onInterest={() => handleInterest(m.id)}
        onSave={() => handleSave(m.id)}
        onReport={() => setReportingProfile(m.id)}
        onView={() => navigate(`/matrimony/candidates/${m.id}`)}
      />
    ));
  }, [matches, isWali, interested, savedProfiles, handlePass, handleInterest, handleSave, navigate]);

  return (
    <SakinahLayout>
      <div 
        className="p-6 md:p-10 max-w-[1200px] mx-auto h-[calc(100vh-60px)] md:h-screen overflow-y-auto custom-scrollbar relative"
        onScroll={handleScroll}
      >
        {/* Decorative background geometry */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,168,83,0.03)_0%,transparent_70%)] pointer-events-none z-0" />
        
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <SakinahHeader title="Recommended Matches" subtitle="Curated profiles based on your compatibility preferences" onBack={() => navigate('/matrimony/dashboard')} />
          </motion.div>

          {/* Error State */}
          {error && !loading && matches.length === 0 && (
            <div className="mt-12 text-center p-8 border border-red-500/20 bg-red-500/5 rounded-[24px]">
              <span className="text-[40px] block mb-4">⚠️</span>
              <h3 className="text-red-400 font-serif text-[20px] mb-2">Unable to Load Matches</h3>
              <p className="text-[14px] text-red-400/80 mb-6">{error}</p>
              <button onClick={() => fetchMatches(1)} className="px-6 py-2.5 bg-[var(--sk-gold)] text-[#0A0E16] font-bold rounded-xl hover:bg-[#E8C97A] transition-colors">
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && matches.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="mt-12 flex flex-col items-center justify-center text-center p-12 sk-card"
            >
              <div className="w-24 h-24 rounded-full bg-[rgba(212,168,83,0.05)] border border-[rgba(212,168,83,0.1)] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,168,83,0.1)] text-[var(--sk-gold)]">
                <Moon weight="fill" className="text-[40px]" />
              </div>
              <h3 className="font-serif text-[24px] text-[var(--sk-gold)] mb-3">No New Matches</h3>
              <p className="text-[14px] text-[var(--sk-ink-dim)] max-w-[400px] leading-relaxed mb-8">
                We are carefully curating profiles that align with your Islamic values and preferences. Sometimes, patience is required to find the right candidate.
              </p>
              <div className="flex gap-4">
                <button onClick={() => navigate('/matrimony/preferences')} className="px-6 py-3 border border-[rgba(212,168,83,0.3)] text-[var(--sk-gold)] font-medium rounded-xl hover:bg-[rgba(212,168,83,0.1)] transition-all">
                  Review Preferences
                </button>
                <button onClick={() => fetchMatches(1)} className="px-6 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#EDE7DA] font-medium rounded-xl hover:bg-[rgba(255,255,255,0.1)] transition-all">
                  Refresh List
                </button>
              </div>
            </motion.div>
          )}

          {/* Matches Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {renderedMatches}
            
            {/* Loading Skeletons */}
            {loading && (
              <>
                <MatchCardSkeleton />
                <MatchCardSkeleton />
                <MatchCardSkeleton />
                <MatchCardSkeleton />
              </>
            )}
          </div>
          
          {/* Load More Trigger Area (if hasMore but not loading) */}
          {hasMore && !loading && (
            <div className="mt-8 text-center">
              <button 
                onClick={() => { setPage(p => p + 1); fetchMatches(page + 1); }}
                className="px-6 py-2 border border-[rgba(255,255,255,0.1)] rounded-full text-[13px] text-[var(--sk-ink-dim)] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                Load More Profiles
              </button>
            </div>
          )}
        </div>
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
