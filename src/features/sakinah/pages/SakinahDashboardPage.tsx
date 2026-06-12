import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SakinahJourneyFrame, SakinahHeader } from '../components';

export const SakinahDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Dashboard" 
        subtitle="Your Matrimony Journey" 
        onBack={() => navigate('/sakinah/preferences')} 
      />

      <div className="flex flex-col gap-[14px] sk-fx sk-d2 pb-8 mt-4">
        
        {/* Profile Completion */}
        <div className="sk-card gold-edge p-[20px]">
          <h3 className="text-[18px] text-[var(--sk-gold)] mb-1">Profile Completion</h3>
          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[6px] rounded-full my-3 overflow-hidden">
            <div className="h-full bg-[var(--sk-green)] w-full" />
          </div>
          <p className="text-[12px] text-[var(--sk-ink-dim)]">Your profile is 100% complete and visible to matching algorithms.</p>
        </div>

        {/* Recommended Matches */}
        <div className="sk-card p-[20px]">
          <h3 className="text-[18px] text-[var(--sk-gold)] mb-3">Recommended Matches</h3>
          <div className="flex flex-col gap-3">
            <div className="sk-pool-card" onClick={() => navigate('/sakinah/candidate/match_1')}>
              <div className="pool-aura">A</div>
              <div className="tx">
                <b>Aisha</b>
                <div className="mt">85% Match · Software Engineer</div>
                <div className="rz">Aligned on: Religion, Family Values</div>
              </div>
              <div className="arr">→</div>
            </div>
            <button 
              onClick={() => navigate('/sakinah/considered-few')}
              className="w-full text-center py-2 text-[13px] text-[var(--sk-gold-soft)] hover:text-[var(--sk-gold)] transition-colors"
            >
              View All Recommendations
            </button>
          </div>
        </div>

        {/* Messages & Interests */}
        <div className="grid grid-cols-2 gap-[14px]">
          <div className="sk-card p-[20px] flex flex-col items-center text-center cursor-pointer hover:border-[var(--sk-gold)] transition-colors" onClick={() => navigate('/sakinah/matchflow')}>
            <div className="text-[24px] mb-2 text-[var(--sk-gold)]">✉</div>
            <h3 className="text-[15px] text-[var(--sk-ink)]">Messages</h3>
            <span className="text-[12px] text-[var(--sk-green)] mt-1">2 New</span>
          </div>
          <div className="sk-card p-[20px] flex flex-col items-center text-center cursor-pointer hover:border-[var(--sk-gold)] transition-colors" onClick={() => navigate('/sakinah/considered-few')}>
            <div className="text-[24px] mb-2 text-[var(--sk-gold)]">♥</div>
            <h3 className="text-[15px] text-[var(--sk-ink)]">New Interests</h3>
            <span className="text-[12px] text-[var(--sk-ink-dim)] mt-1">No new</span>
          </div>
        </div>

        {/* Saved Profiles & Notifications */}
        <div className="grid grid-cols-2 gap-[14px]">
          <div className="sk-card p-[20px] flex flex-col items-center text-center cursor-pointer hover:border-[var(--sk-gold)] transition-colors">
            <div className="text-[24px] mb-2 text-[var(--sk-gold)]">★</div>
            <h3 className="text-[15px] text-[var(--sk-ink)]">Saved Profiles</h3>
            <span className="text-[12px] text-[var(--sk-ink-dim)] mt-1">3 Saved</span>
          </div>
          <div className="sk-card p-[20px] flex flex-col items-center text-center cursor-pointer hover:border-[var(--sk-gold)] transition-colors">
            <div className="text-[24px] mb-2 text-[var(--sk-gold)]">🔔</div>
            <h3 className="text-[15px] text-[var(--sk-ink)]">Notifications</h3>
            <span className="text-[12px] text-[var(--sk-ink-dim)] mt-1">1 Update</span>
          </div>
        </div>

      </div>
    </SakinahJourneyFrame>
  );
};
