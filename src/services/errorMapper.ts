
import { PostgrestError } from "@supabase/supabase-js";

// Common error code patterns
const errorPatterns = {
  // Authentication errors
  invalidCredentials: ['invalid_credentials', 'Invalid login credentials'],
  userNotFound: ['user_not_found', 'User not found'],
  emailNotConfirmed: ['email_not_confirmed', 'Email not confirmed'],
  alreadyRegistered: ['already_registered', 'already exists'],
  weakPassword: ['weak_password', 'Password should be'],
  invalidEmail: ['invalid_email', 'Invalid email'],
  
  // Database errors
  uniqueViolation: ['23505', 'duplicate key', 'already exists'],
  foreignKeyViolation: ['23503', 'violates foreign key'],
  notNullViolation: ['23502', 'null value'],
  checkViolation: ['23514', 'check constraint'],
  
  // Network/server errors
  timeout: ['timeout', 'timed out'],
  connectionError: ['connection', 'network', 'failed to fetch'],
  serverError: ['500', 'server error'],
  
  // RLS errors
  rlsViolation: ['rls', 'policy', 'permission denied', 'new row violates row-level security'],
};

// Map auth or database errors to user-friendly messages
export function mapError(error: Error | PostgrestError | null | unknown): string {
  if (!error) return 'An unexpected error occurred';
  
  // Extract error message
  let message = '';
  if (error instanceof Error) {
    message = error.message || '';
  } else if (typeof error === 'string') {
    message = error;
  } else if (typeof error === 'object' && error !== null) {
    // Handle PostgrestError or similar objects
    message = (error as any).message || (error as any).error || JSON.stringify(error);
  }
  
  message = message.toLowerCase();
  
  // Check against patterns and return appropriate user-friendly message
  
  // Authentication errors
  if (matchesAny(message, errorPatterns.invalidCredentials)) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  
  if (matchesAny(message, errorPatterns.userNotFound)) {
    return 'User not found. Please check your email or sign up for a new account.';
  }
  
  if (matchesAny(message, errorPatterns.emailNotConfirmed)) {
    return 'Please confirm your email before logging in.';
  }
  
  if (matchesAny(message, errorPatterns.alreadyRegistered)) {
    return 'This email is already registered. Try logging in instead.';
  }
  
  if (matchesAny(message, errorPatterns.weakPassword)) {
    return 'Password is too weak. Please use a stronger password with at least 6 characters.';
  }
  
  if (matchesAny(message, errorPatterns.invalidEmail)) {
    return 'Invalid email format. Please enter a valid email address.';
  }
  
  // Database errors
  if (matchesAny(message, errorPatterns.uniqueViolation)) {
    // Extract field name from error message if possible
    let field = extractField(message);
    return `A record with this ${field} already exists.`;
  }
  
  if (matchesAny(message, errorPatterns.foreignKeyViolation)) {
    return 'The referenced record does not exist or has been deleted.';
  }
  
  if (matchesAny(message, errorPatterns.notNullViolation)) {
    let field = extractField(message);
    return `${field} is required.`;
  }
  
  // Network/server errors
  if (matchesAny(message, errorPatterns.timeout)) {
    return 'The request timed out. Please check your connection and try again.';
  }
  
  if (matchesAny(message, errorPatterns.connectionError)) {
    return 'Network connection error. Please check your internet connection.';
  }
  
  if (matchesAny(message, errorPatterns.serverError)) {
    return 'The server encountered an error. Please try again later.';
  }
  
  // RLS errors
  if (matchesAny(message, errorPatterns.rlsViolation)) {
    return 'You do not have permission to perform this action.';
  }
  
  // Default for unrecognized errors
  console.error('Unmapped error:', message);
  return 'An unexpected error occurred. Please try again or contact support.';
}

// Helper function to check if message contains any of the patterns
function matchesAny(message: string, patterns: string[]): boolean {
  return patterns.some(pattern => message.includes(pattern.toLowerCase()));
}

// Helper to extract field name from error message
function extractField(message: string): string {
  // Try to extract field name from common error message formats
  const matches = message.match(/column[:|"]\s*["']?([\w_]+)["']?/i) || 
                 message.match(/key\s*\(([^)]+)\)/i) ||
                 message.match(/constraint on\s+([\w_]+)/i);
  
  if (matches && matches[1]) {
    // Convert snake_case to human readable if needed
    return matches[1].replace(/_/g, ' ');
  }
  
  return 'field';
}

// Create a retry function for critical operations
export async function withRetry<T>(
  operation: () => Promise<T>, 
  options: { 
    maxAttempts?: number, 
    delayMs?: number, 
    shouldRetry?: (error: any) => boolean 
  } = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts || 3;
  const baseDelay = options.delayMs || 1000;
  const shouldRetry = options.shouldRetry || (() => true);
  
  let attempts = 0;
  let lastError: any = null;

  while (attempts < maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      attempts++;
      
      // Check if we should retry based on the error
      if (attempts >= maxAttempts || !shouldRetry(error)) {
        break;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempts - 1);
      console.log(`Retry attempt ${attempts} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
