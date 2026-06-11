import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'Seeker' | 'Wali' | null;

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
}

interface AppState {
  role: UserRole;
  waliOption?: 'manage' | 'create' | null;
  auth: { isAuthenticated: boolean; user: any | null };
  profile: any;
  kyc: { status: 'Pending' | 'Approved' | 'Rejected' | 'None'; data: any };
  preferences: any;
  matches: any[];
  chatMessages: ChatMessage[];
}

const initialState: AppState = {
  role: null,
  waliOption: null,
  auth: { isAuthenticated: false, user: null },
  profile: null,
  kyc: { status: 'None', data: null },
  preferences: null,
  matches: [],
  chatMessages: [
    {
      id: 'msg-1',
      text: "Assalamu alaikum! I noticed we have very similar views on family values and Deen. It's nice to connect.",
      sender: 'them',
      timestamp: '10:42 AM'
    }
  ],
};

interface AppContextType {
  state: AppState;
  setRole: (role: UserRole, waliOption?: 'manage' | 'create' | null) => void;
  setAuth: (authData: any) => void;
  setProfile: (profileData: any) => void;
  setKyc: (kycData: any) => void;
  setPreferences: (prefData: any) => void;
  setMatches: (matchesData: any[]) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  resetState: () => void;
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

  const setRole        = (role: UserRole, waliOption?: 'manage' | 'create' | null) => setState(s => ({ ...s, role, waliOption: waliOption || null }));
  const setAuth        = (authData: any)          => setState(s => ({ ...s, auth: authData }));
  const setProfile     = (profileData: any)       => setState(s => ({ ...s, profile: profileData }));
  const setKyc         = (kycData: any)           => setState(s => ({ ...s, kyc: kycData }));
  const setPreferences = (prefData: any)          => setState(s => ({ ...s, preferences: prefData }));
  const setMatches     = (matchesData: any[])     => setState(s => ({ ...s, matches: matchesData }));
  const setChatMessages= (messages: ChatMessage[])=> setState(s => ({ ...s, chatMessages: messages }));
  const resetState     = ()                       => {
      setState(initialState);
      localStorage.removeItem('sakinah_state');
  };

  return (
    <AppContext.Provider value={{ state, setRole, setAuth, setProfile, setKyc, setPreferences, setMatches, resetState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
