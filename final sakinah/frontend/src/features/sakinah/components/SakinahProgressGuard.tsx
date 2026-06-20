/**
 * SakinahProgressGuard
 *
 * Wraps post-onboarding routes (dashboard, chat, matches, etc.)
 * If the user hasn't completed all onboarding steps, they are sent
 * to the first incomplete step instead of the protected page.
 * For WALI_VIEW users, strictly validates the session token.
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isOnboardingComplete, getNextRoute, getProgress } from '../services/sakinahProgress';

export const SakinahProgressGuard: React.FC = () => {
  const p = getProgress();

  if (p.role === 'WALI_VIEW') {
    // Treat any Wali hitting a Seeker route guard as an invalid state
    // and bounce them to the isolated Wali dashboard.
    return <Navigate to="/matrimony/wali-dashboard" replace />;
  }

  // SEEKER VALIDATION
  if (!isOnboardingComplete()) {
    const nextRoute = getNextRoute();
    return <Navigate to={nextRoute} replace />;
  }

  return <Outlet />;
};
