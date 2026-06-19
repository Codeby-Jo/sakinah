import React from 'react';
import type { CandidateSummary } from '../types/sakinah.types';

interface ConsideredFewListProps {
  candidates: CandidateSummary[];
  onSelectCandidate: (id: string) => void;
  className?: string;
}

export const ConsideredFewList: React.FC<ConsideredFewListProps> = ({ candidates, onSelectCandidate, className = '' }) => {
  if (candidates.length === 0) return null;

  return (
    <div className={`space-y-[11px] ${className}`}>
      {candidates.map((cand, i) => {
        // Fallback or derive a single letter aura character from name
        const auraChar = cand.displayName.charAt(0) || 'ع';
        
        return (
          <div 
            key={cand.candidateId}
            className={`sk-pool-card sk-fx sk-d${Math.min(i + 2, 5)}`}
            onClick={() => onSelectCandidate(cand.candidateId)}
          >
            <div className="pool-aura font-serif">{auraChar}</div>
            <div className="tx">
              <b className="font-serif">{cand.displayName} · {cand.age}</b>
              <div className="mt">{cand.location} · {cand.sect} · Verified</div>
              <div className="rz font-light italic">{cand.profession}</div>
            </div>
            <div className="arr font-serif text-[24px]">›</div>
          </div>
        );
      })}
    </div>
  );
};
