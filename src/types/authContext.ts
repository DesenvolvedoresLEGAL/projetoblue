
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from './auth';

export interface AuthContextType {
  signIn?: (email: string, password: string) => Promise<void>; // Optional for backward compatibility
  login: (email: string, password: string) => Promise<void>;   // The method we're actually using in our context
  signUp: (email: string, password: string) => Promise<void>;
  signOut?: () => Promise<void>;                              // Optional for backward compatibility
  logout: () => Promise<void>;                                // The method we're actually using in our context
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
