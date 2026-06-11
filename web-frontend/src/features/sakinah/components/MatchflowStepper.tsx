import React from 'react';
import type { MatchflowStep } from '../types/sakinah.types';

interface MatchflowStepperProps {
  currentStep: MatchflowStep;
  candidateName?: string;
  className?: string;
}

export const MatchflowStepper: React.FC<MatchflowStepperProps> = ({ currentStep, candidateName = 'them', className = '' }) => {
  let activeIndex = 0;
  switch (currentStep) {
    case 'VIEWING_CANDIDATE':
      activeIndex = 2; // "Mutual interest" pending
      break;
    case 'MUTUAL_INTEREST_PENDING':
      activeIndex = 2;
      break;
    case 'CONVERSATION_OPEN':
      activeIndex = 3; // Or 4/5 depending on progress, we'll map to 3 for now
      break;
    case 'DECISION_PENDING':
      activeIndex = 5;
      break;
    default:
      activeIndex = 2;
  }

  const steps = [
    { num: '٠', title: 'Both profiles complete', desc: 'Intentions, values, tradition, character & verified identity.' },
    { num: '١', title: 'Compatibility identified', desc: 'Curated from values, conduct & shared tradition — never searched.' },
    { num: '٢', title: 'Mutual interest', desc: `You expressed interest. Awaiting ${candidateName} — a silent decline stays dignified.` },
    { num: '٣', title: 'Structured opening', desc: 'Raya frames the first exchange — no blank chat box.' },
    { num: '٤', title: 'Family / wali invited', desc: 'Either may bring a wali — configurable, women-centric.' },
    { num: '٥', title: 'Supervised depth → decision', desc: 'The eight pre-nikah topics open progressively.' },
  ];

  return (
    <div className={`sk-card p-[16px] ${className}`}>
      {steps.map((step, index) => {
        const isDone = index < activeIndex;
        const isCur = index === activeIndex;
        let itemClass = 'mf';
        if (isDone) itemClass += ' done';
        if (isCur) itemClass += ' cur';

        return (
          <div key={index} className={itemClass}>
            <div className="mn">{step.num}</div>
            <div>
              <b>{step.title}</b>
              <p>{step.desc}</p>
              {isCur && <span className="cur-tag">● you are here</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
