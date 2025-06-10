
import { UserRole } from '@/types/auth';
import { DEFAULT_USER_ROLE } from '@/constants/auth';
import { validateSignUpData, ValidationResult } from './auth/validation';
import { signUpUser, signInUser, signOutUser, checkAuthentication } from './auth/operations';

interface SignUpData {
  email: string;
  password: string;
  role?: UserRole;
}

export const authService = {
  // Validation logic
  validateSignUpData,

  // Sign up with retry and profile verification
  async signUp(email: string, password: string, role: UserRole = DEFAULT_USER_ROLE) {
    return await signUpUser(email, password, role);
  },

  // Sign in with improved retry logic
  async signIn(email: string, password: string) {
    return await signInUser(email, password);
  },

  // Sign out with improved handling
  async signOut() {
    return await signOutUser();
  },
  
  // Check if user is authenticated based on local storage
  isAuthenticated(): boolean {
    return checkAuthentication();
  }
};
