import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import ProgressStepper from '../../components/common/ProgressStepper';
import { useAppContext } from '../../context/AppContext';

export default function OnboardingLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state } = useAppContext();

  // Strict Workflow Enforcement
  useEffect(() => {
    // Only enforce rules on protected app routes (skip auth/public pages)
    const publicPaths = ['/choose-role', '/register', '/login', '/forgot-password', '/verify-email'];
    if (publicPaths.includes(pathname)) return;

    // Must be authenticated
    const token = localStorage.getItem('sakinah_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Progression rules
    if (!state.profile?.completed && pathname !== '/profile-setup') {
      navigate('/profile-setup');
      return;
    }
    
    if (state.profile?.completed) {
      const kycStatus = state.kyc?.status;
      const isKycComplete = kycStatus === 'Approved' || kycStatus === 'Pending';
      if (!isKycComplete && pathname !== '/kyc') {
        navigate('/kyc');
        return;
      }
      
      if (isKycComplete && !state.preferences?.completed && pathname !== '/preferences') {
        navigate('/preferences');
        return;
      }
    }
  }, [pathname, state, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      {/* Minimal header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#0A192F] flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-bold text-[#0A192F]">Sakinah</span>
        </Link>
        <Link to="/" className="text-sm text-gray-500 hover:text-[#0A192F] transition-colors">← Back to Home</Link>
      </header>

      <ProgressStepper />

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
