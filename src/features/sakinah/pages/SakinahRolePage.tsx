import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SakinahJourneyFrame, SakinahLaneCard } from '../components';

export const SakinahRolePage: React.FC = () => {
  const navigate = useNavigate();
  const [isWaliExpanded, setIsWaliExpanded] = useState(false);

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
          onClick={() => setIsWaliExpanded(!isWaliExpanded)}
        />
        
        {isWaliExpanded && (
          <div className="mt-[-4px] mb-[13px] ml-[24px] pl-[20px] border-l-2 border-[var(--sk-line)] flex flex-col gap-3 animate-in slide-in-from-top-2 duration-300">
            <button
              onClick={() => navigate('/login')}
              className="text-left w-full p-4 rounded-xl border border-[var(--sk-line-soft)] hover:border-[var(--sk-gold)] bg-[rgba(255,255,255,0.012)] hover:bg-[rgba(212,168,83,0.04)] transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-serif text-[18px] text-[var(--sk-ink)] group-hover:text-[var(--sk-gold)] transition-colors">Login</div>
                <div className="text-[12px] text-[var(--sk-ink-dim)] font-light mt-1">Access your existing account</div>
              </div>
              <div className="text-[var(--sk-ink-faint)] group-hover:text-[var(--sk-gold)]">→</div>
            </button>
            <button
              onClick={() => navigate('/sakinah/primer')}
              className="text-left w-full p-4 rounded-xl border border-[var(--sk-line-soft)] hover:border-[var(--sk-gold)] bg-[rgba(255,255,255,0.012)] hover:bg-[rgba(212,168,83,0.04)] transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-serif text-[18px] text-[var(--sk-ink)] group-hover:text-[var(--sk-gold)] transition-colors">Find for Someone</div>
                <div className="text-[12px] text-[var(--sk-ink-dim)] font-light mt-1">Start a new journey for your loved one</div>
              </div>
              <div className="text-[var(--sk-ink-faint)] group-hover:text-[var(--sk-gold)]">→</div>
            </button>
          </div>
        )}
      </div>
    </SakinahJourneyFrame>
  );
};
