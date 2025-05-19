/**
 * Maps error messages to user-friendly messages
 * @param error The error object or error message
 * @returns A user-friendly error message
 */
export function mapError(error: Error | string | null | undefined): string {
  if (!error) return 'An unexpected error occurred';

  const message = typeof error === 'string' ? error : error.message;

  // Authentication errors
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (message.includes('User not found')) {
    return 'User not found. Please check your email or sign up for a new account.';
  }
  if (message.includes('Email not confirmed')) {
    return 'Please confirm your email before logging in.';
  }
  if (message.includes('User already registered')) {
    return 'This email is already registered. Try logging in instead.';
  }

  // Database errors
  if (message.includes('duplicate key value violates unique constraint')) {
    if (message.includes('email')) {
      return 'A record with this email already exists.';
    }
    return 'A record with this value already exists.';
  }
  if (message.includes('violates foreign key constraint')) {
    return 'The referenced record does not exist or has been deleted.';
  }
  if (message.includes('violates not-null constraint')) {
    const fieldMatch = message.match(/column "([^"]+)"/);
    const field = fieldMatch ? fieldMatch[1] : 'A field';
    return `${field} is required.`;
  }

  // Network errors
  if (message.includes('Request timed out')) {
    return 'The request timed out. Please check your connection and try again.';
  }
  if (message.includes('Failed to fetch')) {
    return 'Network connection error. Please check your internet connection.';
  }
  if (message.includes('500 Internal Server Error')) {
    return 'The server encountered an error. Please try again later.';
  }

  // RLS errors
  if (message.includes('new row violates row-level security policy')) {
    return 'You do not have permission to perform this action.';
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again or contact support.';
}

/**
 * Retry helper for async operations
 * @param operation The async operation to retry
 * @param options Configuration options for retries
 * @returns The result of the operation
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 500, shouldRetry = () => true } = options;
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Check if we should retry based on the error
      if (!shouldRetry(error)) {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw error;
      }
      
      // Otherwise wait and retry
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw lastError;
}
