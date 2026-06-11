import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const journeySteps = [
  { key: 'role',       icon: '👤', label: 'Role Selected',     detail: 'Seeker / Wali',         isDone: (s: any) => !!s.role,                              action: '/choose-role',  actionLabel: 'Select Role'       },
  { key: 'profile',   icon: '📝', label: 'Profile Complete',  detail: 'Personal & Family Info', isDone: (s: any) => !!s.profile?.completed,                action: '/profile-setup', actionLabel: 'Build Profile'    },
  { key: 'kyc',       icon: '🛡️', label: 'KYC Verified',      detail: 'Identity Approved',      isDone: (s: any) => s.kyc?.status === 'Approved',           isPending: (s: any) => s.kyc?.status === 'Pending', action: '/kyc', actionLabel: 'Verify Identity' },
  { key: 'prefs',     icon: '🎯', label: 'Preferences Saved', detail: 'Match Criteria Set',     isDone: (s: any) => !!s.preferences?.completed,            action: '/preferences', actionLabel: 'Set Preferences' },
  { key: 'nis',       icon: '🧠', label: 'NIS Review',        detail: 'Profile Analysis',       isDone: (s: any) => s.preferences?.completed && s.kyc?.status === 'Approved', action: null, actionLabel: null },
  { key: 'matches',   icon: '💌', label: 'Matches Ready',     detail: 'View Curated Profiles',  isDone: () => false,                                       action: '/matches', actionLabel: 'View Matches'    },
];

export default function Dashboard() {
  const { state } = useAppContext();
  const navigate = useNavigate();

  const isProfileComplete = !!state.profile?.completed;
  const isKycApproved     = state.kyc?.status === 'Approved';
  const isPrefComplete    = !!state.preferences?.completed;
  const isReady           = isProfileComplete && isKycApproved && isPrefComplete;
  const roleLabel         = state.role ?? 'User';

  const completedCount = [!!state.role, isProfileComplete, isKycApproved, isPrefComplete].filter(Boolean).length;
  const pct = Math.round((completedCount / 4) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Greeting */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[#7B1C2E] text-xs font-semibold uppercase tracking-widest mb-1">Matrimonial Journey</p>
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome, {roleLabel}</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isReady ? 'Your profile is complete. Your NIS matches are being prepared.' : 'Complete the steps below to begin receiving matches.'}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-4 text-center min-w-[110px] shadow-sm">
          <p className="text-3xl font-extrabold text-[#7B1C2E]">{pct}%</p>
          <p className="text-gray-400 text-xs mt-1">Complete</p>
          <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-[#7B1C2E] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Your Journey</h2>
          <p className="text-gray-400 text-xs mt-0.5">Complete each step to unlock matches</p>
        </div>
        <div className="divide-y divide-gray-100">
          {journeySteps.map((step, i) => {
            const done    = step.isDone(state);
            const pending = step.isPending ? step.isPending(state) : false;
            const isNext  = !done && !pending && journeySteps.slice(0, i).every(s => s.isDone(state));

            return (
              <div key={step.key} className={`flex items-center gap-5 px-6 py-5 ${isNext ? 'bg-red-50' : ''}`}>
                {/* Step icon */}
                <div className={[
                  'w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0',
                  done    ? 'bg-green-100' : pending ? 'bg-amber-100' : isNext ? 'bg-red-100' : 'bg-gray-100',
                ].join(' ')}>
                  {done ? '✓' : step.icon}
                </div>

                {/* Label */}
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${done ? 'text-green-700' : isNext ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{step.detail}</p>
                </div>

                {/* Badge / Action */}
                {done ? (
                  <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">Done</span>
                ) : pending ? (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">Under Review</span>
                ) : step.action && isNext ? (
                  <Link to={step.action}
                    className="text-xs font-bold text-white bg-[#7B1C2E] px-4 py-2 rounded-full hover:bg-[#5e1522] transition-colors"
                  >
                    {step.actionLabel} →
                  </Link>
                ) : (
                  <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Awaiting</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Matches CTA */}
      <div className={`rounded-2xl border p-8 text-center ${isReady ? 'bg-white border-[#7B1C2E]/30 shadow-sm' : 'bg-white border-gray-200'}`}>
        {isReady ? (
          <>
            <div className="text-4xl mb-4">💌</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Matches Are Ready</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Alhamdulillah! The NIS engine has reviewed your values and preferences. Your curated matches are ready.</p>
            <button onClick={() => navigate('/matches')}
              className="bg-[#7B1C2E] text-white px-10 py-3 rounded-lg font-bold hover:bg-[#5e1522] transition-colors"
            >View My Matches</button>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">🕌</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Your Journey</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">Complete all the steps above — Profile, KYC, and Preferences — to unlock your matches.</p>
          </>
        )}
      </div>
    </div>
  );
}
