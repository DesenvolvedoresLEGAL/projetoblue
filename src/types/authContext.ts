
import { User } from '@supabase/supabase-js';
import { UserProfile, UserRole } from './auth';
import { AuthErrorCategory } from '@/constants/auth';
import { ProfileUpdateData } from '@/services/adminService';

export interface TechnicalErrorInfo {
  message: string;
  category?: AuthErrorCategory;
  timestamp: string;
  context?: Record<string, any>;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: UserRole) => Promise<any>;
  signOut: () => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateUserProfile: (
    userId: string,
    profileData: ProfileUpdateData
  ) => Promise<void>;
  createUser: (email: string, password: string, role?: UserRole) => Promise<any>;
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
