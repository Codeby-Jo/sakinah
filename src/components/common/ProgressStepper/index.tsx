/* ProgressStepper — clean white matrimonial style */
import { useLocation } from 'react-router-dom';

const ONBOARDING_STEPS = [
  { id: 1, name: 'Role',      path: '/choose-role'   },
  { id: 2, name: 'Register',  path: '/register'      },
  { id: 3, name: 'Login',     path: '/login'         },
  { id: 4, name: 'Profile',   path: '/profile-setup' },
  { id: 5, name: 'KYC',       path: '/kyc'           },
  { id: 6, name: 'Preferences', path: '/preferences' },
  { id: 7, name: 'Dashboard', path: '/dashboard'     },
  { id: 8, name: 'Matches',   path: '/matches'       },
  { id: 9, name: 'Chat',      path: '/chat'          },
];

const STEPPER_PATHS = new Set(ONBOARDING_STEPS.map(s => s.path).concat([
  '/profile-review', '/match-generation', '/interest-sent', '/mutual-interest',
  '/notifications', '/settings',
]));

function getCurrentStepIndex(pathname: string): number {
  for (let i = ONBOARDING_STEPS.length - 1; i >= 0; i--) {
    if (ONBOARDING_STEPS[i].path === pathname) return i;
  }
  return 0;
}

export default function ProgressStepper() {
  const { pathname } = useLocation();
  if (!STEPPER_PATHS.has(pathname)) return null;

  const currentIdx = getCurrentStepIndex(pathname);

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Desktop */}
        <div className="hidden sm:flex items-start">
          {ONBOARDING_STEPS.map((step, i) => {
            const isCompleted = i < currentIdx;
            const isActive    = i === currentIdx;

            return (
              <div key={step.id} className={`flex items-start ${i < ONBOARDING_STEPS.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className={[
                    'flex items-center justify-center rounded-full font-bold transition-all duration-300 text-xs',
                    isActive    ? 'w-9 h-9 bg-[#7B1C2E] text-white shadow-md ring-4 ring-[#7B1C2E]/20'
                    : isCompleted ? 'w-8 h-8 bg-green-600 text-white'
                                  : 'w-8 h-8 bg-gray-100 text-gray-400 border border-gray-200',
                  ].join(' ')}>
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : step.id}
                  </div>
                  <span className={[
                    'text-xs font-medium whitespace-nowrap',
                    isActive ? 'text-[#7B1C2E] font-semibold' : isCompleted ? 'text-green-600' : 'text-gray-400',
                  ].join(' ')}>
                    {step.name}
                  </span>
                </div>
                {i < ONBOARDING_STEPS.length - 1 && (
                  <div className="flex-1 mx-1 mt-4 h-0.5 rounded-full overflow-hidden bg-gray-200">
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: isCompleted ? '100%' : '0%',
                      backgroundColor: '#16a34a',
                    }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile */}
        <div className="sm:hidden text-center py-1">
          <span className="text-[#7B1C2E] font-semibold text-sm">
            Step {currentIdx + 1} of {ONBOARDING_STEPS.length}: {ONBOARDING_STEPS[currentIdx]?.name}
          </span>
        </div>
      </div>
    </div>
  );
}
