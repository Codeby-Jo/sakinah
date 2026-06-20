/**
 * sakinahProgress.ts
 * 
 * Single source of truth for the Sakinah onboarding progress state.
 * Persisted to localStorage under PROGRESS_KEY.
 *
 * getNextRoute() is the key function — it returns the URL the user should be
 * redirected to based on which step they last completed.
 *
 * STEP ORDER:
 *   1. Role Selection   → /matrimony/role
 *   2. Account Setup    → /matrimony/register
 *   3. KYC              → /matrimony/kyc
 *   4. Profile Basics   → /matrimony/profile-creation
 *   5. Preferences      → /matrimony/preferences
 *   6. Review           → /matrimony/review
 *   7. Dashboard        → /matrimony/dashboard  (all complete)
 */

export const PROGRESS_KEY = 'sakinah_progress';

export interface SakinahProgress {
  role: 'SEEKER' | 'LOOKING_FOR_SOMEONE_ELSE' | 'WALI_VIEW' | 'ADMIN' | null;
  account_completed: boolean;
  kyc_completed: boolean;
  profile_completed: boolean;
  preferences_completed: boolean;
  review_completed: boolean;
}

const DEFAULT_PROGRESS: SakinahProgress = {
  role: null,
  account_completed: false,
  kyc_completed: false,
  profile_completed: false,
  preferences_completed: false,
  review_completed: false,
};

/** Read current progress from localStorage. */
export function getProgress(): SakinahProgress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

/** Merge partial updates into progress and persist. */
export function setProgress(updates: Partial<SakinahProgress>): SakinahProgress {
  const current = getProgress();
  const next = { ...current, ...updates };
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  } catch {
    /* storage quota exceeded — ignore */
  }
  return next;
}

/** Clear ALL progress (called on logout / reset). */
export function clearProgress(): void {
  localStorage.removeItem(PROGRESS_KEY);
  // Also clear legacy keys from old implementation
  localStorage.removeItem('sakinah_token');
  localStorage.removeItem('sakinah_role');
  localStorage.removeItem('sakinah_onboarding_auth');
  localStorage.removeItem('sakinah_onboarding_profile');
  localStorage.removeItem('sakinah_onboarding_preferences');
  localStorage.removeItem('sakinah_onboarding_kyc');
  localStorage.removeItem('sakinah_onboarding_wali');
  localStorage.removeItem('sakinah_onboarding_kycCompleted');
  localStorage.removeItem('sakinah_wali_session');
}

/**
 * Returns the URL of the first incomplete onboarding step.
 * If all steps are complete → returns '/matrimony/dashboard'.
 *
 * This is the ONLY place that contains resume logic so it stays consistent.
 */
export function getNextRoute(progress?: SakinahProgress): string {
  const p = progress ?? getProgress();

  if (!p.role) return '/matrimony/role';
  if (p.role === 'WALI_VIEW') return '/matrimony/wali-dashboard';
  if (p.role === 'ADMIN') return '/admin-dashboard';
  
  if (!p.account_completed) return '/matrimony/register';
  if (!p.kyc_completed) return '/matrimony/kyc';
  if (!p.profile_completed) return '/matrimony/profile-creation';
  if (!p.preferences_completed) return '/matrimony/preferences';
  if (!p.review_completed) return '/matrimony/review';
  return '/matrimony/dashboard';
}

/** Returns true only when every step is complete (including review). */
export function isOnboardingComplete(progress?: SakinahProgress): boolean {
  const p = progress ?? getProgress();
  return (
    !!p.role &&
    p.account_completed &&
    p.kyc_completed &&
    p.profile_completed &&
    p.preferences_completed &&
    p.review_completed
  );
}
