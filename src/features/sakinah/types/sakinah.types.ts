export type SakinahEligibilityStatus = 'PENDING' | 'ELIGIBLE' | 'REJECTED' | 'NEEDS_VERIFICATION';

export interface UserSignalProfilePayload {
  userId: string;
  sect: string;
  religiousPractice: string;
  prayerFrequency: string;
  familyValues: string;
  financialReadiness: boolean;
  timelineToMarry: string;
  // Other non-PII signal data
}

export interface MatchPreferencePayload {
  ageRangeMin: number;
  ageRangeMax: number;
  sectPreference: string;
  relocationWillingness: boolean;
  hardFilters: string[];
}

export interface CandidateSummary {
  candidateId: string;
  displayName: string;
  age: number;
  location: string;
  profession: string;
  sect: string;
  prayerFrequency: string;
  bioSnippet: string;
}

export interface ConsideredFewResponse {
  candidates: CandidateSummary[];
  status: 'FOUND' | 'NO_SUITABLE_MATCHES_RIGHT_NOW';
}

export type MatchflowStep = 
  | 'VIEWING_CANDIDATE' 
  | 'MUTUAL_INTEREST_PENDING' 
  | 'CONVERSATION_OPEN' 
  | 'DECISION_PENDING' 
  | 'MATCH_CLOSED';

export interface ConversationTopic {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  unlockRequirement?: string;
}

export type DecisionOutcome = 'PROCEED' | 'PAUSE' | 'CLOSE';

export interface SafetyReportPayload {
  targetUserId: string;
  reason: string;
  description?: string;
  timestamp: string;
}

export type SakinahProfileData = UserSignalProfilePayload;
export type SakinahMatchPreferences = MatchPreferencePayload;

export interface ConversationResponse {
  current_topic: string;
  topics: ConversationTopic[];
  messages: any[];
}

export interface MatchflowResponse {
  matchflow_id: string;
  current_step: string;
  steps: any[];
}

export interface TrustScoreData {
  score: number;
  level: 'Basic' | 'Trusted' | 'Highly Trusted' | 'Premium Verified';
  factors: {
    profileCompleteness: boolean;
    kycCompletion: boolean;
    emailVerification: boolean;
    phoneVerification: boolean;
    identityVerification: boolean;
  };
}

export interface ProfileVisit {
  visitorId: string;
  visitorName: string;
  timestamp: string;
  timeAgo: string;
}

export interface ProfileAnalytics {
  totalViews: number;
  weeklyViews: number;
  monthlyViews: number;
  recentVisitors: ProfileVisit[];
}

export interface NotificationItem {
  id: string;
  type: 'NEW_MATCH' | 'PROFILE_VIEW' | 'PHOTO_REQUEST' | 'PROFILE_SHARED' | 'MESSAGE' | 'FAMILY_ADDED' | 'REPORT_SUBMITTED';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'Wali' | 'Father' | 'Mother' | 'Sibling' | 'Guardian';
  status: 'PENDING' | 'APPROVED';
}

export interface PinnedMessage {
  id: string;
  text: string;
  senderName: string;
  pinnedAt: string;
}

export interface VerifiedBadges {
  phoneVerified: boolean;
  emailVerified: boolean;
  idVerified: boolean;
}

