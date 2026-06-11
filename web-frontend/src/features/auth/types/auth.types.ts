export interface AuthUser {
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
}

export type AuthState = 'initial' | 'authenticated' | 'unauthenticated' | 'loading' | 'error';

export const getAuthErrorMessage = (error: any): string => 'Auth error';
