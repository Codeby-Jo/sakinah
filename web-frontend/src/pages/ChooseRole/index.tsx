import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import type { UserRole } from '../../context/AppContext';

const roles: { value: UserRole; icon: string; title: string; description: string; bullets: string[] }[] = [
  {
    value: 'Seeker',
    icon: '👤',
    title: 'I Am A Seeker',
    description: 'I am looking for a spouse and would like Sakinah and NIS to help me find compatible marriage prospects.',
    bullets: [
      'Create and complete your own profile',
      'Undergo KYC identity verification',
      'Set detailed match preferences',
      'Receive curated NIS-approved matches',
      'Express interest and initiate conversations',
    ],
  },
  {
    value: 'Wali',
    icon: '🤲',
    title: 'I Am A Wali',
    description: 'I am acting as a Wali (guardian) and helping manage the matrimonial journey of someone under my care.',
    bullets: [
      'Create or manage a profile on behalf of another',
      'Review profile information for accuracy',
      'Assist in the KYC verification process',
      'Monitor match progress and communication',
      'Participate in marriage-focused workflows',
    ],
  },
];

export default function ChooseRole() {
  const navigate = useNavigate();
  const { setRole, resetState } = useAppContext();
  const [selected, setSelected] = useState<UserRole>(null);
  const [waliOption, setWaliOption] = useState<'manage' | 'create' | null>(null);
  const [error, setError] = useState('');

  // When a user visits the Choose Role page, they are starting a brand new account flow.
  // We wipe any cached progress from previous test accounts so they start at 0% complete.
  useEffect(() => {
    resetState();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinue = () => {
    if (!selected) {
      setError('Please select a role to continue.');
      return;
    }
    if (selected === 'Wali' && !waliOption) {
      setError('Please select how you want to manage the profile.');
      return;
    }
    setError('');
    setRole(selected, waliOption);
    navigate('/register');
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 bg-gray-50">
      <div className="w-full max-w-3xl">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Choose Your Role</h1>
          <p className="text-gray-500 text-base">
            Your role determines how you interact with the Sakinah platform throughout the journey.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-5 mb-6">
          {roles.map((role) => {
            const isSelected = selected === role.value;
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => { 
                  setSelected(role.value); 
                  if (role.value !== 'Wali') setWaliOption(null);
                  setError(''); 
                }}
                className={[
                  'w-full text-left p-7 rounded-xl border-2 transition-all duration-200 focus:outline-none bg-white',
                  isSelected
                    ? 'border-[#0A192F] shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
                ].join(' ')}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={[
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                    isSelected ? 'bg-gray-100' : 'bg-gray-50',
                  ].join(' ')}>
                    {role.icon}
                  </div>
                  <div className={[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected ? 'border-[#0A192F] bg-[#0A192F]' : 'border-gray-300',
                  ].join(' ')}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                <h3 className={`text-lg font-bold mb-2 ${isSelected ? 'text-[#0A192F]' : 'text-gray-900'}`}>
                  {role.title}
                </h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">{role.description}</p>

                <ul className="space-y-1.5">
                  {role.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`text-xs ${isSelected ? 'text-[#0A192F]' : 'text-gray-400'}`}>✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {selected === 'Wali' && (
          <div className="mb-6 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Wali Options</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setWaliOption('manage'); setError(''); }}
                className={`p-5 text-left border-2 rounded-xl transition-all bg-white ${
                  waliOption === 'manage' ? 'border-[#0A192F] shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className={`font-bold mb-1 ${waliOption === 'manage' ? 'text-[#0A192F]' : 'text-gray-900'}`}>
                  Manage Existing Profile
                </h4>
                <p className="text-xs text-gray-500">Review and manage a profile already created by the seeker.</p>
              </button>
              
              <button
                type="button"
                onClick={() => { setWaliOption('create'); setError(''); }}
                className={`p-5 text-left border-2 rounded-xl transition-all bg-white ${
                  waliOption === 'create' ? 'border-[#0A192F] shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className={`font-bold mb-1 ${waliOption === 'create' ? 'text-[#0A192F]' : 'text-gray-900'}`}>
                  Create Profile For Someone
                </h4>
                <p className="text-xs text-gray-500">Create a marriage profile on behalf of a son, daughter, sibling, or family member.</p>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected || (selected === 'Wali' && !waliOption)}
          className={[
            'w-full py-4 rounded-xl font-bold text-base transition-all',
            (selected && (selected !== 'Wali' || waliOption))
              ? 'bg-[#0A192F] text-white hover:bg-[#040d1a] shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          ].join(' ')}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
