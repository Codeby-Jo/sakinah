import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SakinahHeader } from '../components';

export const SakinahDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="sk-viewport">
      <div className="min-h-screen px-6 py-8 max-w-[900px] mx-auto">
        <SakinahHeader title="Dashboard" subtitle="Your Matrimony Journey" />

        {/* Profile Completion */}
        <div className="sk-card gold-edge p-5 mb-4 sk-fx sk-d1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif text-[18px] text-[var(--sk-gold)]">Profile Completion</h3>
            <span className="text-[var(--sk-green)] text-[13px] font-medium">100%</span>
          </div>
          <div className="w-full bg-[rgba(255,255,255,0.05)] h-[5px] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--sk-green)] w-full rounded-full" />
          </div>
          <p className="text-[11px] text-[var(--sk-ink-dim)] mt-2">Your profile is complete and visible to the matching engine.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mb-6 sk-fx sk-d2">
          {[
            { label: 'Recommended', count: '12', icon: '♡' },
            { label: 'Interests', count: '3', icon: '✦' },
            { label: 'Messages', count: '2', icon: '✉' },
            { label: 'Saved', count: '5', icon: '★' },
          ].map(s => (
            <div key={s.label} className="sk-card p-4 text-center cursor-pointer hover:border-[var(--sk-gold)] transition-colors">
              <div className="text-[22px] text-[var(--sk-gold)] mb-1">{s.icon}</div>
              <div className="text-[18px] font-serif text-[var(--sk-ink)]">{s.count}</div>
              <div className="text-[9px] text-[var(--sk-ink-faint)] uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recommended Matches */}
        <div className="mb-6 sk-fx sk-d3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-[20px] text-[var(--sk-ink)]">Recommended Matches</h2>
            <button className="text-[11px] text-[var(--sk-gold)] hover:underline">View All</button>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { initial: 'A', name: 'Aisha', age: 25, city: 'London', match: '92%', profession: 'Software Engineer' },
              { initial: 'M', name: 'Maryam', age: 27, city: 'Toronto', match: '87%', profession: 'Doctor' },
              { initial: 'F', name: 'Fatima', age: 24, city: 'Dubai', match: '85%', profession: 'Teacher' },
            ].map(m => (
              <div key={m.name} className="sk-pool-card">
                <div className="pool-aura">{m.initial}</div>
                <div className="tx">
                  <b>{m.name}</b>
                  <div className="mt">{m.age} · {m.city} · {m.profession}</div>
                  <div className="rz">{m.match} Match</div>
                </div>
                <div className="arr">→</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interests Received */}
        <div className="mb-6 sk-fx sk-d4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-[20px] text-[var(--sk-ink)]">Interests Received</h2>
            <span className="text-[11px] bg-[rgba(212,168,83,0.1)] text-[var(--sk-gold)] px-2 py-1 rounded-full">3 New</span>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { initial: 'Y', name: 'Yusuf', message: 'Interested in getting to know you' },
              { initial: 'H', name: 'Hassan', message: 'MashaAllah, our values align' },
            ].map(i => (
              <div key={i.name} className="sk-pool-card">
                <div className="pool-aura">{i.initial}</div>
                <div className="tx">
                  <b>{i.name}</b>
                  <div className="mt">{i.message}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-[11px] border border-[rgba(127,176,122,0.3)] text-[var(--sk-green)] rounded-lg hover:bg-[rgba(127,176,122,0.1)]">Accept</button>
                  <button className="px-3 py-1 text-[11px] border border-[var(--sk-line-soft)] text-[var(--sk-ink-faint)] rounded-lg hover:bg-[rgba(255,255,255,0.05)]">Decline</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 sk-fx sk-d5">
          <div className="sk-card p-4 cursor-pointer hover:border-[var(--sk-gold)] transition-colors" onClick={() => navigate('/profile-creation')}>
            <div className="text-[18px] text-[var(--sk-gold)] mb-2">⚙</div>
            <div className="text-[14px] text-[var(--sk-ink)]">Edit Profile</div>
            <div className="text-[11px] text-[var(--sk-ink-faint)] mt-1">Update your information</div>
          </div>
          <div className="sk-card p-4 cursor-pointer hover:border-[var(--sk-gold)] transition-colors" onClick={() => navigate('/preferences')}>
            <div className="text-[18px] text-[var(--sk-gold)] mb-2">♡</div>
            <div className="text-[14px] text-[var(--sk-ink)]">Edit Preferences</div>
            <div className="text-[11px] text-[var(--sk-ink-faint)] mt-1">Refine your partner criteria</div>
          </div>
          <div className="sk-card p-4 cursor-pointer hover:border-[var(--sk-gold)] transition-colors">
            <div className="text-[18px] text-[var(--sk-gold)] mb-2">🔔</div>
            <div className="text-[14px] text-[var(--sk-ink)]">Notifications</div>
            <div className="text-[11px] text-[var(--sk-ink-faint)] mt-1">1 new update</div>
          </div>
          <div className="sk-card p-4 cursor-pointer hover:border-[var(--sk-gold)] transition-colors">
            <div className="text-[18px] text-[var(--sk-gold)] mb-2">⚡</div>
            <div className="text-[14px] text-[var(--sk-ink)]">Settings</div>
            <div className="text-[11px] text-[var(--sk-ink-faint)] mt-1">Account & privacy</div>
          </div>
        </div>
      </div>
    </div>
  );
};
