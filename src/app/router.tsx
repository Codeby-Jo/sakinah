/**
 * Sakinah Router
 * Simplified routes focusing only on Sakinah matchmaking feature
 */

import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import logoGold from '@/assets/zaryah-logo-gold.png';

// Sakinah Pages
const SakinahEntryPage = lazy(() => import('@/features/sakinah/pages/SakinahEntryPage').then(m => ({ default: m.SakinahEntryPage })));
const SakinahRolePage = lazy(() => import('@/features/sakinah/pages/SakinahRolePage').then(m => ({ default: m.SakinahRolePage })));
const SakinahPrimerPage = lazy(() => import('@/features/sakinah/pages/SakinahPrimerPage').then(m => ({ default: m.SakinahPrimerPage })));
const SakinahKycPage = lazy(() => import('@/features/sakinah/pages/SakinahKycPage').then(m => ({ default: m.SakinahKycPage })));
const SakinahLivenessPage = lazy(() => import('@/features/sakinah/pages/SakinahLivenessPage').then(m => ({ default: m.SakinahLivenessPage })));
const SakinahHomePage = lazy(() => import('@/features/sakinah/pages/SakinahHomePage').then(m => ({ default: m.SakinahHomePage })));
const SakinahNiyyahPage = lazy(() => import('@/features/sakinah/pages/SakinahNiyyahPage').then(m => ({ default: m.SakinahNiyyahPage })));
const SakinahValuesPage = lazy(() => import('@/features/sakinah/pages/SakinahValuesPage').then(m => ({ default: m.SakinahValuesPage })));
const SakinahMirrorPage = lazy(() => import('@/features/sakinah/pages/SakinahMirrorPage').then(m => ({ default: m.SakinahMirrorPage })));
const SakinahPortraitPage = lazy(() => import('@/features/sakinah/pages/SakinahPortraitPage').then(m => ({ default: m.SakinahPortraitPage })));
const SakinahEligibilityPage = lazy(() => import('@/features/sakinah/pages/SakinahEligibilityPage').then(m => ({ default: m.SakinahEligibilityPage })));
const SakinahProfileSignalsPage = lazy(() => import('@/features/sakinah/pages/SakinahProfileSignalsPage').then(m => ({ default: m.SakinahProfileSignalsPage })));
const SakinahPreferencesPage = lazy(() => import('@/features/sakinah/pages/SakinahPreferencesPage').then(m => ({ default: m.SakinahPreferencesPage })));
const SakinahConsideredFewPage = lazy(() => import('@/features/sakinah/pages/SakinahConsideredFewPage').then(m => ({ default: m.SakinahConsideredFewPage })));
const SakinahCandidatePage = lazy(() => import('@/features/sakinah/pages/SakinahCandidatePage').then(m => ({ default: m.SakinahCandidatePage })));
const SakinahMatchflowPage = lazy(() => import('@/features/sakinah/pages/SakinahMatchflowPage').then(m => ({ default: m.SakinahMatchflowPage })));
const SakinahConversationPage = lazy(() => import('@/features/sakinah/pages/SakinahConversationPage').then(m => ({ default: m.SakinahConversationPage })));
const SakinahDecisionPage = lazy(() => import('@/features/sakinah/pages/SakinahDecisionPage').then(m => ({ default: m.SakinahDecisionPage })));
const SakinahSafetyPage = lazy(() => import('@/features/sakinah/pages/SakinahSafetyPage').then(m => ({ default: m.SakinahSafetyPage })));
const SakinahCommunityPage = lazy(() => import('@/features/sakinah/pages/SakinahCommunityPage').then(m => ({ default: m.SakinahCommunityPage })));
const SakinahVentPage = lazy(() => import('@/features/sakinah/pages/SakinahVentPage').then(m => ({ default: m.SakinahVentPage })));
const SakinahNisProofPage = lazy(() => import('@/features/sakinah/pages/SakinahNisProofPage').then(m => ({ default: m.SakinahNisProofPage })));
const SakinahLoginPage = lazy(() => import('@/features/sakinah/pages/SakinahLoginPage').then(m => ({ default: m.SakinahLoginPage })));
const SakinahWaliDashboardPage = lazy(() => import('@/features/sakinah/pages/SakinahWaliDashboardPage').then(m => ({ default: m.SakinahWaliDashboardPage })));
const SakinahProfileCreationPage = lazy(() => import('@/features/sakinah/pages/SakinahProfileCreationPage').then(m => ({ default: m.SakinahProfileCreationPage })));
const SakinahDashboardPage = lazy(() => import('@/features/sakinah/pages/SakinahDashboardPage').then(m => ({ default: m.SakinahDashboardPage })));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E16]">
      <div className="flex flex-col items-center gap-4">
        <img
          src={logoGold}
          alt="Sakinah logo"
          className="w-12 h-12 object-contain animate-pulse"
        />
        <p className="text-[#C9A85C] text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Wrap lazy components with Suspense
function LazyPage({
  Component,
  fallback,
}: {
  Component: React.LazyExoticComponent<React.ComponentType>;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback ?? <PageLoader />}>
      <Component />
    </Suspense>
  );
}

// Global error boundary for route-level crashes
function RootErrorBoundary() {
  useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E16] px-4">
      <div className="text-center max-w-md">
        <img src={logoGold} alt="Sakinah" className="w-16 h-16 mx-auto mb-6 object-contain" />
        <h1 className="text-xl font-bold text-[#F5E8C7] mb-3">Something went wrong</h1>
        <p className="text-[#7A7363] text-sm mb-6">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <button
          onClick={() => {
            window.location.href = '/';
          }}
          className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16]"
        >
          Reload App
        </button>
      </div>
    </div>
  );
}

// Create browser router with Sakinah routes
export const router = createBrowserRouter([
  {
    path: '/',
    element: <LazyPage Component={SakinahEntryPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah',
    element: <LazyPage Component={SakinahEntryPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/role',
    element: <LazyPage Component={SakinahRolePage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/primer',
    element: <LazyPage Component={SakinahPrimerPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/kyc',
    element: <LazyPage Component={SakinahKycPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/liveness',
    element: <LazyPage Component={SakinahLivenessPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/home',
    element: <LazyPage Component={SakinahHomePage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/niyyah',
    element: <LazyPage Component={SakinahNiyyahPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/values',
    element: <LazyPage Component={SakinahValuesPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/mirror',
    element: <LazyPage Component={SakinahMirrorPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/portrait',
    element: <LazyPage Component={SakinahPortraitPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/eligibility',
    element: <LazyPage Component={SakinahEligibilityPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/profile',
    element: <LazyPage Component={SakinahProfileSignalsPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/preferences',
    element: <LazyPage Component={SakinahPreferencesPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/considered-few',
    element: <LazyPage Component={SakinahConsideredFewPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/candidate/:candidateId',
    element: <LazyPage Component={SakinahCandidatePage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/matchflow/:matchflowId',
    element: <LazyPage Component={SakinahMatchflowPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/conversation/:conversationId',
    element: <LazyPage Component={SakinahConversationPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/decision/:matchflowId',
    element: <LazyPage Component={SakinahDecisionPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/safety',
    element: <LazyPage Component={SakinahSafetyPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/community',
    element: <LazyPage Component={SakinahCommunityPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/vent',
    element: <LazyPage Component={SakinahVentPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/dev/proof-report',
    element: <LazyPage Component={SakinahNisProofPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/login',
    element: <LazyPage Component={SakinahLoginPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/wali-dashboard',
    element: <LazyPage Component={SakinahWaliDashboardPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/profile-creation',
    element: <LazyPage Component={SakinahProfileCreationPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/sakinah/dashboard',
    element: <LazyPage Component={SakinahDashboardPage} />,
    errorElement: <RootErrorBoundary />,
  },

  // 404 - Redirect to home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
