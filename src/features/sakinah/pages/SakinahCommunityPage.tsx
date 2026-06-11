import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SakinahJourneyFrame, 
  SakinahHeader,
  SakinahButton
} from '../components';

export const SakinahCommunityPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Community" 
        subtitle="BELONGING FOR ITS OWN SAKE" 
        onBack={() => navigate('/sakinah/home')} 
      />

      <div className="bg-[rgba(212,168,83,0.02)] border border-[rgba(212,168,83,0.15)] rounded-[13px] p-[24px] text-center mb-6 sk-fx sk-d1 mt-4">
        <div className="font-serif text-[42px] text-[var(--sk-green)] mb-3 opacity-80">◷</div>
        <h2 className="font-serif text-[24px] text-[var(--sk-gold)] mb-3">A place of calm</h2>
        <p className="text-[14px] text-[var(--sk-ink-dim)] font-light leading-[1.6]">
          Finding a spouse is only one part of the journey. We believe in community for its own sake—a place to learn, reflect, and support one another without the pressure of a matching algorithm.
        </p>
      </div>

      <div className="sk-insight sk-fx sk-d2 mb-6 border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
        <b className="text-[var(--sk-ink)]">Community participation is entirely optional.</b> It never feeds into your matchmaking profile, it creates no "leaderboard", and there is no public scoring of your worship or gratitude. It is simply a safe space.
      </div>

      <div className="sk-fx sk-d3 text-center">
        <p className="text-[13px] text-[var(--sk-ink-faint)] font-light mb-4">
          Community features are currently being curated for the next phase.
        </p>
        <SakinahButton variant="secondary" onClick={() => navigate('/sakinah/home')}>
          Return to your journey
        </SakinahButton>
      </div>
    </SakinahJourneyFrame>
  );
};
