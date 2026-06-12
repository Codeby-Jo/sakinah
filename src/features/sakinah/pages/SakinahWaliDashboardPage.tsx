import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SakinahJourneyFrame, SakinahHeader } from '../components';

export const SakinahWaliDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <SakinahJourneyFrame>
      <SakinahHeader 
        title="Wali Dashboard" 
        subtitle="Stewardship & Support" 
        onBack={() => navigate('/login')} 
      />

      <p className="text-[13px] text-[var(--sk-ink-dim)] font-light leading-[1.6] mb-[24px] text-center sk-fx sk-d1">
        Welcome to your dashboard. Here you can interpret ongoing conversations, review candidate profiles, and provide guidance. The decision always remains with the seeker.
      </p>

      <div className="flex flex-col gap-[14px] sk-fx sk-d2">
        <div className="sk-card gold-edge p-[20px]">
          <h3 className="text-[18px] text-[var(--sk-gold)] mb-1">Active Conversations</h3>
          <p className="text-[12px] text-[var(--sk-ink-dim)] mb-4">View and interpret the ongoing dialogue between the seeker and their matches.</p>
          
          <div className="flex flex-col gap-3">
            <div 
              className="sk-pool-card"
              onClick={() => navigate('/sakinah/conversation/mock_conversation_1')}
            >
              <div className="pool-aura">M</div>
              <div className="tx">
                <b>Mohammad</b>
                <div className="mt">Topic: Life Goals & Values</div>
                <div className="rz">Last message: 2 hours ago</div>
              </div>
              <div className="arr">→</div>
            </div>
          </div>
        </div>

        <div className="sk-card p-[20px]">
          <h3 className="text-[18px] text-[var(--sk-gold)] mb-1">Considered Matches</h3>
          <p className="text-[12px] text-[var(--sk-ink-dim)] mb-4">Review profiles that align with your seeker's preferences and boundaries.</p>
          
          <button 
            onClick={() => navigate('/sakinah/considered-few')}
            className="w-full text-center py-3 bg-[rgba(212,168,83,0.05)] border border-[var(--sk-line-soft)] hover:border-[var(--sk-gold)] text-[var(--sk-gold)] rounded-xl transition-all"
          >
            View Candidate Pool
          </button>
        </div>
      </div>
    </SakinahJourneyFrame>
  );
};
