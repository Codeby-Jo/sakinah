import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SakinahJourneyFrame, SakinahHeader, SakinahNotice, SakinahButton } from '../components';

export const SakinahPrimerPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Before we begin" 
        subtitle="What this journey is — and isn't" 
        onBack={() => navigate(-1)} 
      />

      <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-[14px] sk-fx sk-d1">
        Take a breath. A few honest reflections, at your pace — not a form to rush.
      </p>

      <div className="sk-fx sk-d2">
        <SakinahNotice
          icon="☉"
          title="Never a blank page"
          message="Raya guides every step. You only write if you want to."
        />
      </div>
      <div className="sk-fx sk-d2">
        <SakinahNotice
          icon="◷"
          title="Go at your pace"
          message="Pause and return anytime. Progress is saved."
        />
      </div>
      <div className="sk-fx sk-d3">
        <SakinahNotice
          icon="⌥"
          title="Speak, don't type"
          message="Urdu, Hindi, Tamil, English — Raya listens."
        />
      </div>
      <div className="sk-fx sk-d3">
        <SakinahNotice
          icon="✓"
          title="No wrong answers"
          message="A mirror, not a test."
        />
      </div>

      <div className="sk-fx sk-d4 mt-4">
        <SakinahButton variant="primary" onClick={() => navigate('/matrimony/kyc')}>
          I'm ready — verify first →
        </SakinahButton>
      </div>
    </SakinahJourneyFrame>
  );
};
