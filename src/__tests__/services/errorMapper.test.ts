
import { describe, it, expect } from 'vitest';
import { mapError, withRetry } from '@/services/errorMapper';

describe('mapError', () => {
  it('maps authentication errors correctly', () => {
    // Test invalid credentials
    expect(mapError(new Error('Invalid login credentials'))).toBe(
      'Invalid email or password. Please check your credentials and try again.'
    );
    
    // Test user not found
    expect(mapError(new Error('User not found'))).toBe(
      'User not found. Please check your email or sign up for a new account.'
    );
    
    // Test email not confirmed
    expect(mapError(new Error('Email not confirmed'))).toBe(
      'Please confirm your email before logging in.'
    );
    
    // Test already registered
    expect(mapError(new Error('User already registered'))).toBe(
      'This email is already registered. Try logging in instead.'
    );
  });
  
  it('maps database errors correctly', () => {
    // Test unique violation
    expect(mapError(new Error('duplicate key value violates unique constraint on email'))).toBe(
      'A record with this email already exists.'
    );
    
    // Test foreign key violation
    expect(mapError(new Error('insert or update on table violates foreign key constraint'))).toBe(
      'The referenced record does not exist or has been deleted.'
    );
    
    // Test not null violation
    expect(mapError(new Error('null value in column "name" of relation "users" violates not-null constraint'))).toBe(
      'name is required.'
    );
  });
  
  it('maps network and server errors correctly', () => {
    // Test timeout
    expect(mapError(new Error('Request timed out'))).toBe(
      'The request timed out. Please check your connection and try again.'
    );
    
    // Test network error
    expect(mapError(new Error('Failed to fetch'))).toBe(
      'Network connection error. Please check your internet connection.'
    );
    
    // Test server error
    expect(mapError(new Error('500 Internal Server Error'))).toBe(
      'The server encountered an error. Please try again later.'
    );
  });
  
  it('maps RLS violation errors correctly', () => {
    expect(mapError(new Error('new row violates row-level security policy for table "assets"'))).toBe(
      'You do not have permission to perform this action.'
    );
  });
  
  it('returns a generic error for unrecognized errors', () => {
    expect(mapError(new Error('Some unknown error'))).toBe(
      'An unexpected error occurred. Please try again or contact support.'
    );
  });
  
  it('handles null or undefined errors', () => {
    expect(mapError(null)).toBe('An unexpected error occurred');
    expect(mapError(undefined)).toBe('An unexpected error occurred');
  });
});

describe('withRetry', () => {
  it('returns the result when operation succeeds', async () => {
    const operation = () => Promise.resolve('success');
    const result = await withRetry(operation);
    expect(result).toBe('success');
  });
  
  it('retries the operation on failure', async () => {
    let attempts = 0;
    const operation = () => {
      attempts++;
      if (attempts < 2) {
        return Promise.reject(new Error('Temporary failure'));
      }
      return Promise.resolve('success after retry');
    };
    
    const result = await withRetry(operation, { maxAttempts: 3, delayMs: 10 });
    expect(result).toBe('success after retry');
    expect(attempts).toBe(2);
  });
  
  it('throws after maximum attempts', async () => {
    let attempts = 0;
    const operation = () => {
      attempts++;
      return Promise.reject(new Error('Persistent failure'));
    };
    
    await expect(withRetry(operation, { maxAttempts: 3, delayMs: 10 })).rejects.toThrow('Persistent failure');
    expect(attempts).toBe(3);
  });
  
  it('respects shouldRetry option', async () => {
    let attempts = 0;
    const operation = () => {
      attempts++;
      return Promise.reject(new Error('Not worth retrying'));
    };
    
    const shouldRetry = (error: any) => error.message !== 'Not worth retrying';
    
    await expect(
      withRetry(operation, { maxAttempts: 3, delayMs: 10, shouldRetry })
    ).rejects.toThrow('Not worth retrying');
    
    // Should not retry since shouldRetry returns false
    expect(attempts).toBe(1);
  });
});
