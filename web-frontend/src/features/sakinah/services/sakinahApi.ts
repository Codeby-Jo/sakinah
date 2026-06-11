import type { 
  ConsideredFewResponse, 
  ConversationResponse,
  MatchflowResponse,
  SakinahProfileData,
  SakinahMatchPreferences
} from '../types/sakinah.types';

// Use standard API v1 path. In development it points to localhost:8000
const API_BASE = '/api/v1/nis';

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

// KYC / Eligibility
export async function getSakinahEligibility() {
  return fetchNisApi('/eligibility/me');
}

// Profile / Preferences
export async function getSakinahProfile(): Promise<SakinahProfileData> {
  return fetchNisApi('/profile/me');
}

export async function updateSakinahProfile(data: Partial<SakinahProfileData>) {
  return fetchNisApi('/profile/me', {
    method: 'PUT',
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

export async function expressInterest(candidateId: string) {
  return fetchNisApi(`/candidates/${candidateId}/interest`, { method: 'POST' });
}

export async function silentPass(candidateId: string) {
  return fetchNisApi(`/candidates/${candidateId}/pass`, { method: 'POST' });
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

// Conversation
export async function getStructuredConversation(conversationId: string): Promise<ConversationResponse> {
  return fetchNisApi(`/conversations/${conversationId}`);
}

export async function sendConversationMessage(conversationId: string, topic: string, content: string) {
  return fetchNisApi(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ topic, content })
  });
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
