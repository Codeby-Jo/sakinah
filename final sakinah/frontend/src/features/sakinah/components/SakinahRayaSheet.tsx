import React, { useState } from 'react';

export interface HelpChip {
  id: string;
  icon: string;
  label: string;
  replyText: string | React.ReactNode;
}

interface SakinahRayaSheetProps {
  isOpen: boolean;
  onClose: () => void;
  introText?: string;
  chips: HelpChip[];
}

export const SakinahRayaSheet: React.FC<SakinahRayaSheetProps> = ({
  isOpen,
  onClose,
  introText = "Salaam. Stuck, unsure how to say something, want to speak instead, or just need a moment — I'm here. Nothing here you have to figure out alone.",
  chips
}) => {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const handleChipClick = (id: string) => {
    setActiveReplyId(prev => prev === id ? null : id);
  };

  return (
    <>
      <div 
        className={`sk-scrim ${isOpen ? 'show' : ''}`} 
        onClick={onClose} 
      />
      <div className={`sk-raya-sheet ${isOpen ? 'show' : ''}`}>
        <div className="sk-sheet-grab" />
        <div className="flex items-center gap-[11px] mb-[12px]">
          <div className="w-[40px] h-[40px] rounded-full bg-[radial-gradient(circle_at_38%_32%,#f0d28f,#cf9f44_70%)] flex items-center justify-center font-serif text-[19px] text-[#3a2c0c] shrink-0">
            ر
          </div>
          <div>
            <b className="font-serif text-[20px] font-medium block">Raya</b>
            <span className="text-[10px] text-[var(--sk-green)] tracking-[0.04em]">● always here to help</span>
          </div>
        </div>
        <div className="text-[12.5px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-[14px]">
          {introText}
        </div>
        
        <div>
          {chips.map(chip => (
            <React.Fragment key={chip.id}>
              <div 
                className="border border-[var(--sk-line-soft)] rounded-[13px] p-[12px_14px] mb-[8px] text-[12.5px] cursor-pointer transition-colors flex items-center gap-[11px] text-[var(--sk-ink)] hover:border-[var(--sk-gold)] hover:bg-[rgba(212,168,83,0.05)]"
                onClick={() => handleChipClick(chip.id)}
              >
                <span className="font-serif text-[var(--sk-gold)] text-[16px]">{chip.icon}</span>
                {chip.label}
              </div>
              <div className={`text-[12.5px] text-[var(--sk-ink)] font-light leading-[1.6] border-l-2 border-[var(--sk-gold)] py-1 pl-[13px] my-[6px] mb-[14px] ${activeReplyId === chip.id ? 'block animate-[sk-rise_0.4s]' : 'hidden'}`}>
                {chip.replyText}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};
