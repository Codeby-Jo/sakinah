/**
 * Sakinah Router — Complete End-to-End Flow
 * 
 * Flow Architecture:
 * 
 * Welcome → Role Selection
 *   ├─ Seeker: Register → OTP → KYC → Profile (9 steps) → Preferences → Review → Dashboard
 *   └─ Wali:
 *       ├─ Login → Wali Dashboard
 *       └─ Register → Verify → Candidate Profile (10 steps) → Wali Dashboard
 */

import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import logoGold from '@/assets/zaryah-logo-gold.png';

// ─── Pages ───────────────────────────────────────────────────────────────────
const SakinahWelcomePage = lazy(() => import('@/features/sakinah/pages/SakinahWelcomePage').then(m => ({ default: m.SakinahWelcomePage })));
const SakinahRolePage = lazy(() => import('@/features/sakinah/pages/SakinahRolePage').then(m => ({ default: m.SakinahRolePage })));

// Seeker Flow
const SakinahRegisterPage = lazy(() => import('@/features/sakinah/pages/SakinahRegisterPage').then(m => ({ default: m.SakinahRegisterPage })));
const SakinahVerifyOtpPage = lazy(() => import('@/features/sakinah/pages/SakinahVerifyOtpPage').then(m => ({ default: m.SakinahVerifyOtpPage })));
const SakinahKycPage = lazy(() => import('@/features/sakinah/pages/SakinahKycPage').then(m => ({ default: m.SakinahKycPage })));
const SakinahProfileCreationPage = lazy(() => import('@/features/sakinah/pages/SakinahProfileCreationPage').then(m => ({ default: m.SakinahProfileCreationPage })));
const SakinahPreferencesPage = lazy(() => import('@/features/sakinah/pages/SakinahPreferencesPage').then(m => ({ default: m.SakinahPreferencesPage })));
const SakinahReviewPage = lazy(() => import('@/features/sakinah/pages/SakinahReviewPage').then(m => ({ default: m.SakinahReviewPage })));
const SakinahDashboardPage = lazy(() => import('@/features/sakinah/pages/SakinahDashboardPage').then(m => ({ default: m.SakinahDashboardPage })));
const SakinahChatPage = lazy(() => import('@/features/sakinah/pages/SakinahChatPage').then(m => ({ default: m.SakinahChatPage })));

const SakinahMatchesPage = lazy(() => import('@/features/sakinah/pages/SakinahMatchesPage').then(m => ({ default: m.SakinahMatchesPage })));
const SakinahInterestsPage = lazy(() => import('@/features/sakinah/pages/SakinahInterestsPage').then(m => ({ default: m.SakinahInterestsPage })));
const SakinahSavedPage = lazy(() => import('@/features/sakinah/pages/SakinahSavedPage').then(m => ({ default: m.SakinahSavedPage })));
const SakinahNotificationsPage = lazy(() => import('@/features/sakinah/pages/SakinahNotificationsPage').then(m => ({ default: m.SakinahNotificationsPage })));
const SakinahSettingsPage = lazy(() => import('@/features/sakinah/pages/SakinahSettingsPage').then(m => ({ default: m.SakinahSettingsPage })));
const SakinahSupportPage = lazy(() => import('@/features/sakinah/pages/SakinahSupportPage').then(m => ({ default: m.SakinahSupportPage })));

// Wali Flow
const SakinahWaliLoginPage = lazy(() => import('@/features/sakinah/pages/SakinahWaliLoginPage').then(m => ({ default: m.SakinahWaliLoginPage })));
const SakinahWaliRegisterPage = lazy(() => import('@/features/sakinah/pages/SakinahWaliRegisterPage').then(m => ({ default: m.SakinahWaliRegisterPage })));
const SakinahWaliVerifyPage = lazy(() => import('@/features/sakinah/pages/SakinahWaliVerifyPage').then(m => ({ default: m.SakinahWaliVerifyPage })));
const SakinahWaliCandidateProfilePage = lazy(() => import('@/features/sakinah/pages/SakinahWaliCandidateProfilePage').then(m => ({ default: m.SakinahWaliCandidateProfilePage })));
const SakinahWaliDashboardPage = lazy(() => import('@/features/sakinah/pages/SakinahWaliDashboardPage').then(m => ({ default: m.SakinahWaliDashboardPage })));

// ─── Loading / Error ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E16]">
      <div className="flex flex-col items-center gap-4">
        <img src={logoGold} alt="Sakinah logo" className="w-12 h-12 object-contain animate-pulse" />
        <p className="text-[#C9A85C] text-sm">Loading...</p>
      </div>
    </div>
  );
}

function LazyPage({ Component }: { Component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Component />
    </React.Suspense>
  );
}

function RootErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E16] px-4">
      <div className="text-center max-w-md">
        <img src={logoGold} alt="Sakinah" className="w-16 h-16 mx-auto mb-6 object-contain" />
        <h1 className="text-xl font-bold text-[#F5E8C7] mb-3">Something went wrong</h1>
        <p className="text-[#7A7363] text-sm mb-6">An unexpected error occurred. Please try refreshing.</p>
        <button onClick={() => { window.location.href = '/'; }} className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16]">
          Reload App
        </button>
      </div>
    </div>
  );
}

// ─── Routes ─────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  // Landing
  { path: '/', element: <LazyPage Component={SakinahWelcomePage} />, errorElement: <RootErrorBoundary /> },

  // Role Selection
  { path: '/role', element: <LazyPage Component={SakinahRolePage} />, errorElement: <RootErrorBoundary /> },

  // ─── Seeker Flow ────────────────────────────────────────────────────────
  { path: '/register', element: <LazyPage Component={SakinahRegisterPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/verify-otp', element: <LazyPage Component={SakinahVerifyOtpPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/kyc', element: <LazyPage Component={SakinahKycPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/profile-creation', element: <LazyPage Component={SakinahProfileCreationPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/preferences', element: <LazyPage Component={SakinahPreferencesPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/review', element: <LazyPage Component={SakinahReviewPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/dashboard', element: <LazyPage Component={SakinahDashboardPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/chat', element: <LazyPage Component={SakinahChatPage} />, errorElement: <RootErrorBoundary /> },
  
  // App Pages
  { path: '/matches', element: <LazyPage Component={SakinahMatchesPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/interests', element: <LazyPage Component={SakinahInterestsPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/saved', element: <LazyPage Component={SakinahSavedPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/notifications', element: <LazyPage Component={SakinahNotificationsPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/settings', element: <LazyPage Component={SakinahSettingsPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/support', element: <LazyPage Component={SakinahSupportPage} />, errorElement: <RootErrorBoundary /> },

  // ─── Wali Flow ──────────────────────────────────────────────────────────
  { path: '/wali/login', element: <LazyPage Component={SakinahWaliLoginPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/wali/register', element: <LazyPage Component={SakinahWaliRegisterPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/wali/verify', element: <LazyPage Component={SakinahWaliVerifyPage} />, errorElement: <RootErrorBoundary /> },
  { path: '/wali/candidate-profile', element: <LazyPage Component={SakinahWaliCandidateProfilePage} />, errorElement: <RootErrorBoundary /> },
  { path: '/wali/dashboard', element: <LazyPage Component={SakinahWaliDashboardPage} />, errorElement: <RootErrorBoundary /> },

  // 404 → Home
  { path: '*', element: <Navigate to="/" replace /> },
]);
