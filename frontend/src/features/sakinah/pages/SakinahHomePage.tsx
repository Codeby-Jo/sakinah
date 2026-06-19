import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReadinessHome } from '../services/sakinahApi';
import { 
  SakinahJourneyFrame, 
  SakinahJourneyStepper,
  SakinahMetaRow,
  SakinahButton,
  SakinahSupportCard
} from '../components';

export const SakinahHomePage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    getReadinessHome().catch(console.error);
  }, []);

  return (
    <SakinahJourneyFrame>

      <div className="flex items-center gap-[6px] mb-[24px] sk-fx sk-d1">
        <div className="font-serif text-[18px] text-[var(--sk-gold)]">۞</div>
        <div className="font-serif text-[14px] text-[var(--sk-ink-dim)]">Sakinah</div>
        <div className="text-[10px] uppercase tracking-[0.15em] text-[var(--sk-ink-faint)] ml-1">
          Shukr Mode · seeker lane
        </div>
      </div>

      <div className="font-serif text-[19px] text-[var(--sk-ink-dim)] leading-[1.35] mb-[22px] sk-fx sk-d1">
        السلام عليكم, <b className="font-medium text-[var(--sk-ink)]">Ayman</b> — your journey continues.
      </div>

      <div className="sk-fx sk-d2 mb-4">
        <SakinahMetaRow 
          stats={[
            { value: '4/7', label: 'PHASE' },
            { value: 'Sunni·Hanafi', label: 'TRADITION' },
            { value: 'Verified', label: 'IDENTITY' }
          ]} 
        />
      </div>

      <div className="sk-fx sk-d2">
        <SakinahJourneyStepper 
          title="Your journey to marriage"
          activeStep={4}
          steps={[
            {
              id: 'niyyah',
              phase: 'Phase 1',
              title: 'Niyyah · intention',
              description: 'Why marriage, why now',
              onClick: () => navigate('/matrimony/niyyah')
            },
            {
              id: 'values',
              phase: 'Phase 2',
              title: 'What you bring + tradition',
              description: 'Values & your maslak',
              onClick: () => navigate('/matrimony/values')
            },
            {
              id: 'mirror',
              phase: 'Phase 3',
              title: 'The Mirror',
              description: 'Character through 9 reflections',
              onClick: () => navigate('/matrimony/mirror')
            },
            {
              id: 'pool',
              phase: 'Phase 4 · now',
              title: 'Your considered few',
              description: 'A handful, curated',
              statusLabel: '● 4 to consider',
              onClick: () => navigate('/matrimony/considered-few')
            },
            {
              id: 'matchflow',
              phase: 'Phase 5',
              title: 'Match flow',
              description: 'A structured opening',
              onClick: () => navigate('/matrimony/matchflow/1') // Placeholder
            },
            {
              id: 'conversation',
              phase: 'Phase 6',
              title: 'Communication',
              description: 'Topic by topic, with family',
              onClick: () => navigate('/matrimony/conversation/1') // Placeholder
            },
            {
              id: 'decision',
              phase: 'Phase 7',
              title: 'The decision',
              description: 'Proceed, pause, or close',
              onClick: () => navigate('/matrimony/decision/1') // Placeholder
            }
          ]}
        />
      </div>

      <div className="sk-fx sk-d3 w-full mt-5">
        <SakinahButton variant="primary" onClick={() => navigate('/matrimony/considered-few')}>
          View your considered few →
        </SakinahButton>
      </div>

      <div className="text-[10px] tracking-[0.2em] uppercase text-center text-[var(--sk-ink-faint)] mt-[45px] mb-[20px] sk-fx sk-d4">
        Quietly in the background
      </div>

      <div className="sk-fx sk-d4 mb-[11px]">
        <SakinahSupportCard
          icon="⛨"
          title="Your safety & privacy"
          subtitle="Verified-only · watermarked · report anytime"
          variant="safe"
          onClick={() => navigate('/matrimony/safety')}
        />
      </div>

      <div className="sk-fx sk-d5 mb-[11px]">
        <SakinahSupportCard
          icon="◷"
          title="Community (optional)"
          subtitle="Belonging for its own sake — never scored"
          onClick={() => navigate('/matrimony/community')}
        />
      </div>

      <div className="sk-fx sk-d5 mb-[11px]">
        <SakinahSupportCard
          icon="﴾﴿"
          title="Vent Box"
          subtitle="A safe ear — never used in matching"
          variant="vent"
          onClick={() => navigate('/matrimony/vent')}
        />
      </div>

    </SakinahJourneyFrame>
  );
};
