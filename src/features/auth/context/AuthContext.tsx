
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';
import { toast } from '@/utils/toast';
import { errorMapper } from '@/services/errorMapper';

// Define a comprehensive interface for our authentication context
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<Error | null>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Create the context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize fetchProfile outside the component to avoid recreation on each render
async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const navigate = useNavigate();

  // Initialize auth session on component mount
  useEffect(() => {
    // Set flag to true on mount
    isMounted.current = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        if (!isMounted.current) return;
        
        // Update session and user state based on the current session
        setSession(currentSession);
        setUser(currentSession?.user || null);

        // Handle specific events
        if (event === 'SIGNED_OUT') {
          if (isMounted.current) {
            setProfile(null);
          }
        }

        // Fetch profile only after sign in and when component is still mounted
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession?.user && isMounted.current) {
          // Use setTimeout to avoid potential deadlocks with Supabase client
          setTimeout(async () => {
            try {
              const userProfile = await fetchUserProfile(currentSession.user.id);
              
              if (isMounted.current && userProfile) {
                setProfile(userProfile);
              }
            } catch (error) {
              console.error('Error fetching profile after auth event:', error);
            } finally {
              if (isMounted.current) {
                setIsLoading(false);
              }
            }
          }, 0);
        }
      }
    );

    // Then check for existing session
    const checkExistingSession = async () => {
      try {
        console.log('Checking for existing session...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Existing session:', currentSession?.user?.email || 'None');
        
        if (!isMounted.current) return;
        
        setSession(currentSession);
        setUser(currentSession?.user || null);

        // If there's a session, fetch the user profile
        if (currentSession?.user && isMounted.current) {
          try {
            const userProfile = await fetchUserProfile(currentSession.user.id);
            
            if (isMounted.current && userProfile) {
              setProfile(userProfile);
            }
          } catch (error) {
            console.error('Error fetching profile from existing session:', error);
          } finally {
            if (isMounted.current) {
              setIsLoading(false);
            }
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    checkExistingSession();

    // Cleanup function
    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function with retry mechanism
  const signIn = async (email: string, password: string): Promise<Error | null> => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Add a timeout to prevent indefinite loading state
      const timeoutPromise = new Promise<{data: null, error: Error}>((resolve) => {
        setTimeout(() => {
          resolve({
            data: null,
            error: new Error('Request timed out. Please check your connection and try again.')
          });
        }, 10000); // 10-second timeout
      });
      
      // Implement retry logic
      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;

      while (attempts < maxAttempts) {
        try {
          // Race between the actual sign-in request and the timeout
          const { data, error } = await Promise.race([
            supabase.auth.signInWithPassword({ email, password }),
            timeoutPromise
          ]) as any;
          
          if (error) {
            lastError = error;
            console.log(`Login attempt ${attempts + 1} failed:`, error.message);
            attempts++;
            // Wait a bit longer between each retry
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
              continue;
            }
            break;
          }

          // Success case
          toast.success('Login successful');
          return null;
        } catch (error: any) {
          lastError = error;
          console.log(`Login attempt ${attempts + 1} failed with exception:`, error);
          attempts++;
          // Wait a bit longer between each retry
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          } else {
            break;
          }
        }
      }

      // If we reached here, all attempts failed
      const errorMessage = errorMapper.authError(lastError);
      setError(errorMessage);
      toast.error(errorMessage);
      return lastError;
    } catch (error: any) {
      console.error('Error during sign in:', error);
      const errorMessage = errorMapper.authError(error);
      setError(errorMessage);
      toast.error(errorMessage);
      return error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string): Promise<void> => {
    setError(null);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'user' // Default role for new users
          }
        }
      });

      if (error) {
        const errorMessage = errorMapper.authError(error);
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (data.user) {
        toast.success('Account created successfully! You can now log in.');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Error during sign up:', error);
      const errorMessage = errorMapper.authError(error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await supabase.auth.signOut();
      navigate('/login');
      toast.success('You have been signed out');
    } catch (error: any) {
      console.error('Error during sign out:', error);
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        const errorMessage = errorMapper.authError(error);
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      toast.success('Password reset instructions have been sent to your email');
    } catch (error: any) {
      console.error('Error during password reset:', error);
      const errorMessage = errorMapper.authError(error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        error,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth guard hook for protected routes
export const useAuthGuard = (requiredRole?: string) => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Wait until loading is complete before checking auth
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (requiredRole && profile && profile.role !== requiredRole) {
        toast.error(`You need ${requiredRole} role to access this page`);
        navigate('/', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, navigate, requiredRole, profile]);
  
  return { isAuthenticated, isLoading, hasRequiredRole: !requiredRole || profile?.role === requiredRole };
};
