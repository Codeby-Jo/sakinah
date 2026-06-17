import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahHeader, 
  MatchflowStepper, 
  DevFallbackBadge, 
  SakinahButton, 
  SakinahLoadingState 
} from '../components';
import { getMatchflow } from '../services/sakinahApi';
import type { MatchflowResponse, MatchflowStep } from '../types/sakinah.types';

export const SakinahMatchflowPage: React.FC = () => {
  const navigate = useNavigate();
  const { matchflowId } = useParams();
  const [matchflow, setMatchflow] = useState<MatchflowResponse | null>(null);
  const [isOfflineFallback, setIsOfflineFallback] = useState(false);

  useEffect(() => {
    if (matchflowId) {
      getMatchflow(matchflowId)
        .then(setMatchflow)
        .catch((err) => {
          console.warn('Backend offline, using dev fallback for SakinahMatchflow', err);
          setIsOfflineFallback(true);
          setMatchflow({
            matchflow_id: matchflowId,
            current_step: 'CONVERSATION_OPEN',
            steps: []
          });
        });
    }
  }, [matchflowId]);

  if (!matchflow) {
    return (
      <SakinahJourneyFrame>
        <SakinahLoadingState fullPage message="Loading journey details..." />
      </SakinahJourneyFrame>
    );
  }

  const isConversationOpen = matchflow.current_step === 'CONVERSATION_OPEN' || matchflow.current_step === 'DECISION_PENDING';

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Match flow" 
        subtitle="Phase 5 · a structured opening" 
        onBack={() => navigate('/matrimony/considered-few')} 
      />

      {isOfflineFallback && (
        <div className="mb-4 sk-fx sk-d1">
          <DevFallbackBadge message="Development Preview Mode: Backend unreachable. Proceeding with CONVERSATION_OPEN state." />
        </div>
      )}

      <div className="sk-conv-banner sk-fx sk-d1 mb-4">
        Interest is private. A decline is silent — never rejection. Only a mutual yes opens a conversation.
      </div>

      <div className="sk-fx sk-d2">
        <MatchflowStepper currentStep={matchflow.current_step as MatchflowStep} />
      </div>
      
      {isConversationOpen && (
        <div className="sk-fx sk-d3 mt-5">
          <SakinahButton 
            variant="primary"
            onClick={() => navigate('/matrimony/conversation/mock_conversation_1')}
          >
            Mutual yes — open conversation →
          </SakinahButton>
        </div>
      )}
    </SakinahJourneyFrame>
  );
};
