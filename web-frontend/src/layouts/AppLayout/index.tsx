import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

export default function AppLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state, resetState } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);

  // Strict Workflow Enforcement (ensure onboarding is complete before accessing App)
  useEffect(() => {
    const token = localStorage.getItem('sakinah_token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (!state.profile?.completed) {
      navigate('/profile-setup');
      return;
    }
    
    const kycStatus = state.kyc?.status;
    const isKycComplete = kycStatus === 'Approved' || kycStatus === 'Pending';
    if (!isKycComplete) {
      navigate('/kyc');
      return;
    }
    
    if (!state.preferences?.completed) {
      navigate('/preferences');
      return;
    }
  }, [pathname, state, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('sakinah_token');
    localStorage.removeItem('sakinah_user_id');
    resetState();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      {/* Private Dashboard Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#0A192F] flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-bold text-[#0A192F] hidden sm:block">Sakinah</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/notifications" className="text-gray-500 hover:text-[#0A192F] transition-colors relative">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </Link>
          
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-full transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#0A192F]/10 border border-[#0A192F]/20 flex items-center justify-center">
                <span className="text-sm font-bold text-[#0A192F]">
                  {state.profile?.data?.firstName ? state.profile.data.firstName.substring(0, 1).toUpperCase() : 'U'}
                </span>
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                <Link to="/profile-review" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                <Link to="/preferences" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Preferences</Link>
                <Link to="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
