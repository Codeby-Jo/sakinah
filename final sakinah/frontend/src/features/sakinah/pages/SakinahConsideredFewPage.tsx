import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahHeader, 
  ConsideredFewList, 
  EmptyMatchState, 
  DevFallbackBadge,
  SakinahLoadingState
} from '../components';
import type { ConsideredFewResponse } from '../types/sakinah.types';
import { getConsideredFew } from '../services/sakinahApi';

export const SakinahConsideredFewPage: React.FC = () => {
  const [response, setResponse] = useState<ConsideredFewResponse | null>(null);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getConsideredFew()
      .then(setResponse)
      .catch((err) => {
        console.warn('Backend offline or failed', err);
        setIsOfflineFallback(true);
        setResponse({ status: 'NO_SUITABLE_MATCHES_RIGHT_NOW', candidates: [] });
      });
  }, []);

  const handleSelectCandidate = (candidateId: string) => {
    navigate(`/sakinah/candidate/${candidateId}`);
  };

  if (!response) {
    return (
      <SakinahJourneyFrame>
        <SakinahLoadingState fullPage message="Aligning compatible candidates..." />
      </SakinahJourneyFrame>
    );
  }

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Your considered few" 
        subtitle="Phase 4 · curated, never a feed" 
        onBack={() => navigate('/matrimony/home')} 
      />

      {isOfflineFallback && (
        <div className="mb-4 sk-fx sk-d1">
          <p className="text-red-400 text-sm">Failed to load considered candidates. Backend unreachable.</p>
        </div>
      )}

      {response.status === 'NO_SUITABLE_MATCHES_RIGHT_NOW' || !response.candidates || response.candidates.length === 0 ? (
        <div className="mt-6 sk-fx sk-d2">
          <EmptyMatchState />
        </div>
      ) : (
        <>
          <div className="sk-active-banner sk-fx sk-d1 mb-[14px]">
            A handful to reflect on — not an endless scroll. Pass on one, the next takes its place. You may <b className="font-medium text-[var(--sk-gold)]">actively pursue only one or two</b>.
          </div>

          <ConsideredFewList 
            candidates={response.candidates} 
            onSelectCandidate={handleSelectCandidate} 
            className="mb-[24px]"
          />
          
          <div className="sk-insight sk-fx sk-d4" style={{ borderColor: 'var(--sk-green)', color: '#bcd6b8' }}>
            In a thin week you'll see fewer — and we'll say so honestly. <em className="italic text-[var(--sk-gold-soft)]">"We'd rather show you no one than the wrong one."</em>
          </div>
        </>
      )}
    </SakinahJourneyFrame>
  );
};
