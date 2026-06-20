import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getProgress } from '../services/sakinahProgress';

export const SakinahWaliGuard: React.FC = () => {
  const p = getProgress();

  if (p.role !== 'WALI_VIEW') {
    // If a seeker tries to enter a wali route, bounce to dashboard
    return <Navigate to="/matrimony/dashboard" replace />;
  }

  // STRICT WALI SESSION VALIDATION
  try {
    const sessionData = localStorage.getItem('sakinah_wali_session');
    if (!sessionData) {
      return <Navigate to="/matrimony/login" replace />;
    }
    const parsedSession = JSON.parse(sessionData);
    if (!parsedSession.token || !parsedSession.email) {
      return <Navigate to="/matrimony/login" replace />;
    }
    // Basic expiration check (e.g., 24 hours)
    const sessionTime = new Date(parsedSession.timestamp).getTime();
    const now = Date.now();
    if (now - sessionTime > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('sakinah_wali_session');
      return <Navigate to="/matrimony/login" replace />;
    }
  } catch (err) {
    localStorage.removeItem('sakinah_wali_session');
    return <Navigate to="/matrimony/login" replace />;
  }

  return <Outlet />;
};
