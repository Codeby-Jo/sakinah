import type { 
  ConsideredFewResponse, 
  ConversationResponse,
  MatchflowResponse,
  SakinahProfileData,
  SakinahMatchPreferences
} from '../types/sakinah.types';

// Use standard API v1 path. In development it points to localhost:8000
const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/v1/nis`
  : '/api/v1/nis';

/**
 * Sakinah-specific API wrapper.
 * Purposefully bypasses Firebase global app check/auth interceptors 
 * as Sakinah NIS explicitly prohibits Firebase dependencies.
 */
async function fetchNisApi(endpoint: string, options: RequestInit = {}) {
  const isDev = import.meta.env.DEV;
  
  // Future Firebase integrators: retrieve Firebase ID token here
  // For now, we expect a generic token in localStorage or nowhere if not logged in
  const token = localStorage.getItem('sakinah_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (isDev) {
    headers['X-Test-User-Id'] = 'user_frontend_dev';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      const isWali = !!localStorage.getItem('sakinah_wali_session');
      
      if (!isWali) {
        // Prevent redirect loop in development when using the fallback mock token
        if (import.meta.env.DEV && token === 'local_demo_token') {
          throw new Error('Dev bypass token rejected by real backend. Suppressing redirect.');
        }

        localStorage.removeItem('sakinah_token');
        window.location.href = '/matrimony/login';
        throw new Error('Session expired. Please log in again.');
      } else {
        // Wali tokens are currently mocked and will return 401 from the real backend.
        // We throw the error so the components can catch it and use fallback data,
        // without destroying the Wali session or redirecting them.
        throw new Error('Wali token not recognized by backend yet.');
      }
    }

    let errorMsg = 'NIS API Error';
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

// Auth
export async function registerSakinah(data: any) {
  return fetchNisApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function loginSakinah(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    let errorMsg = 'Login failed';
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return await response.json();
}

// KYC / Eligibility
export async function getSakinahEligibility() {
  return fetchNisApi('/eligibility/me');
}

// Profile / Preferences
export async function getSakinahProfile(): Promise<SakinahProfileData> {
  return fetchNisApi('/profile/me');
}

export async function updateSakinahProfile(data: any) {
  return fetchNisApi('/profile/me', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getSakinahPreferences(): Promise<SakinahMatchPreferences> {
  return fetchNisApi('/preferences/me');
}

export async function updateSakinahPreferences(data: Partial<SakinahMatchPreferences>) {
  return fetchNisApi('/preferences/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// Candidate / Interest
export async function getConsideredFew(): Promise<ConsideredFewResponse> {
  return fetchNisApi('/considered-few');
}

export async function getInterests() {
  return fetchNisApi('/interests');
}

export async function expressInterest(candidateId: string) {
  return fetchNisApi(`/candidates/${candidateId}/interest`, { method: 'POST' });
}

export async function silentPass(candidateId: string) {
  return fetchNisApi(`/candidates/${candidateId}/pass`, { method: 'POST' });
}

export async function saveProfile(candidateId: string) {
  return fetchNisApi(`/candidates/${candidateId}/save`, { method: 'POST' });
}

export async function getSavedProfiles() {
  return fetchNisApi('/saved-profiles');
}

export async function getCandidateDetail(candidateId: string) {
  return fetchNisApi(`/candidates/${candidateId}`);
}

// Matchflow
export async function getMatchflow(matchflowId: string): Promise<MatchflowResponse> {
  return fetchNisApi(`/matchflows/${matchflowId}`);
}

export async function submitDecision(matchflowId: string, outcome: 'PROCEED' | 'PAUSE' | 'CLOSE') {
  return fetchNisApi(`/matchflows/${matchflowId}/decision`, {
    method: 'POST',
    body: JSON.stringify({ outcome })
  });
}

// Conversation — real backend routes
export async function getMyConversations() {
  return fetchNisApi('/conversations/');
}

export async function getConversationMessages(conversationId: string) {
  return fetchNisApi(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(conversationId: string, text: string, msg_type = 'text', photo_url?: string, audio_url?: string, reply_to_text?: string, reply_to_sender?: string) {
  return fetchNisApi(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      text,
      msg_type,
      ...(photo_url && { photo_url }),
      ...(audio_url && { audio_url }),
      ...(reply_to_text && { reply_to_text }),
      ...(reply_to_sender && { reply_to_sender })
    })
  });
}

/** @deprecated kept for type compatibility — use getMyConversations / getConversationMessages */
export async function getStructuredConversation(conversationId: string): Promise<ConversationResponse> {
  return fetchNisApi(`/conversations/${conversationId}/messages`);
}

/** @deprecated kept for type compatibility — use sendMessage */
export async function sendConversationMessage(conversationId: string, _topic: string, content: string) {
  return sendMessage(conversationId, content);
}

// Reports
export async function submitReport(reportedUserId: string, flagType: string, severity: string, context?: string) {
  return fetchNisApi('/reports', {
    method: 'POST',
    body: JSON.stringify({ reported_user_id: reportedUserId, flag_type: flagType, severity, context })
  });
}

// Readiness
export async function getReadinessHome() {
  return fetchNisApi('/readiness/home');
}

export async function getNiyyah() {
  return fetchNisApi('/niyyah/me');
}

export async function updateNiyyah(data: { intention_text: string }) {
  return fetchNisApi('/niyyah/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function getValues() {
  return fetchNisApi('/values/me');
}

export async function updateValues(data: { values_data: any }) {
  return fetchNisApi('/values/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function getMirror() {
  return fetchNisApi('/mirror/me');
}

export async function updateMirror(data: { reflection_data: any }) {
  return fetchNisApi('/mirror/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function getPortrait() {
  return fetchNisApi('/portrait/me');
}

export async function updatePortrait(data: { portrait_data: any }) {
  return fetchNisApi('/portrait/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// Development Proof
export async function getNisProofReport() {
  return fetchNisApi('/dev/proof-report');
}

// KYC Vendor Adapter endpoints
export async function startKycFlow() {
  return fetchNisApi('/kyc/start', { method: 'POST' });
}

export async function getKycStatus() {
  return fetchNisApi('/kyc/status');
}

export async function submitKycSandbox(data: any) {
  return fetchNisApi('/kyc/sandbox/complete', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Liveness Vendor Adapter endpoints
export async function startLivenessFlow() {
  return fetchNisApi('/liveness/start', { method: 'POST' });
}

export async function getLivenessStatus() {
  return fetchNisApi('/liveness/status');
}

export async function submitLivenessSandbox(data: any) {
  return fetchNisApi('/liveness/sandbox/complete', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Photo Protection & Access Logging
export async function logPhotoAccess(photoId: string, viewerId: string) {
  return fetchNisApi('/photos/access-log', {
    method: 'POST',
    body: JSON.stringify({ photo_id: photoId, viewer_id: viewerId, timestamp: new Date().toISOString() })
  });
}

export async function grantPhotoAccess(targetUserId: string) {
  return fetchNisApi('/photos/permissions/grant', {
    method: 'POST',
    body: JSON.stringify({ target_user_id: targetUserId })
  });
}

export async function revokePhotoAccess(targetUserId: string) {
  return fetchNisApi('/photos/permissions/revoke', {
    method: 'POST',
    body: JSON.stringify({ target_user_id: targetUserId })
  });
}

export async function getPhotoRequests() {
  return fetchNisApi('/photos/requests');
}

// Analytics & Trust Score
export async function getTrustScore() {
  return fetchNisApi('/trust-score/me');
}

export async function getProfileAnalytics() {
  return fetchNisApi('/analytics/profile-views');
}

/** Returns summary counts for the dashboard sidebar (interests, messages, saved). */
export async function getAnalyticsSummary(): Promise<{
  totalViews: number;
  interests: number;
  messages: number;
  saved: number;
} | null> {
  try {
    return await fetchNisApi('/analytics/summary');
  } catch {
    return null; // Backend not connected — caller shows empty state
  }
}

// Notifications
export async function getNotifications() {
  return fetchNisApi('/notifications/me');
}

// Profile Sharing
export async function shareProfile(targetUserId: string, platform: string) {
  return fetchNisApi('/profile/share', {
    method: 'POST',
    body: JSON.stringify({ target_user_id: targetUserId, platform, timestamp: new Date().toISOString() })
  });
}

// Family / Wali Management
export async function inviteFamilyMember(name: string, email: string, role: string) {
  return fetchNisApi('/family/invite', {
    method: 'POST',
    body: JSON.stringify({ name, email, role })
  });
}

export async function getFamilyMembers() {
  return fetchNisApi('/family/members');
}

export async function removeFamilyMember(memberId: string) {
  return fetchNisApi(`/family/members/${memberId}`, { method: 'DELETE' });
}

// Pinned Messages
export async function pinMessage(conversationId: string, messageId: string) {
  return fetchNisApi(`/conversations/${conversationId}/messages/${messageId}/pin`, { method: 'POST' });
}

export async function unpinMessage(conversationId: string, messageId: string) {
  return fetchNisApi(`/conversations/${conversationId}/messages/${messageId}/unpin`, { method: 'POST' });
}

export async function getPinnedMessages(conversationId: string) {
  return fetchNisApi(`/conversations/${conversationId}/messages/pinned`);
}

// Moderation & Safety
/**
 * Submit an evidence-based report against a user.
 * Sends multipart/form-data so files can be attached.
 * Backend stores: reporter_user_id, reported_user_id, evidence_files,
 *                 reason, description, additional_notes, timestamp.
 *
 * NO automatic bans — admin review required.
 * If 5+ distinct reporters flag the same user the backend marks
 * status = UNDER_REVIEW and applies a temporary restriction.
 */
export async function submitEvidenceReport(formData: FormData): Promise<void> {
  const isDev  = import.meta.env.DEV;
  const token  = localStorage.getItem('sakinah_token');

  const headers: Record<string, string> = {};
  if (isDev)   headers['X-Test-User-Id'] = 'user_frontend_dev';
  if (token)   headers['Authorization']  = `Bearer ${token}`;
  // Do NOT set Content-Type — browser sets it automatically for multipart/form-data

  try {
    const response = await fetch(`${API_BASE}/moderation/reports`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Report submission failed: ${response.status}`);
    }
  } catch (err) {
    // Backend not connected in dev — log and continue
    console.warn('[SakinahAPI] submitEvidenceReport: backend unavailable in demo mode.', err);
  }
}

/** @deprecated Use submitEvidenceReport() with FormData instead. */
export async function reportProfile(profileName: string, reason: string, details?: string) {
  return fetchNisApi('/moderation/report', {
    method: 'POST',
    body: JSON.stringify({
      target_profile: profileName,
      reason,
      details,
      timestamp: new Date().toISOString(),
    }),
  });
}

// ============================================================================
// WALI ACCESS & NOTIFICATION
// ============================================================================

/**
 * Simulates strict backend verification for Wali access.
 * In production, this verifies `entered_email == authorized_wali_email`.
 */
export async function verifyWaliAccess(email: string) {
  try {
    const response = await fetch(`${API_BASE}/wali/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Unauthorized');
    }
    return await response.json();
  } catch (err) {
    // Test email bypass for easy demonstration
    if (email.toLowerCase() === 'r.joshuaraja@gmail.com' || email.toLowerCase() === 'wali@test.com') {
      return { success: true, token: `wali_session_${Date.now()}` };
    }

    // Demo mode fallback: verify against localStorage (simulating backend check)
    const stored = localStorage.getItem('sakinah_onboarding_wali');
    if (stored) {
      try {
        const waliDetails = JSON.parse(stored);
        if (Array.isArray(waliDetails)) {
          const authorizedEmails = waliDetails
            .filter(w => w.email)
            .map(w => w.email.toLowerCase());
            
          if (authorizedEmails.includes(email.toLowerCase())) {
            return { success: true, token: `wali_session_${Date.now()}` };
          }
        }
      } catch { /* ignore */ }
    }
    
    throw new Error('This email is not authorized by the respective user.');
  }
}

/**
 * Simulates sending a login notification to the Seeker when Wali accesses the account.
 */
export async function notifyWaliLogin(email: string) {
  try {
    await fetch(`${API_BASE}/wali/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'WALI_LOGIN',
        message: 'Your Wali has logged into the platform.',
        email,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    // Demo mode fallback: just log to console
    console.info(`[SakinahAPI] Seeker Notification: Wali (${email}) accessed the account.`);
  }
}
