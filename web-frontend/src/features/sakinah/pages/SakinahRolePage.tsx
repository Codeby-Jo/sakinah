import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SakinahJourneyFrame, SakinahLaneCard } from '../components';

export const SakinahRolePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SakinahJourneyFrame>
      <div className="text-center pt-[18px] pb-[8px] sk-fx sk-d1">
        <div className="font-serif text-[40px] text-[var(--sk-gold)]">۞</div>
        <div className="font-serif text-[26px] mt-1 tracking-[1px]">Sakinah</div>
        <div className="text-[10px] tracking-[0.4em] uppercase text-[var(--sk-ink-faint)] mt-[5px]">
          Shukr Mode · the path to nikah
        </div>
      </div>

      <div className="text-center font-serif italic text-[19px] text-[var(--sk-ink-dim)] my-[6px] mb-[18px] sk-fx sk-d2">
        "Who are you here as?"
      </div>

      <div className="sk-fx sk-d2">
        <SakinahLaneCard
          icon="ع"
          title="I'm seeking"
          description="Walk the journey yourself — at your pace, with Raya beside you the whole way."
          onClick={() => navigate('/sakinah/primer')}
        />
      </div>

      <div className="sk-fx sk-d3">
        <SakinahLaneCard
          icon="۩"
          title="I'm a wali / family"
          description="Help someone you love — steward alongside them. The decision stays theirs."
          onClick={() => navigate('/sakinah/primer')}
        />
      </div>
    </SakinahJourneyFrame>
  );
};
