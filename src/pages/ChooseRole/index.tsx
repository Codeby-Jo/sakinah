import { useState } from 'react';
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
  const { setRole } = useAppContext();
  const [selected, setSelected] = useState<UserRole>(null);
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (!selected) {
      setError('Please select a role to continue.');
      return;
    }
    setError('');
    setRole(selected);
    navigate('/register');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gray-50">
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
                onClick={() => { setSelected(role.value); setError(''); }}
                className={[
                  'w-full text-left p-7 rounded-xl border-2 transition-all duration-200 focus:outline-none bg-white',
                  isSelected
                    ? 'border-[#7B1C2E] shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
                ].join(' ')}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={[
                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                    isSelected ? 'bg-red-50' : 'bg-gray-100',
                  ].join(' ')}>
                    {role.icon}
                  </div>
                  <div className={[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected ? 'border-[#7B1C2E] bg-[#7B1C2E]' : 'border-gray-300',
                  ].join(' ')}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                <h3 className={`text-lg font-bold mb-2 ${isSelected ? 'text-[#7B1C2E]' : 'text-gray-900'}`}>
                  {role.title}
                </h3>
                <p className="text-gray-500 text-sm mb-5 leading-relaxed">{role.description}</p>

                <ul className="space-y-1.5">
                  {role.bullets.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`text-xs ${isSelected ? 'text-[#7B1C2E]' : 'text-gray-400'}`}>✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected}
          className={[
            'w-full py-4 rounded-xl font-bold text-base transition-all',
            selected
              ? 'bg-[#7B1C2E] text-white hover:bg-[#5e1522] shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          ].join(' ')}
        >
          Continue as {selected ?? '…'}
        </button>
      </div>
    </div>
  );
}
