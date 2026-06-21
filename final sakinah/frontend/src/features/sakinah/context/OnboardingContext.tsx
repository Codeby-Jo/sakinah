import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface SeekerProfile {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  age: string;
  gender: string;
  location: string;
  marital_status: string;
  education_occupation: string;
  religious_practice_and_islamic_home: string;
  marriage_readiness: string;
  profilePhoto?: string;
}

export interface PartnerPreferences {
  minAge: string;
  maxAge: string;
  locationPref: string[];
  locationFlexibility: string;
  maritalStatus: string;
  educationPref: string[];
  workOutlook: string;
  workAfterMarriage: string;
  traditionPref: string;
  traditionStrictness: string;
  religiousPracticePref: string;
  islamicEnvPref: string;
  learningPref: string;
  reminderStyle: string;
  familyInvolvement: string;
  communicationStyle: string;
  repairStyle: string;
  angerLevel: string;
  boundaryStrength: string;
  boundarySafety: string;
  emotionalSteadiness: string;
  financialResp: string;
  lifestyle: string;
  lifestyleFinances: string;
  disagreementResponse: string;
  familyPressureResponse: string;
  accountabilityResponse: string;
  personalSpaceResponse: string;
  financialDecisionResponse: string;
  dealbreakersText: string;
  dealbreakers: string[];
  strictAge: boolean;
  strictLocation: boolean;
  strictTradition: boolean;
  strictMarital: boolean;
  noMatchConfirmed: boolean;
}

export interface WaliDetails {
  fullName: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
}

export interface AuthData {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface KycData {
  identityType: string;
  frontImage: string;
  backImage: string;
  selfieImage: string;
  aadhaarNumber: string;
  aadhaarName: string;
  aadhaarDob: string;
}

// ─── Default Values ─────────────────────────────────────────────────────────

const defaultProfile = (): SeekerProfile => ({
  firstName: '', lastName: '', dateOfBirth: '',
  age: '', gender: '', location: '', marital_status: '',
  education_occupation: '', religious_practice_and_islamic_home: '', marriage_readiness: '', profilePhoto: ''
});

const defaultPreferences = (): PartnerPreferences => ({
  minAge: '', maxAge: '', locationPref: [], locationFlexibility: '', maritalStatus: '',
  educationPref: [], workOutlook: '', workAfterMarriage: '', traditionPref: '', traditionStrictness: '',
  religiousPracticePref: '', islamicEnvPref: '', learningPref: '', reminderStyle: '', familyInvolvement: '',
  communicationStyle: '', repairStyle: '', angerLevel: '', boundaryStrength: '', boundarySafety: '',
  emotionalSteadiness: '', financialResp: '', lifestyle: '', lifestyleFinances: '', disagreementResponse: '', familyPressureResponse: '',
  accountabilityResponse: '', personalSpaceResponse: '', financialDecisionResponse: '', dealbreakersText: '', dealbreakers: [],
  strictAge: false, strictLocation: false, strictTradition: false, strictMarital: false, noMatchConfirmed: false
});

const defaultKyc = (): KycData => ({
  identityType: '', frontImage: '', backImage: '', selfieImage: '', aadhaarNumber: '', aadhaarName: '', aadhaarDob: ''
});

// ─── Context ────────────────────────────────────────────────────────────────
interface OnboardingContextType {
  userType: 'SEEKER' | 'LOOKING_FOR_SOMEONE_ELSE' | 'WALI_VIEW' | 'ADMIN' | null;
  setUserType: (t: 'SEEKER' | 'LOOKING_FOR_SOMEONE_ELSE' | 'WALI_VIEW' | 'ADMIN' | null) => void;
  auth: AuthData;
  setAuth: React.Dispatch<React.SetStateAction<AuthData>>;
  profile: SeekerProfile;
  updateProfile: (field: keyof SeekerProfile, value: any) => void;
  preferences: PartnerPreferences;
  updatePreference: (field: keyof PartnerPreferences, value: any) => void;
  kyc: KycData;
  updateKyc: (field: keyof KycData, value: any) => void;
  waliDetails: WaliDetails[];
  setWaliDetails: React.Dispatch<React.SetStateAction<WaliDetails[]>>;
  kycCompleted: boolean;
  setKycCompleted: (v: boolean) => void;
  profileStep: number;
  setProfileStep: (s: number) => void;
  isOnboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
  isWaliViewOnly: boolean;
  setIsWaliViewOnly: (v: boolean) => void;
}

export const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize userType from persisted progress so it survives navigation/refresh
  const [userType, setUserType] = useState<'SEEKER' | 'LOOKING_FOR_SOMEONE_ELSE' | 'WALI_VIEW' | 'ADMIN' | null>(() => {
    try {
      const stored = localStorage.getItem('sakinah_progress');
      if (stored) {
        const parsed = JSON.parse(stored);
        const role = parsed?.role;
        if (role === 'SEEKER' || role === 'LOOKING_FOR_SOMEONE_ELSE' || role === 'WALI_VIEW' || role === 'ADMIN') {
          return role;
        }
      }
    } catch { /* ignore */ }
    return null;
  });
  
  // Persisted state initialization
  const loadPersisted = <T,>(key: string, defaultVal: T): T => {
    try {
      const item = localStorage.getItem(`sakinah_onboarding_${key}`);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [auth, setAuth] = useState<AuthData>(() => loadPersisted('auth', { email: '', phone: '', password: '', confirmPassword: '' }));
  const [profile, setProfile] = useState<SeekerProfile>(() => loadPersisted('profile', defaultProfile()));
  const [preferences, setPreferences] = useState<PartnerPreferences>(() => loadPersisted('preferences', defaultPreferences()));
  const [kyc, setKyc] = useState<KycData>(() => loadPersisted('kyc', defaultKyc()));
  const [waliDetails, setWaliDetails] = useState<WaliDetails[]>(() => {
    const persisted = loadPersisted<any>('wali', []);
    return Array.isArray(persisted) ? persisted : (persisted?.email ? [persisted] : []);
  });
  const [kycCompleted, setKycCompleted] = useState(() => loadPersisted('kycCompleted', false));

  // Persistence effects
  useEffect(() => { localStorage.setItem('sakinah_onboarding_auth', JSON.stringify(auth)); }, [auth]);
  useEffect(() => { localStorage.setItem('sakinah_onboarding_profile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('sakinah_onboarding_preferences', JSON.stringify(preferences)); }, [preferences]);
  useEffect(() => { localStorage.setItem('sakinah_onboarding_kyc', JSON.stringify(kyc)); }, [kyc]);
  useEffect(() => { localStorage.setItem('sakinah_onboarding_wali', JSON.stringify(waliDetails)); }, [waliDetails]);
  useEffect(() => { localStorage.setItem('sakinah_onboarding_kycCompleted', JSON.stringify(kycCompleted)); }, [kycCompleted]);

  const [profileStep, setProfileStep] = useState(1);
  const [isOnboardingComplete, setOnboardingComplete] = useState(false);

  const updateProfile = useCallback((field: keyof SeekerProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const updatePreference = useCallback((field: keyof PartnerPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateKyc = useCallback((field: keyof KycData, value: any) => {
    setKyc(prev => ({ ...prev, [field]: value }));
  }, []);

  const isWaliViewOnly = userType === 'WALI_VIEW';
  const setIsWaliViewOnly = (v: boolean) => {
    if (v) setUserType('WALI_VIEW');
  };

  return (
    <OnboardingContext.Provider value={{
      userType, setUserType,
      auth, setAuth,
      profile, updateProfile,
      preferences, updatePreference,
      kyc, updateKyc,
      waliDetails, setWaliDetails,
      kycCompleted, setKycCompleted,
      profileStep, setProfileStep,
      isOnboardingComplete, setOnboardingComplete,
      isWaliViewOnly, setIsWaliViewOnly,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};
