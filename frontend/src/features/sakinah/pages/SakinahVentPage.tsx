import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahHeader,
  SakinahButton,
  SakinahTextarea,
  DevFallbackBadge
} from '../components';

export const SakinahVentPage: React.FC = () => {
  const navigate = useNavigate();
  const [ventText, setVentText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ventText.trim()) return;
    
    // In v1, this is purely a frontend interaction for emotional release.
    // It is never sent to the matching algorithm or exposed to anyone.
    setIsSubmitted(true);
    setVentText('');
  };

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Vent Box" 
        subtitle="A SAFE EAR" 
        onBack={() => navigate('/matrimony/home')} 
      />

      <div className="mb-4 sk-fx sk-d1 mt-4">
        <DevFallbackBadge message="Development Preview Mode: Private frontend-only journaling." />
      </div>

      <div className="text-center mb-6 sk-fx sk-d1">
        <div className="font-serif text-[42px] text-[var(--sk-gold)] mb-3 opacity-80">﴾﴿</div>
        <p className="text-[14px] text-[var(--sk-ink-dim)] font-light leading-[1.6]">
          The journey to marriage can be overwhelming, frustrating, or lonely. Write it out here.
        </p>
      </div>

      {!isSubmitted ? (
        <form className="sk-fx sk-d2" onSubmit={handleSubmit}>
          <SakinahTextarea
            value={ventText}
            onChange={(e) => setVentText(e.target.value)}
            rows={6}
            placeholder="What is weighing heavily on you today?"
            className="mb-4 text-[13px] font-light leading-[1.7]"
          />
          <div className="flex justify-end">
            <SakinahButton 
              type="submit" 
              variant="secondary"
              disabled={!ventText.trim()}
            >
              Release
            </SakinahButton>
          </div>
        </form>
      ) : (
        <div className="bg-[rgba(212,168,83,0.03)] border border-[rgba(212,168,83,0.15)] rounded-[13px] p-[24px] text-center sk-fx sk-d2">
          <p className="text-[14px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-4">
            Your words have been released. They are held in confidence and are never used to score or match you.
          </p>
          <SakinahButton variant="ghost" onClick={() => setIsSubmitted(false)}>
            Write another
          </SakinahButton>
        </div>
      )}

      <div className="sk-insight sk-fx sk-d3 mt-8 border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-center">
        <b className="text-[var(--sk-ink)]">This is for you alone.</b> What you write here never touches your matchmaking profile, is never read by others, and cannot affect your compatibility.
      </div>
    </SakinahJourneyFrame>
  );
};
