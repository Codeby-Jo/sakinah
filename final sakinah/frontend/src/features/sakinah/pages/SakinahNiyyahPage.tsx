import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNiyyah, updateNiyyah } from '../services/sakinahApi';
import { 
  SakinahJourneyFrame, 
  SakinahHeader, 
  SakinahButton,
  SakinahChoiceChip
} from '../components';

export const SakinahNiyyahPage: React.FC = () => {
  const navigate = useNavigate();
  const [whyNow, setWhyNow] = useState<string>('ready');
  const [season, setSeason] = useState<string>('building');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getNiyyah().then(res => {
      if (res.intention_text) {
        try {
          const data = JSON.parse(res.intention_text);
          setWhyNow(data.whyNow || 'ready');
          setSeason(data.season || 'building');
        } catch {}
      }
    }).catch(console.error);
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await updateNiyyah({ intention_text: JSON.stringify({ whyNow, season }) });
      navigate('/matrimony/values');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Niyyah" 
        subtitle="Phase 1 · intention · guided by Raya" 
        onBack={() => navigate('/matrimony/home')} 
      />

      <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-[14px] text-center sk-fx sk-d1 mt-4">
        Before anyone else, we speak of you. No wrong answers — and Raya is right there if you're unsure.
      </p>

      <div className="sk-reflect sk-fx sk-d2 mb-5">
        <div className="q">"Why marriage, and why now?"</div>
        <div className="flex flex-col gap-[7px] mt-2">
          <SakinahChoiceChip 
            label="To build a home of calm and worship together" 
            selected={whyNow === 'worship'} 
            onClick={() => setWhyNow('worship')} 
          />
          <SakinahChoiceChip 
            label="I feel ready to grow alongside someone" 
            selected={whyNow === 'ready'} 
            onClick={() => setWhyNow('ready')} 
          />
          <SakinahChoiceChip 
            label="Family is encouraging me, and I'm open" 
            selected={whyNow === 'family'} 
            onClick={() => setWhyNow('family')} 
          />
        </div>
      </div>

      <div className="sk-reflect sk-fx sk-d3 mb-5">
        <div className="q">"What season of life are you in?"</div>
        <div className="flex flex-col gap-[7px] mt-2">
          <SakinahChoiceChip 
            label="Building — career, deen, and self" 
            selected={season === 'building'} 
            onClick={() => setSeason('building')} 
          />
          <SakinahChoiceChip 
            label="Settled and steady — ready to share it" 
            selected={season === 'settled'} 
            onClick={() => setSeason('settled')} 
          />
          <SakinahChoiceChip 
            label="A fresh start after a hard chapter" 
            selected={season === 'fresh_start'} 
            onClick={() => setSeason('fresh_start')} 
          />
        </div>
      </div>

      <div className="sk-fx sk-d4 mt-4">
        <SakinahButton variant="primary" onClick={handleContinue} disabled={loading}>
          {loading ? 'Saving...' : 'Continue →'}
        </SakinahButton>
      </div>
    </SakinahJourneyFrame>
  );
};
