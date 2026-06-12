import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface SeekerProfile {
  // Step 1: Basic
  fullName: string;
  gender: string;
  dob: string;
  age: string;
  height: string;
  weight: string;
  maritalStatus: string;
  motherTongue: string;
  nationality: string;
  // Step 2: Location
  country: string;
  state: string;
  district: string;
  city: string;
  postalCode: string;
  // Step 3: Religious
  religion: string;
  sect: string;
  madhab: string;
  prayerStatus: string;
  quranReading: string;
  hijabBeard: string;
  islamicEducation: string;
  religiousLifestyle: string;
  // Step 4: Education
  qualification: string;
  degree: string;
  college: string;
  fieldOfStudy: string;
  // Step 5: Career
  occupation: string;
  company: string;
  employmentType: string;
  annualIncome: string;
  workLocation: string;
  // Step 6: Family
  fatherOccupation: string;
  motherOccupation: string;
  familyType: string;
  familyValues: string;
  brothers: string;
  sisters: string;
  // Step 7: Lifestyle
  foodPreference: string;
  smoking: string;
  drinking: string;
  hobbies: string;
  languages: string;
  interests: string;
  // Step 8: About
  bio: string;
  personality: string;
  goals: string;
  expectations: string;
  // Step 9: Photos
  profilePhoto: string;
  additionalPhotos: string[];
}

export interface PartnerPreference {
  value: string;
  priority: 'must_have' | 'preferred' | 'flexible';
}

export interface PartnerPreferences {
  preferredGender: PartnerPreference;
  ageMin: PartnerPreference;
  ageMax: PartnerPreference;
  heightMin: PartnerPreference;
  religion: PartnerPreference;
  sect: PartnerPreference;
  madhab: PartnerPreference;
  religiousPractice: PartnerPreference;
  minQualification: PartnerPreference;
  preferredProfession: PartnerPreference;
  incomeRange: PartnerPreference;
  country: PartnerPreference;
  state: PartnerPreference;
  city: PartnerPreference;
  foodPreference: PartnerPreference;
  smokingPreference: PartnerPreference;
  drinkingPreference: PartnerPreference;
  familyValues: PartnerPreference;
  familyType: PartnerPreference;
  maritalStatus: PartnerPreference;
  additionalExpectations: PartnerPreference;
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

// ─── Default Values ─────────────────────────────────────────────────────────
const defaultPref = (): PartnerPreference => ({ value: '', priority: 'flexible' });

const defaultProfile = (): SeekerProfile => ({
  fullName: '', gender: '', dob: '', age: '', height: '', weight: '',
  maritalStatus: '', motherTongue: '', nationality: '',
  country: '', state: '', district: '', city: '', postalCode: '',
  religion: '', sect: '', madhab: '', prayerStatus: '', quranReading: '',
  hijabBeard: '', islamicEducation: '', religiousLifestyle: '',
  qualification: '', degree: '', college: '', fieldOfStudy: '',
  occupation: '', company: '', employmentType: '', annualIncome: '', workLocation: '',
  fatherOccupation: '', motherOccupation: '', familyType: '', familyValues: '',
  brothers: '', sisters: '',
  foodPreference: '', smoking: '', drinking: '', hobbies: '', languages: '', interests: '',
  bio: '', personality: '', goals: '', expectations: '',
  profilePhoto: '', additionalPhotos: [],
});

const defaultPreferences = (): PartnerPreferences => ({
  preferredGender: defaultPref(), ageMin: defaultPref(), ageMax: defaultPref(),
  heightMin: defaultPref(), religion: defaultPref(), sect: defaultPref(),
  madhab: defaultPref(), religiousPractice: defaultPref(),
  minQualification: defaultPref(), preferredProfession: defaultPref(),
  incomeRange: defaultPref(), country: defaultPref(), state: defaultPref(),
  city: defaultPref(), foodPreference: defaultPref(),
  smokingPreference: defaultPref(), drinkingPreference: defaultPref(),
  familyValues: defaultPref(), familyType: defaultPref(),
  maritalStatus: defaultPref(), additionalExpectations: defaultPref(),
});

// ─── Context ────────────────────────────────────────────────────────────────
interface OnboardingContextType {
  userType: 'seeker' | 'wali' | null;
  setUserType: (t: 'seeker' | 'wali') => void;
  auth: AuthData;
  setAuth: React.Dispatch<React.SetStateAction<AuthData>>;
  profile: SeekerProfile;
  updateProfile: (field: string, value: any) => void;
  preferences: PartnerPreferences;
  updatePreference: (field: string, pref: Partial<PartnerPreference>) => void;
  waliDetails: WaliDetails;
  setWaliDetails: React.Dispatch<React.SetStateAction<WaliDetails>>;
  kycCompleted: boolean;
  setKycCompleted: (v: boolean) => void;
  otpVerified: boolean;
  setOtpVerified: (v: boolean) => void;
  profileStep: number;
  setProfileStep: (s: number) => void;
  isOnboardingComplete: boolean;
  setOnboardingComplete: (v: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userType, setUserType] = useState<'seeker' | 'wali' | null>(null);
  const [auth, setAuth] = useState<AuthData>({ email: '', phone: '', password: '', confirmPassword: '' });
  const [profile, setProfile] = useState<SeekerProfile>(defaultProfile());
  const [preferences, setPreferences] = useState<PartnerPreferences>(defaultPreferences());
  const [waliDetails, setWaliDetails] = useState<WaliDetails>({ fullName: '', relationship: '', phone: '', email: '', address: '' });
  const [kycCompleted, setKycCompleted] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [profileStep, setProfileStep] = useState(1);
  const [isOnboardingComplete, setOnboardingComplete] = useState(false);

  const updateProfile = useCallback((field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const updatePreference = useCallback((field: string, pref: Partial<PartnerPreference>) => {
    setPreferences(prev => ({
      ...prev,
      [field]: { ...prev[field as keyof PartnerPreferences], ...pref },
    }));
  }, []);

  return (
    <OnboardingContext.Provider value={{
      userType, setUserType,
      auth, setAuth,
      profile, updateProfile,
      preferences, updatePreference,
      waliDetails, setWaliDetails,
      kycCompleted, setKycCompleted,
      otpVerified, setOtpVerified,
      profileStep, setProfileStep,
      isOnboardingComplete, setOnboardingComplete,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};
