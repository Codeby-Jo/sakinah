import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPortrait, updatePortrait } from '../services/sakinahApi';
import { 
  SakinahJourneyFrame, 
  SakinahPortraitCard,
  SakinahButton
} from '../components';

export const SakinahPortraitPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    getPortrait().then(async res => {
      if (!res.is_complete) {
        await updatePortrait({
          portrait_data: {
            auraChar: "ع",
            quote: "Someone who finds steadiness in routine, gives quietly, and is learning to let people in.",
            signals: [
              { name: 'Steadiness under pressure', value: 'High', percentage: 82 },
              { name: 'Quiet generosity', value: 'High', percentage: 78 },
              { name: 'Emotional openness', value: 'Growing', percentage: 48 },
              { name: 'Family orientation', value: 'Deep', percentage: 88 },
            ]
          }
        });
      }
    }).catch(console.error);
  }, []);

  return (
    <SakinahJourneyFrame>
      <div className="flex items-center gap-[11px] mb-[18px]">
        <button className="sk-back" onClick={() => navigate('/matrimony/home')}>‹</button>
        <div>
          <div className="font-serif text-[24px] text-[var(--sk-gold)] leading-[1.1]">Your portrait</div>
          <div className="text-[12px] text-[var(--sk-ink-faint)] tracking-[0.02em] mt-1">Drawn from your reflections</div>
        </div>
      </div>

      <SakinahPortraitCard
        className="sk-fx sk-d1"
        auraChar="ع"
        quote="Someone who finds steadiness in routine, gives quietly, and is learning to let people in."
        signalsTitle="What your gratitude reveals"
        signals={[
          { name: 'Steadiness under pressure', value: 'High', percentage: 82 },
          { name: 'Quiet generosity', value: 'High', percentage: 78 },
          { name: 'Emotional openness', value: 'Growing', percentage: 48 },
          { name: 'Family orientation', value: 'Deep', percentage: 88 },
        ]}
      />

      <div className="sk-insight sk-fx sk-d3 mt-5">
        No raw answer is shown to anyone — only soft, derived resonance, after mutual interest. Standing comes from <b className="text-[var(--sk-ink)]">verification</b>, not displayed worship. 
        <br/><br/>
        This portrait is <b className="text-[var(--sk-ink)] font-medium">private to you</b>. It is not a public score, and not a spiritual ranking.
      </div>

      <div className="sk-fx sk-d4 mt-5">
        <SakinahButton variant="primary" onClick={() => navigate('/matrimony/preferences')}>
          Continue to preferences →
        </SakinahButton>
      </div>
    </SakinahJourneyFrame>
  );
};
