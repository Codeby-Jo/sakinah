import React from 'react';
import type { CandidateSummary } from '../types/sakinah.types';

interface CandidatePortraitCardProps {
  candidate: CandidateSummary;
  className?: string;
}

export const CandidatePortraitCard: React.FC<CandidatePortraitCardProps> = ({ candidate, className = '' }) => {
  const auraChar = candidate.displayName.charAt(0) || 'ع';

  return (
    <div className={`sk-cand-card ${className}`}>
      <div className="cand-aura font-serif">{auraChar}</div>
      <div className="cand-name font-serif">{candidate.displayName} · {candidate.age}</div>
      <div className="cand-meta">{candidate.location} · {candidate.sect} · Verified · Wali linked</div>
      
      <div className="sk-resonance">
        <div className="res">
          <span className="tk"></span>Shared intention: <b className="font-medium text-[var(--sk-gold)]">a home of calm and worship</b>
        </div>
        <div className="res">
          <span className="tk"></span>You both bring <b className="font-medium text-[var(--sk-gold)]">steadiness</b>, value <b className="font-medium text-[var(--sk-gold)]">quiet generosity</b>
        </div>
        <div className="res">
          <span className="tk"></span>Both <b className="font-medium text-[var(--sk-gold)]">learning to let people in</b>
        </div>
        <div className="res">
          <span className="tk"></span>Same tradition — <b className="font-medium text-[var(--sk-gold)]">{candidate.sect}</b>
        </div>
      </div>
      
      <div className="sk-no-face">
        Her face isn't shown — neither is yours. A photo is exchanged only if you both continue, with family aware.
      </div>
    </div>
  );
};
