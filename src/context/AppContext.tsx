import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'Seeker' | 'Wali' | null;

interface AppState {
  role: UserRole;
  auth: { isAuthenticated: boolean; user: any | null };
  profile: any;
  kyc: { status: 'Pending' | 'Approved' | 'Rejected' | 'None'; data: any };
  preferences: any;
  matches: any[];
}

const initialState: AppState = {
  role: null,
  auth: { isAuthenticated: false, user: null },
  profile: null,
  kyc: { status: 'None', data: null },
  preferences: null,
  matches: [],
};

interface AppContextType {
  state: AppState;
  setRole: (role: UserRole) => void;
  setAuth: (authData: any) => void;
  setProfile: (profileData: any) => void;
  setKyc: (kycData: any) => void;
  setPreferences: (prefData: any) => void;
  setMatches: (matchesData: any[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem('sakinah_state');
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    localStorage.setItem('sakinah_state', JSON.stringify(state));
  }, [state]);

  const setRole        = (role: UserRole)        => setState(s => ({ ...s, role }));
  const setAuth        = (authData: any)          => setState(s => ({ ...s, auth: authData }));
  const setProfile     = (profileData: any)       => setState(s => ({ ...s, profile: profileData }));
  const setKyc         = (kycData: any)           => setState(s => ({ ...s, kyc: kycData }));
  const setPreferences = (prefData: any)          => setState(s => ({ ...s, preferences: prefData }));
  const setMatches     = (matchesData: any[])     => setState(s => ({ ...s, matches: matchesData }));

  return (
    <AppContext.Provider value={{ state, setRole, setAuth, setProfile, setKyc, setPreferences, setMatches }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
