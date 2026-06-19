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
    // STRICT WALI SESSION VALIDATION
    try {
      const sessionData = localStorage.getItem('sakinah_wali_session');
      if (!sessionData) {
        // No session token found, block access
        return <Navigate to="/matrimony/register" replace />;
      }
      const parsedSession = JSON.parse(sessionData);
      if (!parsedSession.token || !parsedSession.email) {
        // Invalid session data
        return <Navigate to="/matrimony/register" replace />;
      }
      // Basic expiration check (e.g., 24 hours)
      const sessionTime = new Date(parsedSession.timestamp).getTime();
      const now = Date.now();
      if (now - sessionTime > 24 * 60 * 60 * 1000) {
        // Session expired
        localStorage.removeItem('sakinah_wali_session');
        return <Navigate to="/matrimony/register" replace />;
      }
    } catch (err) {
      // Malformed session data
      localStorage.removeItem('sakinah_wali_session');
      return <Navigate to="/matrimony/register" replace />;
    }
  } else {
    // SEEKER VALIDATION
    if (!isOnboardingComplete()) {
      const nextRoute = getNextRoute();
      return <Navigate to={nextRoute} replace />;
    }
  }

  return <Outlet />;
};
