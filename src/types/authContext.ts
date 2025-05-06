
import { User, Session } from '@supabase/supabase-js';
import { UserProfile, UserRole } from './auth';

export interface AuthContextType {
  signIn: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>; // Alias for signIn
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  isAuthenticated: boolean;
  user: User | null;
  profile?: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
