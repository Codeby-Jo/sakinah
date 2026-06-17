import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahRayaOrb, 
  SakinahButton 
} from '../components';

export const SakinahEntryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SakinahJourneyFrame>
      <div className="flex flex-col items-center justify-center text-center px-[30px] h-full min-h-[70vh]">
        <SakinahRayaOrb variant="hero" className="sk-fx sk-d1" />
        
        <div className="sk-font-mono text-[10px] tracking-[0.32em] uppercase text-[var(--sk-gold-dim)] mb-[14px] sk-fx sk-d2">
          Raya · your companion
        </div>
        
        <div className="font-serif text-[17px] text-[var(--sk-gold-soft)] mb-[18px] sk-fx sk-d2">
          السلام عليكم
        </div>
        
        <div className="font-serif text-[25px] leading-[1.35] text-[var(--sk-ink)] font-normal sk-fx sk-d3">
          I'm Raya. Looking for a spouse can feel like being <em className="italic text-[var(--sk-gold-soft)]">measured</em> — endlessly. Here, we don't start with a photo, or a checklist.
        </div>
        
        <div className="font-serif text-[19px] leading-[1.35] text-[var(--sk-ink-dim)] font-normal mt-[18px] sk-fx sk-d4 mb-[40px]">
          We start with <em className="italic text-[var(--sk-gold-soft)]">you</em>. Whenever you're ready.
        </div>
        
        <div className="sk-fx sk-d5 w-full max-w-[280px]">
          <SakinahButton variant="primary" onClick={() => navigate('/matrimony/role')}>
            Begin gently →
          </SakinahButton>
        </div>
      </div>
    </SakinahJourneyFrame>
  );
};
