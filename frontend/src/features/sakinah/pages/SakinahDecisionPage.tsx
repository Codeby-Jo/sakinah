import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahHeader, 
  DevFallbackBadge, 
  SakinahButton,
  SakinahRayaOrb
} from '../components';
import { submitDecision } from '../services/sakinahApi';
import type { DecisionOutcome } from '../types/sakinah.types';

export const SakinahDecisionPage: React.FC = () => {
  const navigate = useNavigate();
  const { matchflowId } = useParams();
  const [isPending, setIsPending] = useState(false);
  const [errorFallback, setErrorFallback] = useState('');

  const handleDecision = async (decision: DecisionOutcome) => {
    setIsPending(true);
    setErrorFallback('');
    try {
      await submitDecision(matchflowId || 'mock', decision);
      navigate('/matrimony/considered-few');
    } catch (err) {
      console.warn('Backend offline, using dev fallback for submitDecision', err);
      setErrorFallback(`Backend unreachable. Dev Fallback: Decision '${decision}' processed.`);
      setTimeout(() => navigate('/matrimony/considered-few'), 1500);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="The decision" 
        subtitle="Phase 7 · guided by Raya" 
        onBack={() => window.history.back()} 
      />

      <div className="flex justify-center mt-6 mb-8 sk-fx sk-d1">
        <SakinahRayaOrb variant="hero" />
      </div>

      <div className="text-center mb-8 sk-fx sk-d2">
        <p className="text-[14px] font-light text-[var(--sk-ink-dim)] leading-[1.6]">
          You have completed the structured conversation. How would you like to proceed?
          <br /><br />
          Take your time. Make this choice with sincerity and intention. No one will pressure you.
        </p>
      </div>

      {errorFallback && (
        <div className="mb-4 sk-fx sk-d2">
          <DevFallbackBadge message={errorFallback} />
        </div>
      )}

      <div className="flex flex-col gap-4 mt-8 sk-fx sk-d3">
        <SakinahButton 
          variant="primary"
          onClick={() => handleDecision('PROCEED')}
          disabled={isPending}
        >
          PROCEED
        </SakinahButton>
        
        <SakinahButton 
          variant="secondary"
          onClick={() => handleDecision('PAUSE')} 
          disabled={isPending}
        >
          PAUSE
        </SakinahButton>

        <SakinahButton 
          variant="ghost"
          onClick={() => handleDecision('CLOSE')} 
          disabled={isPending}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          CLOSE
        </SakinahButton>
      </div>
      
      <div className="sk-insight mt-6 sk-fx sk-d4 border-none bg-transparent">
        Raya does not decide for you. True compatibility is found in your shared effort.
      </div>
    </SakinahJourneyFrame>
  );
};
