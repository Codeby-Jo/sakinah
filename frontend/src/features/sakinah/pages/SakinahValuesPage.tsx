import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getValues, updateValues } from '../services/sakinahApi';
import { 
  SakinahJourneyFrame, 
  SakinahHeader, 
  SakinahButton,
  SakinahChoiceChip,
  SakinahSpectrumChoice
} from '../components';

export const SakinahValuesPage: React.FC = () => {
  const navigate = useNavigate();
  const [value, setValue] = useState<string>('steadiness');
  const [tradition, setTradition] = useState<string>('sunni_hanafi');
  const [flexibility, setFlexibility] = useState<string>('must_share');
  const [stage, setStage] = useState<string>('never_married');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getValues().then(res => {
      if (res.values_data && Object.keys(res.values_data).length > 0) {
        setValue(res.values_data.value || 'steadiness');
        setTradition(res.values_data.tradition || 'sunni_hanafi');
        setFlexibility(res.values_data.flexibility || 'must_share');
        setStage(res.values_data.stage || 'never_married');
      }
    }).catch(console.error);
  }, []);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await updateValues({ values_data: { value, tradition, flexibility, stage } });
      navigate('/matrimony/mirror');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="What you bring" 
        subtitle="Phase 2 · values & tradition" 
        onBack={() => navigate('/matrimony/niyyah')} 
      />

      <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-[14px] text-center sk-fx sk-d1 mt-4">
        We ask first what <em className="italic text-[var(--sk-gold-soft)]">you</em> bring — and who you are — so we find someone who shares your understanding of the deen.
      </p>

      <div className="sk-reflect sk-fx sk-d2 mb-5">
        <div className="q">"The value I most want to bring…"</div>
        <div className="flex flex-col gap-[7px] mt-2">
          <SakinahChoiceChip 
            label="Steadiness — a calm, reliable presence" 
            selected={value === 'steadiness'} 
            onClick={() => setValue('steadiness')} 
          />
          <SakinahChoiceChip 
            label="Generosity — giving without keeping score" 
            selected={value === 'generosity'} 
            onClick={() => setValue('generosity')} 
          />
          <SakinahChoiceChip 
            label="Patience — slow to anger, quick to repair" 
            selected={value === 'patience'} 
            onClick={() => setValue('patience')} 
          />
        </div>
      </div>

      <div className="sk-reflect sk-fx sk-d3 mb-5">
        <div className="q">"Your tradition of practice"</div>
        <p className="text-[11px] text-[var(--sk-ink-faint)] font-light -mt-1.5 mb-[11px]">
          You describe your own. We never ask you to exclude anyone else's.
        </p>
        <div className="flex flex-col gap-[7px]">
          <SakinahChoiceChip 
            label="Sunni — Hanafi" 
            selected={tradition === 'sunni_hanafi'} 
            onClick={() => setTradition('sunni_hanafi')} 
          />
          <SakinahChoiceChip 
            label="Sunni — Shafi'i / Maliki / Hanbali" 
            selected={tradition === 'sunni_other'} 
            onClick={() => setTradition('sunni_other')} 
          />
          <SakinahChoiceChip 
            label="Shia" 
            selected={tradition === 'shia'} 
            onClick={() => setTradition('shia')} 
          />
          <SakinahChoiceChip 
            label="Just Muslim — I don't label it" 
            selected={tradition === 'just_muslim'} 
            onClick={() => setTradition('just_muslim')} 
          />
        </div>
      </div>

      <div className="sk-reflect sk-fx sk-d4 mb-5">
        <div className="q">"How much should a match share it?"</div>
        <SakinahSpectrumChoice
          segments={[
            { id: 'must_share', label: 'Must share', description: 'Same tradition' },
            { id: 'open_within', label: 'Open within', description: 'My school' },
            { id: 'open_all', label: 'Open to all', description: 'Anyone who prays' }
          ]}
          selectedId={flexibility}
          onChange={setFlexibility}
        />
        <div className="sk-gentle-note mt-3">
          No one is ever told they were filtered out for who they are. Circles that don't overlap simply never meet — gently.
        </div>
      </div>

      <div className="sk-reflect sk-fx sk-d5 mb-5">
        <div className="q">"Where are you in life?"</div>
        <div className="flex flex-col gap-[7px] mt-2">
          <SakinahChoiceChip 
            label="Never married" 
            selected={stage === 'never_married'} 
            onClick={() => setStage('never_married')} 
          />
          <SakinahChoiceChip 
            label="Divorced — open to a new beginning" 
            selected={stage === 'divorced'} 
            onClick={() => setStage('divorced')} 
          />
          <SakinahChoiceChip 
            label="Widowed" 
            selected={stage === 'widowed'} 
            onClick={() => setStage('widowed')} 
          />
        </div>
      </div>

      <div className="sk-fx sk-d6 mt-4">
        <SakinahButton variant="primary" onClick={handleContinue} disabled={loading}>
          {loading ? 'Saving...' : 'Continue to the Mirror →'}
        </SakinahButton>
      </div>
    </SakinahJourneyFrame>
  );
};
