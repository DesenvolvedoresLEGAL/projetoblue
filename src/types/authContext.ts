
import { User, AuthResponse, AuthError } from '@supabase/supabase-js';
import { UserProfile, UserRole } from './auth';
import { AuthErrorCategory } from '@/constants/auth';

export interface TechnicalErrorInfo {
  message: string;
  category?: AuthErrorCategory;
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    role?: UserRole
  ) => Promise<{ data: AuthResponse['data']; error: AuthError | null; profileCreated: boolean }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  technicalError?: TechnicalErrorInfo | null;
  // Informações adicionais de role
  userRole: UserRole;
  hasMinimumRole: (requiredRole: UserRole) => boolean;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}
