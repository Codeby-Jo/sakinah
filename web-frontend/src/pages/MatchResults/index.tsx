import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authPost } from '../../lib/api';
import { useAppContext } from '../../context/AppContext';

export default function MatchResults() {
  const { state, setMatches } = useAppContext();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const activeProfiles = state.matches || [];

  useEffect(() => {
    if (activeProfiles.length > 0) {
        setLoading(false);
        return;
    }

    const fetchMatches = async () => {
      try {
        const res = await authPost('/sakinah/matches/generate', {});
        // Response format is { status: "HAS_CONSIDERED_CANDIDATES", candidates: [...] }
        if (res && res.candidates && res.candidates.length > 0) {
            // Map NIS Candidate Profile format to UI format
            const mapped = res.candidates.map((c: any) => ({
                id: c.candidate_id,
                initials: c.profile?.name ? c.profile.name.substring(0, 2).toUpperCase() : '??',
                name: c.profile?.name || 'Unknown',
                age: c.profile?.age || 'N/A',
                city: c.profile?.location || 'Unknown location',
                education: c.profile?.education_level || 'N/A',
                occupation: c.profile?.occupation || 'N/A',
                sect: c.profile?.tradition || 'Sunni',
                maritalStatus: 'Never Married',
                familyBackground: 'Family background details hidden until mutual interest.',
                bio: 'Bio hidden until mutual interest to ensure character-first matching.'
            }));
            setMatches(mapped);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to generate matches from NIS Engine.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const match = activeProfiles[currentIdx % (activeProfiles.length || 1)];

  const handlePass = async () => {
    if (!match) return;
    try {
        await authPost(`/sakinah/candidates/${match.id}/pass`, {});
        const updated = activeProfiles.filter(p => p.id !== match.id);
        setMatches(updated);
        if (currentIdx >= updated.length - 1) setCurrentIdx(0);
    } catch (err) {
        console.error("Failed to record pass:", err);
    }
  };

  const handleInterest = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!match) return;
    try {
        const response = await authPost<{ status: string, message: string }>(`/sakinah/candidates/${match.id}/interest`, {});
        if (response.status === 'mutual_interest') {
            navigate('/mutual-interest');
        } else {
            navigate('/interest-sent');
        }
    } catch (err) {
        console.error("Failed to record interest:", err);
    }
  };

  if (loading) {
      return (
          <div className="max-w-lg mx-auto px-6 py-24 text-center">
              <div className="text-5xl mb-5 animate-spin">⚙️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">NIS Engine Running...</h2>
              <p className="text-gray-500 text-sm mb-8">Curating candidates based on your psychology and preferences.</p>
          </div>
      );
  }

  if (error) {
      return (
          <div className="max-w-lg mx-auto px-6 py-24 text-center">
              <div className="text-5xl mb-5">⚠️</div>
              <h2 className="text-2xl font-bold text-red-900 mb-3">NIS Engine Error</h2>
              <p className="text-gray-500 text-sm mb-8">{error}</p>
              <Link to="/dashboard" className="text-[#0A192F] font-semibold hover:underline text-sm">← Return to Dashboard</Link>
          </div>
      );
  }

  if (activeProfiles.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="text-5xl mb-5">🕌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">No Matches Curated Yet</h2>
        <p className="text-gray-500 text-sm mb-8">No suitable matches right now. Sakinah would rather wait than show the wrong person.</p>
        <Link to="/dashboard" className="text-[#0A192F] font-semibold hover:underline text-sm">← Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#0A192F] text-xs font-semibold uppercase tracking-widest mb-1">NIS Curated</p>
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
              <div className="w-20 h-20 rounded-full bg-[#0A192F]/10 border-2 border-[#0A192F]/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#0A192F]">{match.initials}</span>
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
                  <p className="text-[#0A192F] text-sm mt-1">📍 {match.city}</p>
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
            <button onClick={handleInterest}
              className="py-3.5 rounded-xl font-bold text-sm text-white bg-[#0A192F] hover:bg-[#040d1a] transition-colors text-center shadow-sm"
            >
              Express Interest 💌
            </button>
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
                  isCurrent ? 'border-[#0A192F] shadow-sm' : 'border-gray-200 hover:border-gray-300',
                ].join(' ')}
              >
                <div className="w-10 h-10 rounded-full bg-[#0A192F]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#0A192F]">{p.initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-gray-900 font-semibold text-sm">{p.name}, {p.age}</p>
                  <p className="text-gray-400 text-xs truncate">{p.city}</p>
                </div>
                {isCurrent && <span className="text-[#0A192F] text-xs ml-auto flex-shrink-0 font-semibold">Viewing</span>}
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
