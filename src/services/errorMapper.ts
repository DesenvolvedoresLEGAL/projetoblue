
import { PostgrestError } from '@supabase/supabase-js';

type ErrorSource = Error | PostgrestError | null | unknown;

/**
 * Maps different types of errors to user-friendly messages
 */
export const errorMapper = {
  /**
   * Maps authentication errors to user-friendly messages
   */
  authError(error: ErrorSource): string {
    if (!error) return 'An unexpected error occurred';
    
    const message = error instanceof Error ? error.message : String(error);
    
    if (message.includes('Email not confirmed')) {
      return 'Please confirm your email before logging in';
    }
    if (message.includes('Invalid login credentials')) {
      return 'Invalid email or password';
    }
    if (message.includes('already registered')) {
      return 'This email is already registered';
    }
    if (message.includes('rate limit')) {
      return 'Too many attempts. Please try again later';
    }
    
    return 'Authentication failed. Please check your credentials and try again.';
  },

  /**
   * Maps database operation errors to user-friendly messages
   */
  dbError(error: ErrorSource): string {
    if (!error) return 'An unexpected error occurred';
    
    const pgError = error as PostgrestError;
    const message = pgError.message || (error instanceof Error ? error.message : String(error));
    const code = pgError.code;
    
    // Handle specific Postgres error codes
    if (code === '23505') {
      return 'This record already exists';
    }
    if (code === '23503') {
      return 'This operation references a record that doesn\'t exist';
    }
    if (code === '42501') {
      return 'You don\'t have permission to perform this operation';
    }
    
    // Handle specific error messages
    if (message.includes('duplicate key')) {
      return 'This item already exists';
    }
    if (message.includes('violates row-level security')) {
      return 'You don\'t have permission to access this resource';
    }
    
    return 'An error occurred while accessing the database. Please try again or contact support.';
  },

  /**
   * Maps general application errors to user-friendly messages
   */
  appError(error: ErrorSource): string {
    if (!error) return 'An unexpected error occurred';
    
    const message = error instanceof Error ? error.message : String(error);
    
    if (message.includes('Network') || message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (message.includes('timeout')) {
      return 'The operation timed out. Please try again.';
    }
    
    return 'An application error occurred. Please try again or contact support.';
  }
};
