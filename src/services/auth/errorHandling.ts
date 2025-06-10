
import { AuthErrorCategory } from '@/constants/auth';

export const categorizeError = (error: any): AuthErrorCategory => {
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('already registered')) {
    return AuthErrorCategory.DUPLICATE_EMAIL;
  } else if (message.includes('password')) {
    return AuthErrorCategory.INVALID_PASSWORD;
  } else if (message.includes('email')) {
    return AuthErrorCategory.INVALID_EMAIL;
  } else if (message.includes('database') || message.includes('profile')) {
    return AuthErrorCategory.PROFILE_CREATION;
  } else if (message.includes('network') || message.includes('fetch') || message.includes('conectar')) {
    return AuthErrorCategory.NETWORK;
  } else if (message.includes('credentials') || message.includes('authentication')) {
    return AuthErrorCategory.AUTHENTICATION;
  }
  
  return AuthErrorCategory.UNKNOWN;
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
