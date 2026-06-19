import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahHeader, 
  CandidatePortraitCard, 
  SakinahButton,
  DevFallbackBadge
} from '../components';
import { mockCandidates } from '../data/mockSakinahData';
import { expressInterest, silentPass } from '../services/sakinahApi';

export const SakinahCandidatePage: React.FC = () => {
  const navigate = useNavigate();
  const { candidateId } = useParams();
  const [isPending, setIsPending] = useState(false);
  const [errorFallback, setErrorFallback] = useState('');

  // Fallback to mock for now if not fetched via API
  const candidate = mockCandidates.find(c => c.candidateId === candidateId) || mockCandidates[0];

  const handleExpressInterest = async () => {
    setIsPending(true);
    setErrorFallback('');
    try {
      await expressInterest(candidate.candidateId);
      navigate(`/sakinah/matchflow/mock_matchflow_${candidate.candidateId}`);
    } catch (err) {
      console.warn('Backend offline, using dev fallback for expressInterest', err);
      setErrorFallback('Backend unreachable. Proceeding in Development Preview Mode.');
      setTimeout(() => navigate(`/sakinah/matchflow/mock_matchflow_${candidate.candidateId}`), 1000);
    } finally {
      setIsPending(false);
    }
  };

  const handleSilentPass = async () => {
    setIsPending(true);
    setErrorFallback('');
    try {
      await silentPass(candidate.candidateId);
      navigate('/matrimony/considered-few');
    } catch (err) {
      console.warn('Backend offline, using dev fallback for silentPass', err);
      setErrorFallback('Backend unreachable. Proceeding in Development Preview Mode.');
      setTimeout(() => navigate('/matrimony/considered-few'), 1000);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="A resonance" 
        subtitle="Character first, never a face" 
        onBack={() => navigate('/matrimony/considered-few')} 
      />

      {errorFallback && (
        <div className="mb-4 sk-fx sk-d1">
          <DevFallbackBadge message={errorFallback} />
        </div>
      )}

      <div className="sk-fx sk-d1 mt-4">
        <CandidatePortraitCard candidate={candidate} />
      </div>

      <div className="flex gap-[11px] mt-6 sk-fx sk-d2">
        <SakinahButton 
          variant="ghost" 
          disabled={isPending} 
          onClick={handleSilentPass}
          className="flex-1"
        >
          Not this one
        </SakinahButton>
        <SakinahButton 
          variant="primary" 
          disabled={isPending} 
          onClick={handleExpressInterest}
          className="flex-1"
        >
          Express interest
        </SakinahButton>
      </div>
    </SakinahJourneyFrame>
  );
};
