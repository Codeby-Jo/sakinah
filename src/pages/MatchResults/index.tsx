import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const profiles = [
  { id: 1, initials: 'A.M.', name: 'Aisha M.', age: 26, city: 'London, UK', education: "Master's – Computer Science", occupation: 'Software Engineer', sect: 'Sunni – Practicing', maritalStatus: 'Never Married', familyBackground: 'Close-knit family in London. Father is a doctor. Two siblings.', bio: 'Alhamdulillah, I strive to keep Islam at the centre of my life. I value family deeply and am looking for someone who is serious about deen and building a home together.' },
  { id: 2, initials: 'F.A.', name: 'Fatima A.', age: 24, city: 'Birmingham, UK', education: "Bachelor's – Islamic Studies", occupation: 'Teacher', sect: 'Sunni – Practicing', maritalStatus: 'Never Married', familyBackground: 'A religious family. Father is an Imam. One sibling.', bio: 'I seek a partner whose foundation is taqwa. I enjoy reading, teaching, and raising a righteous household.' },
  { id: 3, initials: 'M.K.', name: 'Mariam K.', age: 28, city: 'Toronto, Canada', education: "MBA – Business Administration", occupation: 'Business Owner', sect: 'Sunni – Moderately Practicing', maritalStatus: 'Never Married', familyBackground: 'Entrepreneurial family. Values financial responsibility and personal growth.', bio: 'A practicing Muslim working to balance deen and dunya. I am looking for someone who shares my ambition while prioritising family.' },
];

export default function MatchResults() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [passed, setPassed] = useState<number[]>([]);

  const activeProfiles = profiles.filter(p => !passed.includes(p.id));
  const match = activeProfiles[currentIdx % (activeProfiles.length || 1)];

  const handlePass = () => {
    if (!match) return;
    setPassed(prev => [...prev, match.id]);
    if (currentIdx >= activeProfiles.length - 1) setCurrentIdx(0);
  };

  if (activeProfiles.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="text-5xl mb-5">🕌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">No More Profiles</h2>
        <p className="text-gray-500 text-sm mb-8">You have reviewed all available profiles. New matches are added as more members complete their verification.</p>
        <Link to="/dashboard" className="text-[#7B1C2E] font-semibold hover:underline text-sm">← Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#7B1C2E] text-xs font-semibold uppercase tracking-widest mb-1">NIS Curated</p>
          <h1 className="text-2xl font-extrabold text-gray-900">Your Matches</h1>
        </div>
        <span className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
          {activeProfiles.length} profile{activeProfiles.length !== 1 ? 's' : ''} remaining
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main profile card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Photo placeholder */}
            <div className="bg-gray-50 h-56 flex flex-col items-center justify-center border-b border-gray-100 gap-3">
              <div className="w-20 h-20 rounded-full bg-[#7B1C2E]/10 border-2 border-[#7B1C2E]/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#7B1C2E]">{match.initials}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-200 px-3 py-1.5 rounded-full">
                <span>🔒</span> Photo revealed on mutual interest
              </div>
            </div>

            <div className="p-6">
              {/* Name row */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900">{match.name}, {match.age}</h2>
                  <p className="text-[#7B1C2E] text-sm mt-1">📍 {match.city}</p>
                </div>
                <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
                  Verified ✓
                </span>
              </div>

              {/* Quick facts */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Education',      value: match.education       },
                  { label: 'Occupation',     value: match.occupation      },
                  { label: 'Marital Status', value: match.maritalStatus   },
                  { label: 'Sect',           value: match.sect            },
                ].map(f => (
                  <div key={f.label} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{f.label}</p>
                    <p className="text-gray-800 text-sm font-medium leading-snug">{f.value}</p>
                  </div>
                ))}
              </div>

              {/* Family background */}
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-4">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Family Background</p>
                <p className="text-gray-700 text-sm leading-relaxed">{match.familyBackground}</p>
              </div>

              {/* Bio */}
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Introduction</p>
                <p className="text-gray-600 text-sm leading-relaxed italic">"{match.bio}"</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button onClick={handlePass}
              className="py-3.5 rounded-xl font-semibold text-sm text-gray-700 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              Pass Respectfully
            </button>
            <Link to="/interest-sent"
              className="py-3.5 rounded-xl font-bold text-sm text-white bg-[#7B1C2E] hover:bg-[#5e1522] transition-colors text-center shadow-sm"
            >
              Express Interest 💌
            </Link>
          </div>
          <div className="text-center">
            <Link to="/mutual-interest" className="text-xs text-gray-300 hover:text-gray-500">
              [Dev] Simulate Mutual Interest
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Other Matches</h3>
          {activeProfiles.map((p, i) => {
            const isCurrent = i === currentIdx % activeProfiles.length;
            return (
              <button key={p.id} onClick={() => setCurrentIdx(i)}
                className={[
                  'w-full text-left flex items-center gap-3 p-4 rounded-xl border transition-all bg-white',
                  isCurrent ? 'border-[#7B1C2E] shadow-sm' : 'border-gray-200 hover:border-gray-300',
                ].join(' ')}
              >
                <div className="w-10 h-10 rounded-full bg-[#7B1C2E]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#7B1C2E]">{p.initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-gray-900 font-semibold text-sm">{p.name}, {p.age}</p>
                  <p className="text-gray-400 text-xs truncate">{p.city}</p>
                </div>
                {isCurrent && <span className="text-[#7B1C2E] text-xs ml-auto flex-shrink-0 font-semibold">Viewing</span>}
              </button>
            );
          })}

          {/* Privacy note */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
            <p className="text-gray-700 font-semibold text-xs mb-1">🔒 Privacy Policy</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Photos remain blurred until both parties express interest. This ensures all interactions are values-first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
