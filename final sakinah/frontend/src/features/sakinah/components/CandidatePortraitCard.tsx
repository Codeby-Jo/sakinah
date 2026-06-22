import React from 'react';
import type { CandidateSummary } from '../types/sakinah.types';

interface CandidatePortraitCardProps {
  candidate: CandidateSummary;
  className?: string;
}

export const CandidatePortraitCard: React.FC<CandidatePortraitCardProps> = ({ candidate, className = '' }) => {
  const auraChar = candidate.displayName.charAt(0) || 'ع';
  const hasPhoto = !!candidate.photoUrl;

  return (
    <div className={`sk-cand-card relative overflow-hidden ${className}`}>
      {/* Blurred background if locked, or clear if mutual */}
      {hasPhoto && (
        <div className="absolute inset-0 z-0">
          <img 
            src={candidate.photoUrl} 
            alt="Profile" 
            className={`w-full h-full object-cover transition-all duration-1000 ${!candidate.mutualInterest ? 'blur-2xl opacity-20 scale-110' : 'opacity-40'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D1A] via-[#0A0D1A]/80 to-[#0A0D1A]/30"></div>
        </div>
      )}
      
      <div className="relative z-10 flex flex-col items-center">
        {hasPhoto ? (
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[var(--sk-gold)] shadow-[0_0_30px_rgba(212,168,83,0.3)] mb-4 relative group">
            <img 
              src={candidate.photoUrl} 
              alt="Profile" 
              className={`w-full h-full object-cover transition-all duration-700 ${!candidate.mutualInterest ? 'blur-md scale-110' : 'scale-100 hover:scale-110'}`}
            />
            {!candidate.mutualInterest && (
              <div className="absolute inset-0 bg-[#0A0E16]/60 flex flex-col items-center justify-center">
                <span className="text-[28px] text-[var(--sk-gold)] drop-shadow-lg mb-1">🔐</span>
                <span className="text-[8px] font-bold text-white uppercase tracking-wider bg-black/50 px-2 py-0.5 rounded-full">Locked</span>
              </div>
            )}
          </div>
        ) : (
          <div className="cand-aura font-serif">{auraChar}</div>
        )}
        
        <div className="cand-name font-serif text-center mt-2">{candidate.displayName} · {candidate.age}</div>
        <div className="cand-meta text-center">{candidate.location} · {candidate.sect} · Verified · Wali linked</div>
      </div>
      
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
