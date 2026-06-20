import React from 'react';

export interface StageItem {
  id: string;
  letter: string;
  name: string;
  description: string;
  isActive?: boolean;
}

export interface StageGroup {
  groupName: string;
  items: StageItem[];
}

interface SakinahStageRailProps {
  groups: StageGroup[];
  onSelect?: (id: string) => void;
}

export const SakinahStageRail: React.FC<SakinahStageRailProps> = ({ groups, onSelect }) => {
  return (
    <div className="w-full">
      <div className="font-serif text-[34px] font-medium leading-[1.02]">
        Sakinah<sup className="text-[0.5em] text-[var(--sk-gold)]">+</sup> <span className="opacity-60 text-lg align-middle">· Shukr Mode</span>
      </div>
      <div className="sk-font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--sk-gold)] mt-2">
        Dev Reference · Full Flow
      </div>
      <div className="font-serif italic text-[15px] text-[var(--sk-ink-dim)] leading-relaxed mt-4 pt-4 border-t border-[var(--sk-line-soft)]">
        From a Raya welcome to a dignified decision — every screen, with the why, the must-dos, and the lines we never cross.
      </div>

      <div className="border border-[var(--sk-line)] rounded-[16px] p-[18px] mt-[22px] bg-[linear-gradient(160deg,rgba(212,168,83,0.05),transparent)]">
        <h4 className="sk-font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--sk-gold)] mb-3 font-medium">
          The thesis we are building
        </h4>
        <p className="font-serif text-[18px] leading-[1.4] text-[var(--sk-ink)] font-normal">
          A matchmaking tool that begins with the <em className="italic text-[var(--sk-gold-soft)]">heart</em>, not a face. Raya hosts the journey; <em className="italic text-[var(--sk-gold-soft)]">compatibility is the byproduct</em> of becoming ready.
        </p>
      </div>

      <div className="mt-[26px]">
        <h4 className="sk-font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--sk-gold)] mb-3 font-medium">
          The flow — current progress
        </h4>
        
        <div>
          {groups.map((group, gIdx) => (
            <React.Fragment key={gIdx}>
              <div className="sk-st-group">{group.groupName}</div>
              {group.items.map((item) => (
                <div 
                  key={item.id} 
                  className={`sk-st-item ${item.isActive ? 'on' : ''}`}
                  onClick={() => onSelect?.(item.id)}
                >
                  <div className="lt">{item.letter}</div>
                  <div className="stx">
                    <div className="nm">{item.name}</div>
                    <div className="ds">{item.description}</div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
