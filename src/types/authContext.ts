
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from './auth';

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<Error | null>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasProfile?: boolean;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
