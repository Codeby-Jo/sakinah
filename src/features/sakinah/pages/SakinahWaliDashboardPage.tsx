import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SakinahHeader } from '../components';

export const SakinahWaliDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="sk-viewport">
      <div className="min-h-screen px-6 py-8 max-w-[900px] mx-auto">
        <SakinahHeader title="Wali Dashboard" subtitle="Stewardship & Monitoring" />

        {/* Candidate ID */}
        <div className="p-4 rounded-xl bg-[rgba(127,176,122,0.08)] border border-[rgba(127,176,122,0.2)] mb-6 sk-fx sk-d1">
          <div className="flex items-center gap-3">
            <span className="text-[20px] text-[var(--sk-green)]">✓</span>
            <div>
              <div className="text-[14px] font-medium text-[var(--sk-green)]">Profile Submitted Successfully</div>
              <div className="text-[12px] text-[var(--sk-ink-dim)] mt-1">Candidate ID: <span className="font-mono text-[var(--sk-gold)]">SKN-2026-4821</span></div>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="sk-card gold-edge p-5 mb-4 sk-fx sk-d2">
          <h3 className="font-serif text-[18px] text-[var(--sk-gold)] mb-2">Profile Status</h3>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[var(--sk-green)] animate-pulse" />
            <span className="text-[13px] text-[var(--sk-ink)]">Active & Visible to Matching Engine</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 sk-fx sk-d3">
          {[
            { label: 'Suggested', count: '8', icon: '♡' },
            { label: 'Interests', count: '2', icon: '✦' },
            { label: 'Messages', count: '1', icon: '✉' },
          ].map(s => (
            <div key={s.label} className="sk-card p-4 text-center cursor-pointer hover:border-[var(--sk-gold)] transition-colors">
              <div className="text-[22px] text-[var(--sk-gold)] mb-1">{s.icon}</div>
              <div className="text-[18px] font-serif text-[var(--sk-ink)]">{s.count}</div>
              <div className="text-[9px] text-[var(--sk-ink-faint)] uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Suggested Matches */}
        <div className="mb-6 sk-fx sk-d4">
          <h2 className="font-serif text-[20px] text-[var(--sk-ink)] mb-3">Suggested Matches</h2>
          <div className="flex flex-col gap-3">
            {[
              { initial: 'A', name: 'Ahmed', age: 28, city: 'Hyderabad', match: '90%' },
              { initial: 'M', name: 'Mohammad', age: 26, city: 'Chennai', match: '85%' },
            ].map(m => (
              <div key={m.name} className="sk-pool-card">
                <div className="pool-aura">{m.initial}</div>
                <div className="tx">
                  <b>{m.name}</b>
                  <div className="mt">{m.age} · {m.city}</div>
                  <div className="rz">{m.match} Match</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-[11px] border border-[rgba(127,176,122,0.3)] text-[var(--sk-green)] rounded-lg hover:bg-[rgba(127,176,122,0.1)]">Accept</button>
                  <button className="px-3 py-1 text-[11px] border border-[var(--sk-line-soft)] text-[var(--sk-ink-faint)] rounded-lg hover:bg-[rgba(255,255,255,0.05)]">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 sk-fx sk-d5">
          <div className="sk-card p-4 cursor-pointer hover:border-[var(--sk-gold)] transition-colors" onClick={() => navigate('/wali/candidate-profile')}>
            <div className="text-[18px] text-[var(--sk-gold)] mb-2">⚙</div>
            <div className="text-[14px] text-[var(--sk-ink)]">Update Profile</div>
            <div className="text-[11px] text-[var(--sk-ink-faint)] mt-1">Edit candidate information</div>
          </div>
          <div className="sk-card p-4 cursor-pointer hover:border-[var(--sk-gold)] transition-colors">
            <div className="text-[18px] text-[var(--sk-gold)] mb-2">💬</div>
            <div className="text-[14px] text-[var(--sk-ink)]">Conversations</div>
            <div className="text-[11px] text-[var(--sk-ink-faint)] mt-1">1 active conversation</div>
          </div>
        </div>
      </div>
    </div>
  );
};
