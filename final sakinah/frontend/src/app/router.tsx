/* eslint-disable react-refresh/only-export-components --
 * Router config file inherently mixes the `router` export (a route-config
 * object, not a component) with many `lazy()` route components. Splitting
 * them across files would obscure the route map for no HMR benefit — you
 * never edit the router config itself during hot-reload; you edit the
 * page components, which are imported via lazy() and refresh correctly.
 */

/**
 * Application Router
 * Defines all routes for the application
 * Uses MainLayout as shell for authenticated routes (sidebar + bottom nav)
 */

import { createBrowserRouter, Navigate, useRouteError, useLocation } from 'react-router-dom';
import { lazy, Suspense, useEffect, useState } from 'react';
import { recoverFromFirestoreError, recentlyRecovered } from '@/lib/firestoreRecovery';
import { AuthGuard } from '@/features/auth/components/AuthGuard';
import { InviteGate } from '@/features/auth/components/InviteGate';
import { MainLayout } from '@/features/navigation/components/MainLayout';
import { EimShell } from '@/features/eim/components/EimShell';
import { SakinahProviders } from '@/features/sakinah/components/SakinahProviders';
import { DeepKycGuard } from '@/features/kyc/components/DeepKycGuard';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';
import { ComingSoonWrapper } from '@/components/shared/ComingSoonBanner';
import { SakinahProgressGuard } from '@/features/sakinah/components/SakinahProgressGuard';
import { SakinahWaliGuard } from '@/features/sakinah/components/SakinahWaliGuard';
import logoGold from '@/assets/zaryah-logo-gold.png';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const SignupPage = lazy(() => import('@/features/auth/pages/SignupPage'));
const ProfileSettingsPage = lazy(() =>
  import('@/features/profile/pages/ProfileSettingsPage').then((m) => ({ default: m.ProfileSettingsPage }))
);
const HelpSupportPage = lazy(() =>
  import('@/features/profile/pages/HelpSupportPage').then((m) => ({ default: m.HelpSupportPage }))
);
const AboutPage = lazy(() =>
  import('@/features/profile/pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const RayaMemoryPage = lazy(() =>
  import('@/features/profile/pages/RayaMemoryPage').then((m) => ({ default: m.RayaMemoryPage }))
);
const QuickKycPage = lazy(() =>
  import('@/features/kyc/pages/QuickKycPage').then((m) => ({ default: m.QuickKycPage }))
);
const DeepKycPage = lazy(() =>
  import('@/features/kyc/pages/DeepKycPage').then((m) => ({ default: m.DeepKycPage }))
);
// Preview-only immersive Raya gateway homepage (boss's mockup). Additive — does
// not replace the live homepage at "/". To promote it later, swap the index
// route to render <RayaGatewayPage /> as a bare full-screen AuthGuard route.
const RayaGatewayPage = lazy(() =>
  import('@/features/raya-home/pages/RayaGatewayPage').then((m) => ({ default: m.RayaGatewayPage }))
);
// Preview of the cosmic-redesigned dashboard (gateway aesthetic, full-bleed).
const DashboardCosmicPage = lazy(() =>
  import('@/features/raya-home/pages/DashboardCosmicPage').then((m) => ({ default: m.DashboardCosmicPage }))
);
const NotificationsPage = lazy(() =>
  import('@/features/notifications/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
const QuranHomePage = lazy(() =>
  import('@/features/quran/pages/QuranHomePage').then((m) => ({ default: m.QuranHomePage }))
);
const QuranReadingPage = lazy(() =>
  import('@/features/quran/pages/QuranReadingPage').then((m) => ({ default: m.QuranReadingPage }))
);
const QuranRecitationPage = lazy(() =>
  import('@/features/quran/pages/QuranRecitationPage').then((m) => ({ default: m.QuranRecitationPage }))
);
const QuranStreakPage = lazy(() =>
  import('@/features/quran/pages/QuranStreakPage').then((m) => ({ default: m.QuranStreakPage }))
);
const QuranBookmarksPage = lazy(() =>
  import('@/features/quran/pages/QuranBookmarksPage').then((m) => ({ default: m.QuranBookmarksPage }))
);
const QuranHifzPage = lazy(() =>
  import('@/features/quran/pages/QuranHifzPage').then((m) => ({ default: m.QuranHifzPage }))
);
const QuranMemorizePage = lazy(() =>
  import('@/features/quran/pages/QuranMemorizePage').then((m) => ({ default: m.QuranMemorizePage }))
);
const QuranTestPage = lazy(() =>
  import('@/features/quran/pages/QuranTestPage').then((m) => ({ default: m.QuranTestPage }))
);
const QuranProgressPage = lazy(() =>
  import('@/features/quran/pages/QuranProgressPage').then((m) => ({ default: m.QuranProgressPage }))
);
const QuranMushafPage = lazy(() =>
  import('@/features/quran/pages/QuranMushafPage').then((m) => ({ default: m.QuranMushafPage }))
);
const QuranConceptSearchPage = lazy(() =>
  import('@/features/quran/pages/QuranConceptSearchPage').then((m) => ({ default: m.QuranConceptSearchPage }))
);
const QuranResearchPage = lazy(() =>
  import('@/features/quran/pages/QuranResearchPage').then((m) => ({ default: m.QuranResearchPage }))
);
const QuranLearningTracksPage = lazy(() =>
  import('@/features/quran/pages/QuranLearningTracksPage').then((m) => ({ default: m.QuranLearningTracksPage }))
);
const QuranLearningTrackDetailPage = lazy(() =>
  import('@/features/quran/pages/QuranLearningTrackDetailPage').then((m) => ({ default: m.QuranLearningTrackDetailPage }))
);
const QuranDailyAyahPage = lazy(() =>
  import('@/features/quran/pages/QuranDailyAyahPage').then((m) => ({ default: m.QuranDailyAyahPage }))
);
const QuranHifzCirclesPage = lazy(() =>
  import('@/features/quran/pages/QuranHifzCirclesPage').then((m) => ({ default: m.QuranHifzCirclesPage }))
);
const QuranHifzCircleDetailPage = lazy(() =>
  import('@/features/quran/pages/QuranHifzCircleDetailPage').then((m) => ({ default: m.QuranHifzCircleDetailPage }))
);
const QuranHifzCircleJoinPage = lazy(() =>
  import('@/features/quran/pages/QuranHifzCircleJoinPage').then((m) => ({ default: m.QuranHifzCircleJoinPage }))
);
const QuranRecitationDiaryPage = lazy(() =>
  import('@/features/quran/pages/QuranRecitationDiaryPage').then((m) => ({ default: m.QuranRecitationDiaryPage }))
);
const QuranGuessAyahPage = lazy(() =>
  import('@/features/quran/pages/QuranGuessAyahPage').then((m) => ({ default: m.QuranGuessAyahPage }))
);
const QuranTajweedPracticePage = lazy(() =>
  import('@/features/quran/pages/QuranTajweedPracticePage').then((m) => ({ default: m.QuranTajweedPracticePage }))
);
const QuranWorkspacePage = lazy(() =>
  import('@/features/quran/pages/QuranWorkspacePage').then((m) => ({ default: m.QuranWorkspacePage }))
);
const QuranWorkspaceEditorPage = lazy(() =>
  import('@/features/quran/pages/QuranWorkspaceEditorPage').then((m) => ({ default: m.QuranWorkspaceEditorPage }))
);
const QuranXrayPage = lazy(() =>
  import('@/features/quran/pages/QuranXrayPage').then((m) => ({ default: m.QuranXrayPage }))
);
const QuranDepthFaqsPage = lazy(() =>
  import('@/features/quran/pages/QuranDepthFaqsPage').then((m) => ({ default: m.QuranDepthFaqsPage }))
);
const QuranSurahQuizPage = lazy(() =>
  import('@/features/quran/pages/QuranSurahQuizPage').then((m) => ({ default: m.QuranSurahQuizPage }))
);
// ChatbotPage is retired — the Raya gateway (/raya-gateway) is now the single
// full chat surface. /ai-assistant redirects there (see AiAssistantRedirect),
// forwarding any { initialMessage, companionId, quranAnchor, newChat } nav state.
const SharedQuietReportPage = lazy(() =>
  import('@/features/barakah-labs/pages/SharedQuietReportPage').then((m) => ({ default: m.SharedQuietReportPage }))
);
const SettingsPage = lazy(() =>
  import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
// KycPage removed — replaced by QuickKycPage + DeepKycPage
const WalletPage = lazy(() =>
  import('@/features/wallet/pages/WalletPage').then((m) => ({ default: m.WalletPage }))
);
// DebtRestructuringPage — Coming Soon
const HalaqahPage = lazy(() =>
  import('@/features/halaqah/pages/HalaqahPage').then((m) => ({ default: m.HalaqahPage }))
);
const HalaqahPublicEventPage = lazy(() =>
  import('@/features/halaqah/pages/HalaqahPublicEventPage').then((m) => ({ default: m.HalaqahPublicEventPage }))
);
const NotificationSettingsPage = lazy(() =>
  import('@/features/settings/pages/NotificationSettingsPage').then((m) => ({ default: m.NotificationSettingsPage }))
);
const RayaHubPage = lazy(() =>
  import('@/features/raya-hub/pages/RayaHubPage').then((m) => ({ default: m.RayaHubPage }))
);
// MatrimonyPage — Sakinah
const MatrimonyPage = lazy(() =>
  import('@/features/matrimony/pages/MatrimonyPage').then((m) => ({ default: m.MatrimonyPage }))
);
// Sakinah feature pages — all routes live under /matrimony/*
const SakinahWelcomePage = lazy(() => import('@/features/sakinah/pages/SakinahWelcomePage').then(m => ({ default: m.SakinahWelcomePage })));
const SakinahBeginGentlyPage = lazy(() => import('@/features/sakinah/pages/SakinahBeginGentlyPage').then(m => ({ default: m.SakinahBeginGentlyPage })));
const SakinahRolePage = lazy(() => import('@/features/sakinah/pages/SakinahRolePage').then(m => ({ default: m.SakinahRolePage })));
const SakinahRoleSelectionPage = lazy(() => import('@/features/sakinah/pages/SakinahRoleSelectionPage').then(m => ({ default: m.SakinahRoleSelectionPage })));
const SakinahRegisterPage = lazy(() => import('@/features/sakinah/pages/SakinahRegisterPage').then(m => ({ default: m.SakinahRegisterPage })));
const SakinahKycPage = lazy(() => import('@/features/sakinah/pages/SakinahKycPage').then(m => ({ default: m.SakinahKycPage })));
const SakinahProfileCreationPage = lazy(() => import('@/features/sakinah/pages/SakinahProfileCreationPage').then(m => ({ default: m.SakinahProfileCreationPage })));
const SakinahPreferencesPage = lazy(() => import('@/features/sakinah/pages/SakinahPreferencesPage').then(m => ({ default: m.SakinahPreferencesPage })));
const SakinahReviewPage = lazy(() => import('@/features/sakinah/pages/SakinahReviewPage').then(m => ({ default: m.SakinahReviewPage })));
const SakinahDashboardPage = lazy(() => import('@/features/sakinah/pages/SakinahDashboardPage').then(m => ({ default: m.SakinahDashboardPage })));
const SakinahChatPage = lazy(() => import('@/features/sakinah/pages/SakinahChatPage').then(m => ({ default: m.SakinahChatPage })));
const SakinahMatchesPage = lazy(() => import('@/features/sakinah/pages/SakinahMatchesPage').then(m => ({ default: m.SakinahMatchesPage })));
const SakinahCandidatePage = lazy(() => import('@/features/sakinah/pages/SakinahCandidatePage').then(m => ({ default: m.SakinahCandidatePage })));
const SakinahInterestsPage = lazy(() => import('@/features/sakinah/pages/SakinahInterestsPage').then(m => ({ default: m.SakinahInterestsPage })));
const SakinahSavedPage = lazy(() => import('@/features/sakinah/pages/SakinahSavedPage').then(m => ({ default: m.SakinahSavedPage })));
const SakinahViewsPage = lazy(() => import('@/features/sakinah/pages/SakinahViewsPage').then(m => ({ default: m.SakinahViewsPage })));
const SakinahLogoutPage = lazy(() => import('@/features/sakinah/pages/SakinahLogoutPage').then(m => ({ default: m.SakinahLogoutPage })));
const SakinahNotificationsPage = lazy(() => import('@/features/sakinah/pages/SakinahNotificationsPage').then(m => ({ default: m.SakinahNotificationsPage })));
const SakinahSettingsPage = lazy(() => import('@/features/sakinah/pages/SakinahSettingsPage').then(m => ({ default: m.SakinahSettingsPage })));
const SakinahSupportPage = lazy(() => import('@/features/sakinah/pages/SakinahSupportPage').then(m => ({ default: m.SakinahSupportPage })));
const SakinahWaliSetupPage = lazy(() => import('@/features/sakinah/pages/SakinahWaliSetupPage').then(m => ({ default: m.SakinahWaliSetupPage })));
const SakinahLoginPage = lazy(() => import('@/features/sakinah/pages/SakinahLoginPage').then(m => ({ default: m.SakinahLoginPage })));


// TiswaPage — Coming Soon
const BarkaLabsPage = lazy(() =>
  import('@/features/barakah-labs/pages/BarakahLabsRoot').then((m) => ({ default: m.BarakahLabsRoot }))
);
const SharedConversationPage = lazy(() =>
  import('@/features/chatbot/pages/SharedConversationPage').then((m) => ({ default: m.SharedConversationPage }))
);
const PublicProfilePage = lazy(() => import('@/features/public-profile/pages/PublicProfilePage'));
const ConnectionsPage = lazy(() => import('@/features/connections/pages/ConnectionsPage'));
const ConversationsPage = lazy(() => import('@/features/dms/pages/ConversationsPage'));
const ChatPage = lazy(() => import('@/features/dms/pages/ChatPage'));
const LinkedInCallbackPage = lazy(() =>
  import('@/features/auth/pages/LinkedInCallbackPage')
);
const LegalHubPage = lazy(() =>
  import('@/features/legal/pages/LegalHubPage').then((m) => ({ default: m.LegalHubPage }))
);
const PrivacyPolicyPage = lazy(() =>
  import('@/features/legal/pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsOfServicePage = lazy(() =>
  import('@/features/legal/pages/TermsOfServicePage').then((m) => ({ default: m.TermsOfServicePage }))
);
const DisclaimersPage = lazy(() =>
  import('@/features/legal/pages/DisclaimersPage').then((m) => ({ default: m.DisclaimersPage }))
);
const DataDeletionPage = lazy(() =>
  import('@/features/legal/pages/DataDeletionPage').then((m) => ({ default: m.DataDeletionPage }))
);
// EIM — Ethical Investment Mentor
const EimHomePage = lazy(() =>
  import('@/features/eim/pages/EimHomePage').then((m) => ({ default: m.EimHomePage }))
);
const EimLibraryPage = lazy(() =>
  import('@/features/eim/pages/EimLibraryPage').then((m) => ({ default: m.EimLibraryPage }))
);
const EimLevelPage = lazy(() =>
  import('@/features/eim/pages/EimLevelPage').then((m) => ({ default: m.EimLevelPage }))
);
const EimLessonPage = lazy(() =>
  import('@/features/eim/pages/EimLessonPage').then((m) => ({ default: m.EimLessonPage }))
);
const EimPracticePage = lazy(() =>
  import('@/features/eim/pages/EimPracticePage').then((m) => ({ default: m.EimPracticePage }))
);
const EimSimulatorPage = lazy(() =>
  import('@/features/eim/pages/EimSimulatorPage').then((m) => ({ default: m.EimSimulatorPage }))
);
const EimTimeMachinePage = lazy(() =>
  import('@/features/eim/pages/EimTimeMachinePage').then((m) => ({ default: m.EimTimeMachinePage }))
);
const EimStrategyComparatorPage = lazy(() =>
  import('@/features/eim/pages/EimStrategyComparatorPage').then((m) => ({ default: m.EimStrategyComparatorPage }))
);
const EimScenarioLabPage = lazy(() =>
  import('@/features/eim/pages/EimScenarioLabPage').then((m) => ({ default: m.EimScenarioLabPage }))
);
const EimProjectionPage = lazy(() =>
  import('@/features/eim/pages/EimProjectionPage').then((m) => ({ default: m.EimProjectionPage }))
);
const EimPortfolioPage = lazy(() =>
  import('@/features/eim/pages/EimPortfolioPage').then((m) => ({ default: m.EimPortfolioPage }))
);
const EimMentorPage = lazy(() =>
  import('@/features/eim/pages/EimMentorPage').then((m) => ({ default: m.EimMentorPage }))
);
const EimAnalysisPage = lazy(() =>
  import('@/features/eim/pages/EimAnalysisPage').then((m) => ({ default: m.EimAnalysisPage }))
);
const EimChatHistoryPage = lazy(() =>
  import('@/features/eim/pages/EimChatHistoryPage').then((m) => ({
    default: m.EimChatHistoryPage,
  }))
);
const EimPlaybookPage = lazy(() =>
  import('@/features/eim/pages/EimPlaybookPage').then((m) => ({ default: m.EimPlaybookPage }))
);
const EimCandlesticksPage = lazy(() =>
  import('@/features/eim/pages/EimCandlesticksPage').then((m) => ({ default: m.EimCandlesticksPage }))
);
const EimCandlestickPatternPage = lazy(() =>
  import('@/features/eim/pages/EimCandlestickPatternPage').then((m) => ({ default: m.EimCandlestickPatternPage }))
);
const EimPatternLabPage = lazy(() =>
  import('@/features/eim/pages/EimPatternLabPage').then((m) => ({ default: m.EimPatternLabPage }))
);
const EimScholarFAQsPage = lazy(() =>
  import('@/features/eim/pages/EimScholarFAQsPage').then((m) => ({ default: m.EimScholarFAQsPage }))
);
const EimScreenPage = lazy(() =>
  import('@/features/eim/pages/EimScreenPage').then((m) => ({ default: m.EimScreenPage }))
);
const EimNewsPage = lazy(() =>
  import('@/features/eim/pages/EimNewsPage').then((m) => ({ default: m.EimNewsPage }))
);
const EimUlamaPage = lazy(() =>
  import('@/features/eim/pages/EimUlamaPage').then((m) => ({ default: m.EimUlamaPage }))
);
// EIM Mirror (EIM Phase F1) — premium-only behavioural-finance self-audit.
// Gated end-to-end on VITE_ENABLE_EIM_MIRROR; routes only register when on.
const EimMirrorPage = lazy(() =>
  import('@/features/eim/pages/EimMirrorPage').then((m) => ({ default: m.EimMirrorPage }))
);
const EimMirrorUploadPage = lazy(() =>
  import('@/features/eim/pages/EimMirrorUploadPage').then((m) => ({ default: m.EimMirrorUploadPage }))
);
const EimMirrorReportPage = lazy(() =>
  import('@/features/eim/pages/EimMirrorReportPage').then((m) => ({ default: m.EimMirrorReportPage }))
);
const EimMirrorPreviewPage = lazy(() =>
  import('@/features/eim/pages/EimMirrorPreviewPage').then((m) => ({ default: m.EimMirrorPreviewPage }))
);
// Halal Trading (EIM v2, T1 read-only terminal) — the separate "Halal Trading"
// product section (Model A / A1). Read-only: no KYC gate in v1.

// AEBCD onboarding — Stage A marketing landing at /welcome.
const StageALanding = lazy(() => import('@/features/onboarding/pages/StageALanding'));

/**
 * Feature flag — EIM Mirror (EIM F1). Reads `VITE_ENABLE_EIM_MIRROR`
 * exactly once at module load. Per master plan §F1.0 prereq #1, Mirror must
 * not be visible to free users until paid tier (F4) ships, so the routes
 * (and the sidebar entry in _constants.ts) are conditionally registered.
 * Flip via `.env.local` or your CI env to enable on dev/staging.
 */
import { EIM_MIRROR_ENABLED } from './flags';
/**
 * /ai-assistant → /raya-gateway redirect. The gateway is now the single Raya
 * chat surface, so every legacy caller (sidebar, Quran panels, onboarding, home,
 * profile…) keeps working — we forward their nav state and query string verbatim
 * so { initialMessage, companionId, quranAnchor, newChat } and ?companion= etc.
 * still land correctly.
 */
function AiAssistantRedirect() {
  const location = useLocation();
  return (
    <Navigate
      to={{ pathname: '/raya-gateway', search: location.search }}
      state={location.state}
      replace
    />
  );
}

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E16]">
      <div className="flex flex-col items-center gap-4">
        <img
          src={logoGold}
          alt="ZaryahPlus logo"
          className="w-12 h-12 object-contain animate-pulse"
        />
        <p className="text-[#D4A853] text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Phase 5 — per-route skeleton fallbacks for KYC + wallet. Generic
// "Loading…" spinner is fine for low-friction pages, but KYC/wallet
// are slow to first render (large form + Firebase reads) and the
// abrupt content shift when the chunk lands feels janky. A skeleton
// that approximates the shape of the page reduces perceived load time
// and gives the user something to focus on while the chunk fetches.

function KycSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0E16] px-4 pt-8 pb-16">
      <div className="max-w-md mx-auto space-y-6 animate-pulse">
        {/* Header bar */}
        <div className="h-2 bg-[rgba(212,168,83,0.15)] rounded-full" />
        {/* Title */}
        <div className="h-6 bg-[rgba(212,168,83,0.18)] rounded w-3/4" />
        <div className="h-4 bg-[rgba(212,168,83,0.10)] rounded w-1/2" />
        {/* Form fields */}
        <div className="space-y-5 pt-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-[rgba(212,168,83,0.10)] rounded w-1/3" />
              <div className="h-11 bg-[#0D1016]/75 backdrop-blur-md rounded-xl border border-[rgba(212,168,83,0.15)]" />
            </div>
          ))}
        </div>
        {/* CTA */}
        <div className="h-12 bg-[rgba(212,168,83,0.20)] rounded-xl mt-8" />
      </div>
    </div>
  );
}

function WalletSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0E16] px-4 pt-6 pb-16">
      <div className="max-w-md mx-auto space-y-6 animate-pulse">
        {/* Balance hero card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0D1016] to-[#0A0E16] border border-[rgba(212,168,83,0.2)]">
          <div className="h-3 bg-[rgba(212,168,83,0.15)] rounded w-1/4 mb-3" />
          <div className="h-10 bg-[rgba(212,168,83,0.25)] rounded w-1/2 mb-2" />
          <div className="h-3 bg-[rgba(212,168,83,0.10)] rounded w-1/3" />
        </div>
        {/* Action buttons row */}
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 h-20 bg-[#0D1016]/75 backdrop-blur-md rounded-xl border border-[rgba(212,168,83,0.15)]" />
          ))}
        </div>
        {/* Recent transactions list */}
        <div className="space-y-3 pt-2">
          <div className="h-4 bg-[rgba(212,168,83,0.15)] rounded w-1/3" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-[#0D1016]/75 backdrop-blur-md border border-[rgba(212,168,83,0.10)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(212,168,83,0.15)]" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-[rgba(212,168,83,0.15)] rounded w-2/3" />
                <div className="h-3 bg-[rgba(212,168,83,0.08)] rounded w-1/3" />
              </div>
              <div className="h-3 w-12 bg-[rgba(212,168,83,0.15)] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Wrap lazy components with Suspense. The optional `fallback` prop
// lets specific routes use a tailored skeleton instead of the generic
// pulse-logo loader.
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

// Global error boundary for route-level crashes (e.g. Firestore assertion errors)
function RootErrorBoundary() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : String(error);
  const isFirestoreError = message.includes('INTERNAL ASSERTION FAILED');

  // Auto-heal a Firestore assertion that reached render: clear the corrupt
  // cache (auth preserved) and reload, without making the user click anything.
  // recoverFromFirestoreError() no-ops inside its cooldown — so a fault that
  // keeps recurring stops looping and falls through to the screen below.
  const [autoHealing] = useState(() => isFirestoreError && !recentlyRecovered());
  useEffect(() => {
    if (autoHealing) void recoverFromFirestoreError();
  }, [autoHealing]);

  // While the auto-reload is in flight, show a neutral spinner — not the scary
  // "clear your browser data" copy.
  if (autoHealing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E16] px-4">
        <img src={logoGold} alt="ZaryahPlus" className="w-16 h-16 object-contain animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E16] px-4">
      <div className="text-center max-w-md">
        <img src={logoGold} alt="ZaryahPlus" className="w-16 h-16 mx-auto mb-6 object-contain" />
        <h1 className="text-xl font-bold text-[#F5E8C7] mb-3">Something went wrong</h1>
        <p className="text-[#7A7363] text-sm mb-6 text-left overflow-auto max-h-[300px] bg-black/50 p-4 rounded">
          <strong className="text-red-400 font-mono block mb-2">{message}</strong>
          <span className="font-mono text-xs opacity-70 whitespace-pre-wrap">{error instanceof Error ? error.stack : ''}</span>
        </p>
        <button
          onClick={() => {
            if (isFirestoreError) {
              // Manual fallback (only reachable after the auto-heal cooldown):
              // clear corrupt cache but NEVER the Firebase Auth session DB —
              // wiping that signs the user out and forces a re-login.
              const PRESERVE = 'firebaseLocalStorageDb';
              const deleteCaches = indexedDB.databases?.().then((dbs) =>
                dbs.forEach((d) => {
                  if (d.name && d.name !== PRESERVE) indexedDB.deleteDatabase(d.name);
                })
              ) ?? Promise.resolve();
              // Reload only after deletions are requested so the SDK re-inits clean.
              deleteCaches.finally(() => { window.location.href = '/'; });
              return;
            }
            window.location.href = '/';
          }}
          className="px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16]"
        >
          {isFirestoreError ? 'Clear Cache & Reload' : 'Reload App'}
        </button>
      </div>
    </div>
  );
}

// Create browser router with routes
export const router = createBrowserRouter([
  // Public routes (no layout shell) — invite-gated.
  // Phase 5 — every public route gets `errorElement: <RootErrorBoundary />`
  // so a render-time crash in (e.g.) the share page or LinkedIn callback
  // shows our recovery UI instead of a blank screen.
  {
    path: '/login',
    element: <LazyPage Component={LoginPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/signup',
    element: <InviteGate><LazyPage Component={SignupPage} /></InviteGate>,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/welcome',
    element: <InviteGate><LazyPage Component={StageALanding} /></InviteGate>,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/share/:id',
    element: <LazyPage Component={SharedConversationPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    // Public viewer for a Barakah Labs Quiet Report shared by another user.
    // No auth required.
    path: '/quiet-report/share/:token',
    element: <LazyPage Component={SharedQuietReportPage} />,
    errorElement: <RootErrorBoundary />,
  },
  // Backwards-compat: old /p/:slug links (including previously-shared QR codes)
  // still resolve to the same page.
  {
    path: '/p/:slug',
    element: <LazyPage Component={PublicProfilePage} />,
    errorElement: <RootErrorBoundary />,
  },
  // Handle-style URLs: /@umar. We route these through a single-segment
  // dynamic param that captures the leading "@" as part of the value, then
  // strip it inside PublicProfilePage. This avoids the literal-plus-dynamic
  // segment pattern (/@:slug) that some routers parse inconsistently.
  {
    path: '/:atHandle',
    element: <LazyPage Component={PublicProfilePage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/auth/linkedin/callback',
    element: <LazyPage Component={LinkedInCallbackPage} />,
    errorElement: <RootErrorBoundary />,
  },

  // Legal routes (public — accessible from signup/about without auth)
  {
    path: '/legal',
    element: <LazyPage Component={LegalHubPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/legal/privacy',
    element: <LazyPage Component={PrivacyPolicyPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/legal/terms',
    element: <LazyPage Component={TermsOfServicePage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/legal/disclaimers',
    element: <LazyPage Component={DisclaimersPage} />,
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/legal/data-deletion',
    element: <LazyPage Component={DataDeletionPage} />,
    errorElement: <RootErrorBoundary />,
  },

  // Legacy demo redirects
  {
    path: '/demo/barakah-labs',
    element: <Navigate to="/barakah-labs" replace />,
  },
  {
    path: '/demo/barka-labs',
    element: <Navigate to="/barakah-labs" replace />,
  },
  {
    path: '/barka-labs',
    element: <Navigate to="/cyb" replace />,
  },

  // Public landing → the Raya gateway is the first thing visitors see at the
  // root domain (zaryahplus.com), instead of the sign-in page. Guests get the
  // calm hero with Sign in / Sign up in the corner; the page itself routes any
  // action that needs an account to signup.
  {
    index: true,
    element: <Navigate to="/matrimony" replace />,
  },

  // Raya gateway — the home + full chat surface. Public-facing: guests see it
  // (guestPlaceholder), authenticated users get the live chat. Wrapping in
  // AuthGuard (rather than dropping it) keeps the KYC redirect for logged-in
  // Tier-0 users intact; guests skip straight to the placeholder.
  {
    path: '/raya-gateway',
    element: (
      <AuthGuard guestPlaceholder={<LazyPage Component={RayaGatewayPage} />}>
        <LazyPage Component={RayaGatewayPage} />
      </AuthGuard>
    ),
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/quick-kyc',
    element: (
      <AuthGuard skipKycCheck>
        <LazyPage Component={QuickKycPage} fallback={<KycSkeleton />} />
      </AuthGuard>
    ),
    errorElement: <RootErrorBoundary />,
  },
  {
    path: '/deep-kyc',
    element: (
      <AuthGuard skipKycCheck>
        <LazyPage Component={DeepKycPage} fallback={<KycSkeleton />} />
      </AuthGuard>
    ),
    errorElement: <RootErrorBoundary />,
  },

  // Admin — completely separate gateway

  // Authenticated routes with MainLayout (sidebar + bottom nav)
  {
    errorElement: <RootErrorBoundary />,
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      // (The landing index lives as a public route above so guests reach the
      // Raya gateway without being bounced to /login. The dashboard remains
      // available at /dashboard.)
      { path: 'dashboard', element: <LazyPage Component={DashboardCosmicPage} /> },
      { path: 'profile', element: <LazyPage Component={ProfileSettingsPage} /> },
      { path: 'profile/memory', element: <LazyPage Component={RayaMemoryPage} /> },
      { path: 'user-overview', element: <Navigate to="/profile" replace /> },
      { path: 'help', element: <LazyPage Component={HelpSupportPage} /> },
      { path: 'about', element: <LazyPage Component={AboutPage} /> },
      { path: 'notifications', element: <LazyPage Component={NotificationsPage} /> },
      { path: 'connections', element: <LazyPage Component={ConnectionsPage} /> },
      { path: 'messages', element: <LazyPage Component={ConversationsPage} /> },
      { path: 'messages/:convId', element: <LazyPage Component={ChatPage} /> },
      // Feature routes — gated features wrapped with DeepKycGuard
      { path: 'ai-assistant', element: <AiAssistantRedirect /> },
      { path: 'debt', element: <ComingSoonPage featureId="debt-restructuring" /> },
      { path: 'barka-labs', element: <Navigate to="/barakah-labs" replace /> },
      { path: 'barakah-labs', element: <LazyPage Component={BarkaLabsPage} /> },
      { path: 'quran', element: <LazyPage Component={QuranHomePage} /> },
      { path: 'quran/read', element: <LazyPage Component={QuranReadingPage} /> },
      { path: 'quran/recitation', element: <LazyPage Component={QuranRecitationPage} /> },
      { path: 'quran/streak', element: <LazyPage Component={QuranStreakPage} /> },
      { path: 'quran/bookmarks', element: <LazyPage Component={QuranBookmarksPage} /> },
      { path: 'quran/hifz', element: <LazyPage Component={QuranHifzPage} /> },
      { path: 'quran/hifz/memorize', element: <LazyPage Component={QuranMemorizePage} /> },
      { path: 'quran/hifz/test', element: <LazyPage Component={QuranTestPage} /> },
      { path: 'quran/hifz/progress', element: <LazyPage Component={QuranProgressPage} /> },
      { path: 'quran/mushaf', element: <LazyPage Component={QuranMushafPage} /> },
      { path: 'quran/search', element: <LazyPage Component={QuranConceptSearchPage} /> },
      { path: 'quran/research', element: <LazyPage Component={QuranResearchPage} /> },
      { path: 'quran/tracks', element: <LazyPage Component={QuranLearningTracksPage} /> },
      { path: 'quran/tracks/:trackId', element: <LazyPage Component={QuranLearningTrackDetailPage} /> },
      { path: 'quran/daily-ayah', element: <LazyPage Component={QuranDailyAyahPage} /> },
      { path: 'quran/hifz/circles', element: <LazyPage Component={QuranHifzCirclesPage} /> },
      { path: 'quran/hifz/circles/join', element: <LazyPage Component={QuranHifzCircleJoinPage} /> },
      { path: 'quran/hifz/circles/:circleId', element: <LazyPage Component={QuranHifzCircleDetailPage} /> },
      { path: 'quran/recitation/diary', element: <LazyPage Component={QuranRecitationDiaryPage} /> },
      { path: 'quran/guess-ayah', element: <LazyPage Component={QuranGuessAyahPage} /> },
      { path: 'quran/tajweed-practice', element: <LazyPage Component={QuranTajweedPracticePage} /> },
      { path: 'quran/workspace', element: <LazyPage Component={QuranWorkspacePage} /> },
      { path: 'quran/workspace/:id', element: <LazyPage Component={QuranWorkspaceEditorPage} /> },
      { path: 'quran/surah/:id/xray', element: <LazyPage Component={QuranXrayPage} /> },
      { path: 'quran/surah/:id/depth-faqs', element: <LazyPage Component={QuranDepthFaqsPage} /> },
      { path: 'quran/surah/:id/quiz', element: <LazyPage Component={QuranSurahQuizPage} /> },
      { path: 'settings', element: <LazyPage Component={SettingsPage} /> },
      { path: 'shark-tank', element: <ComingSoonPage featureId="shark-tank" /> },
      { path: 'halal-intimacy', element: <ComingSoonPage featureId="halal-intimacy" /> },
      { path: 'wallet', element: <DeepKycGuard><LazyPage Component={WalletPage} fallback={<WalletSkeleton />} /></DeepKycGuard> },
      { path: 'networking', element: <Navigate to="/connections" replace /> },
      { path: 'halaqah', element: <ComingSoonWrapper><LazyPage Component={HalaqahPage} /></ComingSoonWrapper> },
      { path: 'halaqah/event/:eventId', element: <LazyPage Component={HalaqahPublicEventPage} /> },
      { path: 'settings/notifications', element: <LazyPage Component={NotificationSettingsPage} /> },
      { path: 'raya', element: <LazyPage Component={RayaHubPage} /> },
      { path: 'tiswa', element: <ComingSoonPage featureId="tiswa" /> },
      // EIM — Ethical Investment Mentor now lives in its own full-screen EimShell
      // mini-app (see the dedicated route group below). Routes moved out of
      // MainLayout per zaryah-brain/projects/eim-mvp-redesign.md (Phase 1).
      // Halal Trading (EIM v2, T1) — read-only terminal, no KYC gate in v1.
    ],
  },

  // Sakinah (Matrimony) — full-screen mini-app wrapped in OnboardingProvider context.
  // SakinahProviders is a layout route (renders <Outlet />) that injects the provider
  // so every /matrimony/* page can call useOnboarding() without crashing.
  {
    path: 'matrimony',
    element: <SakinahProviders />,
    errorElement: <RootErrorBoundary />,
    children: [
      { index: true, element: <LazyPage Component={MatrimonyPage} /> },
      { path: 'begin', element: <LazyPage Component={SakinahBeginGentlyPage} /> },
      { path: 'welcome', element: <LazyPage Component={SakinahWelcomePage} /> },
      { path: 'role', element: <LazyPage Component={SakinahRolePage} /> },
      { path: 'role-selection', element: <LazyPage Component={SakinahRoleSelectionPage} /> },
      { path: 'login', element: <LazyPage Component={SakinahLoginPage} /> },
      { path: 'logout', element: <LazyPage Component={SakinahLogoutPage} /> },
      { path: 'register', element: <LazyPage Component={SakinahRegisterPage} /> },
      { path: 'kyc', element: <LazyPage Component={SakinahKycPage} /> },
      { path: 'profile-creation', element: <LazyPage Component={SakinahProfileCreationPage} /> },
      { path: 'preferences', element: <LazyPage Component={SakinahPreferencesPage} /> },
      { path: 'review', element: <LazyPage Component={SakinahReviewPage} /> },
      // Gated/Protected Seeker Routes
      {
        element: <SakinahProgressGuard />,
        children: [
          { path: 'dashboard', element: <LazyPage Component={SakinahDashboardPage} /> },
          { path: 'wali-setup', element: <LazyPage Component={SakinahWaliSetupPage} /> },
          { path: 'chat', element: <LazyPage Component={SakinahChatPage} /> },
          { path: 'messages', element: <LazyPage Component={SakinahChatPage} /> },
          { path: 'matches', element: <LazyPage Component={SakinahMatchesPage} /> },
          { path: 'candidates/:candidateId', element: <LazyPage Component={SakinahCandidatePage} /> },
          { path: 'interests', element: <LazyPage Component={SakinahInterestsPage} /> },
          { path: 'saved', element: <LazyPage Component={SakinahSavedPage} /> },
          { path: 'views', element: <LazyPage Component={SakinahViewsPage} /> },
          { path: 'notifications', element: <LazyPage Component={SakinahNotificationsPage} /> },
          { path: 'settings', element: <LazyPage Component={SakinahSettingsPage} /> },
          { path: 'support', element: <LazyPage Component={SakinahSupportPage} /> },
        ],
      },
      // Gated/Protected Wali Routes
      {
        element: <SakinahWaliGuard />,
        children: [
          { path: 'wali-dashboard', element: <LazyPage Component={SakinahDashboardPage} /> },
          { path: 'wali-chat', element: <LazyPage Component={SakinahChatPage} /> },
          { path: 'wali-messages', element: <LazyPage Component={SakinahChatPage} /> },
          { path: 'wali-interests', element: <LazyPage Component={SakinahInterestsPage} /> },
          { path: 'wali-saved', element: <LazyPage Component={SakinahSavedPage} /> },
          { path: 'wali-views', element: <LazyPage Component={SakinahViewsPage} /> },
          { path: 'wali-notifications', element: <LazyPage Component={SakinahNotificationsPage} /> },
          { path: 'wali-support', element: <LazyPage Component={SakinahSupportPage} /> },
        ],
      },
    ],
  },
  // Admin Dashboard Stub
  {
    path: '/admin-dashboard',
    element: <ComingSoonPage title="Admin Dashboard" subtitle="Admin features are currently under development." />,
  },

  // EIM (Ethical Investment Mentor) — full-screen "mini-app". Lives in its own
  // EimShell (left rail on desktop / bottom tabs on mobile) OUTSIDE MainLayout,
  // so the global topbar/sidebar/orb are hidden while inside EIM. Exit is
  // explicit. See zaryah-brain/projects/eim-mvp-redesign.md (Phase 1).
  // DeepKycGuard gates + the EIM_MIRROR_ENABLED conditional are preserved.
  {
    errorElement: <RootErrorBoundary />,
    element: (
      <AuthGuard>
        <EimShell />
      </AuthGuard>
    ),
    children: [
      { path: 'eim', element: <LazyPage Component={EimHomePage} /> },
      { path: 'eim/library', element: <LazyPage Component={EimLibraryPage} /> },
      { path: 'eim/library/:levelId', element: <LazyPage Component={EimLevelPage} /> },
      { path: 'eim/lesson/:lessonId', element: <LazyPage Component={EimLessonPage} /> },
      // Practice hub is an ungated, browseable grid; each tool route below
      // keeps its own DeepKycGuard so the gate applies on tool entry.
      { path: 'eim/practice', element: <LazyPage Component={EimPracticePage} /> },
      // Simulator surfaces are financial features — gated behind Deep KYC
      // (build-spec P2-3.a security checklist; W6). Dynamic routes pass an
      // explicit featureName since the static pathname lookup won't match.
      { path: 'eim/simulator', element: <DeepKycGuard featureName="EIM Simulator"><LazyPage Component={EimSimulatorPage} /></DeepKycGuard> },
      { path: 'eim/time-machine', element: <DeepKycGuard featureName="EIM Time Machine"><LazyPage Component={EimTimeMachinePage} /></DeepKycGuard> },
      { path: 'eim/time-machine/:sessionId', element: <DeepKycGuard featureName="EIM Time Machine"><LazyPage Component={EimTimeMachinePage} /></DeepKycGuard> },
      { path: 'eim/strategy-comparator', element: <DeepKycGuard featureName="Strategy Comparator"><LazyPage Component={EimStrategyComparatorPage} /></DeepKycGuard> },
      { path: 'eim/scenario-lab', element: <DeepKycGuard featureName="Scenario Lab"><LazyPage Component={EimScenarioLabPage} /></DeepKycGuard> },
      { path: 'eim/projection', element: <DeepKycGuard featureName="Projection"><LazyPage Component={EimProjectionPage} /></DeepKycGuard> },
      { path: 'eim/portfolio/:portfolioId', element: <DeepKycGuard featureName="EIM Portfolio"><LazyPage Component={EimPortfolioPage} /></DeepKycGuard> },
      { path: 'eim/mentor', element: <LazyPage Component={EimMentorPage} /> },
      { path: 'eim/analysis', element: <LazyPage Component={EimAnalysisPage} /> },
      { path: 'eim/history', element: <LazyPage Component={EimChatHistoryPage} /> },
      { path: 'eim/playbook/:playbookId', element: <LazyPage Component={EimPlaybookPage} /> },
      { path: 'eim/candlesticks', element: <LazyPage Component={EimCandlesticksPage} /> },
      { path: 'eim/candlesticks/:patternId', element: <LazyPage Component={EimCandlestickPatternPage} /> },
      { path: 'eim/pattern-lab', element: <LazyPage Component={EimPatternLabPage} /> },
      { path: 'eim/scholar-faqs', element: <LazyPage Component={EimScholarFAQsPage} /> },
      // Screen pillar — company compliance screener (wired to the in-house
      // Shariah screener). Ungated. /eim/ulama remains the scholar-views browser.
      { path: 'eim/screen', element: <LazyPage Component={EimScreenPage} /> },
      { path: 'eim/news', element: <LazyPage Component={EimNewsPage} /> },
      { path: 'eim/ulama', element: <LazyPage Component={EimUlamaPage} /> },
      // EIM Mirror — only registered when VITE_ENABLE_EIM_MIRROR=true.
      // When off, an authenticated user typing /eim/mirror hits the global
      // 404 → Navigate("/") fallback below.
      ...(EIM_MIRROR_ENABLED
        ? [
            { path: 'eim/mirror', element: <DeepKycGuard featureName="EIM Mirror"><LazyPage Component={EimMirrorPage} /></DeepKycGuard> },
            { path: 'eim/mirror/upload', element: <DeepKycGuard featureName="EIM Mirror"><LazyPage Component={EimMirrorUploadPage} /></DeepKycGuard> },
            { path: 'eim/mirror/preview', element: <DeepKycGuard featureName="EIM Mirror"><LazyPage Component={EimMirrorPreviewPage} /></DeepKycGuard> },
            { path: 'eim/mirror/report', element: <DeepKycGuard featureName="EIM Mirror"><LazyPage Component={EimMirrorReportPage} /></DeepKycGuard> },
          ]
        : []),
    ],
  },

  // 404 - Redirect to home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
