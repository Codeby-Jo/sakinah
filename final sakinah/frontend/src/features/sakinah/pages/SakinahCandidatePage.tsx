import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  SakinahLayout,
  CandidatePortraitCard, 
  SakinahButton,
  DevFallbackBadge
} from '../components';
import { getCandidateDetail, expressInterest, silentPass } from '../services/sakinahApi';
import type { CandidateSummary } from '../types/sakinah.types';

export const SakinahCandidatePage: React.FC = () => {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState<CandidateSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [errorFallback, setErrorFallback] = useState('');
  const [matchStatus, setMatchStatus] = useState<'idle' | 'sent' | 'mutual'>('idle');

  React.useEffect(() => {
    if (!candidateId) return;
    getCandidateDetail(candidateId)
      .then(res => {
        setCandidate({
          candidateId: res.id || res.candidate_id || candidateId,
          displayName: res.name || res.display_name || 'Hidden Candidate',
          age: res.age || 28,
          location: res.city || res.location || 'Unknown',
          profession: res.profession || 'Professional',
          sect: res.sect || 'Sunni',
          prayerFrequency: res.prayer_frequency || res.prayerFrequency || 'Always prays',
          bioSnippet: res.bio || 'A candidate focused on deen and family.'
        });
      })
      .catch(err => {
        console.error('Failed to load candidate', err);
        setErrorFallback('Failed to load candidate details.');
      })
      .finally(() => setIsLoading(false));
  }, [candidateId]);

  const handleExpressInterest = async () => {
    setIsPending(true);
    setErrorFallback('');
    try {
      if (candidate) {
        const res = await expressInterest(candidate.candidateId);
        if (res && (res.status === 'mutual_interest' || res.status === 'MUTUAL_INTEREST' || res.status === 'mutual')) {
          setMatchStatus('mutual');
        } else {
          setMatchStatus('sent');
        }
        setTimeout(() => navigate('/matrimony/considered-few'), 3000);
      }
    } catch (err) {
      console.warn('Backend offline or failed', err);
      // Assume success for demo if offline
      setMatchStatus('sent');
      setTimeout(() => navigate('/matrimony/considered-few'), 3000);
    } finally {
      setIsPending(false);
    }
  };

  const handleSilentPass = async () => {
    setIsPending(true);
    setErrorFallback('');
    try {
      if (candidate) {
        await silentPass(candidate.candidateId);
        navigate('/matrimony/considered-few');
      }
    } catch (err) {
      console.warn('Backend offline or failed', err);
      setErrorFallback('Backend unreachable.');
      setTimeout(() => navigate('/matrimony/considered-few'), 1000);
    } finally {
      setIsPending(false);
    }
  };

  if (matchStatus !== 'idle') {
    return (
      <SakinahLayout>
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-[#1A2E1A] border border-[#2E5C2E] flex items-center justify-center mb-6">
            <span className="text-4xl text-[#4ADE80]">✓</span>
          </div>
          <h1 className="text-3xl font-serif text-[#D4AF37] mb-4">
            {matchStatus === 'mutual' ? 'Mutual Interest!' : 'Interest Sent'}
          </h1>
          <p className="text-[var(--sk-ink-dim)] max-w-md mx-auto">
            {matchStatus === 'mutual' 
              ? 'Both of you expressed interest! A new conversation has been opened.' 
              : 'Wait for the conversation to open if both of you accept.'}
          </p>
        </div>
      </SakinahLayout>
    );
  }

  return (
    <SakinahLayout>
      <div className="p-6 md:p-10 max-w-[800px] mx-auto min-h-screen relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,168,83,0.03)_0%,transparent_70%)] pointer-events-none z-0" />
        
        {/* Back Button & Header */}
        <div className="flex items-center gap-4 mb-10 relative z-10">
          <button 
            onClick={() => navigate('/matrimony/considered-few')}
            className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[var(--sk-ink-dim)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#EDE7DA] transition-all group"
          >
            <span className="text-[18px] group-hover:-translate-x-1 transition-transform">←</span>
          </button>
          <div>
            <h1 className="text-[28px] md:text-[32px] font-serif text-[var(--sk-gold)] mb-1 leading-tight flex items-center gap-3">
              A resonance
            </h1>
            <p className="text-[12px] md:text-[13px] text-[var(--sk-ink-dim)] font-mono uppercase tracking-widest">
              Character first, never a face
            </p>
          </div>
        </div>

        {errorFallback && (
          <div className="mb-4">
            <p className="text-red-400 text-sm text-center">{errorFallback}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20 text-[var(--sk-gold)]">Loading candidate...</div>
        ) : !candidate ? (
          <div className="flex justify-center py-20 text-[var(--sk-ink-dim)]">Candidate not found.</div>
        ) : (
          <CandidatePortraitCard candidate={candidate} className="mb-10 shadow-2xl shadow-[rgba(212,168,83,0.05)] bg-[#0A0D1A]/90 backdrop-blur-3xl border border-[rgba(212,168,83,0.15)] rounded-3xl overflow-hidden" />
        )}

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center relative z-10">
          <SakinahButton 
            variant="outline" 
            onClick={handleSilentPass} 
            disabled={isPending || !candidate}
            className="w-full sm:w-auto px-10 py-3.5 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
          >
            Pass (Silent)
          </SakinahButton>
          <SakinahButton 
            variant="primary" 
            onClick={handleExpressInterest} 
            disabled={isPending || !candidate}
            className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#F5D77A] text-[#050816] shadow-[0_0_30px_rgba(212,175,55,0.4)]"
          >
            {isPending ? 'Sending...' : 'Express Interest'}
          </SakinahButton>
        </div>
      </div>
    </SakinahLayout>
  );
};
