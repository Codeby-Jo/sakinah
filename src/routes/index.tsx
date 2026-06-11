import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout     from '../layouts/PublicLayout';
import OnboardingLayout from '../layouts/OnboardingLayout';

// ── Public / Marketing ──────────────────────────────────────────────────────
import Landing      from '../pages/Landing';
import About        from '../pages/About';
import HowItWorks   from '../pages/HowItWorks';
import LearnMore    from '../pages/LearnMore';
import Contact      from '../pages/Contact';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import Terms        from '../pages/Terms';

// ── Onboarding (logo + stepper only) ────────────────────────────────────────
import ChooseRole   from '../pages/ChooseRole';
import Register     from '../pages/Register';
import Login        from '../pages/Login';
import ProfileSetup from '../pages/ProfileSetup';
import ProfileReview from '../pages/ProfileReview';
import KYC          from '../pages/KYC';
import Preferences  from '../pages/Preferences';

// ── App Core (logo + stepper) ────────────────────────────────────────────────
import Dashboard      from '../pages/Dashboard';
import MatchGeneration from '../pages/MatchGeneration';
import MatchResults   from '../pages/MatchResults';
import InterestSent   from '../pages/InterestSent';
import MutualInterest from '../pages/MutualInterest';
import Chat           from '../pages/Chat';
import Notifications  from '../pages/Notifications';
import Settings       from '../pages/Settings';

export const router = createBrowserRouter([
  // ── Public marketing routes ────────────────────────────────────────────────
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true,          element: <Landing /> },
      { path: 'about',        element: <About /> },
      { path: 'how-it-works', element: <HowItWorks /> },
      { path: 'learn-more',   element: <LearnMore /> },
      { path: 'contact',      element: <Contact /> },
      { path: 'privacy-policy', element: <PrivacyPolicy /> },
      { path: 'terms',        element: <Terms /> },
    ],
  },

  // ── Onboarding routes (logo + progress stepper, no marketing nav) ──────────
  {
    path: '/',
    element: <OnboardingLayout />,
    children: [
      { path: 'choose-role',   element: <ChooseRole /> },
      { path: 'register',      element: <Register /> },
      { path: 'login',         element: <Login /> },
      { path: 'profile-setup', element: <ProfileSetup /> },
      { path: 'profile-review', element: <ProfileReview /> },
      { path: 'kyc',           element: <KYC /> },
      { path: 'preferences',   element: <Preferences /> },
      { path: 'dashboard',     element: <Dashboard /> },
      { path: 'match-generation', element: <MatchGeneration /> },
      { path: 'matches',       element: <MatchResults /> },
      { path: 'interest-sent', element: <InterestSent /> },
      { path: 'mutual-interest', element: <MutualInterest /> },
      { path: 'chat',          element: <Chat /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'settings',      element: <Settings /> },
    ],
  },

  // ── Fallback ───────────────────────────────────────────────────────────────
  { path: '*', element: <Navigate to="/" replace /> },
]);
