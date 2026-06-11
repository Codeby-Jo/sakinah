/* OnboardingLayout — clean minimal header + stepper */
import { Outlet, Link } from 'react-router-dom';
import ProgressStepper from '../../components/common/ProgressStepper';

export default function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      {/* Minimal header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#7B1C2E] flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-bold text-[#7B1C2E]">Sakinah</span>
        </Link>
        <Link to="/" className="text-sm text-gray-500 hover:text-[#7B1C2E] transition-colors">← Back to Home</Link>
      </header>

      <ProgressStepper />

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
