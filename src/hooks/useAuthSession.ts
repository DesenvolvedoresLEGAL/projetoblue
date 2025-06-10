
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { profileService } from '@/services/profileService';
import { toast } from '@/utils/toast';

// Debounce function to prevent multiple redirects
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

export function useAuthSession(updateState: (state: any) => void) {
  useEffect(() => {
    let isMounted = true;
    
    // Track retries for profile fetch
    let profileRetries = 0;
    const maxRetries = 3;
    const retryDelay = 1000;

    // Fetch profile with retry mechanism
    const fetchProfileWithRetry = async (userId: string) => {
      try {
        if (!isMounted) return;
        
        const profile = await profileService.fetchUserProfile(userId);
        
        if (!isMounted) return;
        
        if (profile) {
          console.log('Profile fetched successfully:', profile.email);
          // Verificar se o role está entre os valores esperados
          if (!['admin', 'gestor', 'consultor', 'cliente', 'user'].includes(profile.role)) {
            console.warn(`Invalid role detected: ${profile.role}, defaulting to 'cliente'`);
            profile.role = 'cliente';
          }
          
          updateState({ 
            profile,
            isLoading: false 
          });
          
          // Atualizar último login
          profileService.updateLastLogin(userId).catch(err => 
            console.warn('Non-critical: Failed to update last_login:', err)
          );
        } else {
          // Retry logic with exponential backoff
          if (profileRetries < maxRetries) {
            profileRetries++;
            console.log(`Profile fetch attempt ${profileRetries} failed, retrying in ${retryDelay * profileRetries}ms`);
            setTimeout(() => fetchProfileWithRetry(userId), retryDelay * profileRetries);
          } else {
            console.error('Failed to fetch profile after multiple attempts');
            updateState({ 
              profile: null,
              isLoading: false,
              error: 'Failed to load user profile' 
            });
            toast.error("Erro ao carregar seu perfil. Por favor, tente novamente ou contate o suporte.");
          }
        }
      } catch (error) {
        if (!isMounted) return;
        
        console.error('Error fetching profile:', error);
        if (profileRetries < maxRetries) {
          profileRetries++;
          setTimeout(() => fetchProfileWithRetry(userId), retryDelay * profileRetries);
        } else {
          updateState({ 
            isLoading: false,
            error: 'Failed to load user profile' 
          });
          toast.error("Não foi possível carregar os dados do seu perfil. Entre em contato com o suporte.");
        }
      }
    };

    // Debounced state update to prevent flickering
    const debouncedUpdateState = debounce(updateState, 100);

    const setupAuth = async () => {
      try {
        // Clear loading state if session check takes too long
        const timeoutId = setTimeout(() => {
          if (isMounted) {
            console.log('Auth session check timed out');
            updateState({ isLoading: false });
          }
        }, 5000);

        // First set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state changed:', event, currentSession?.user?.email);
            
            // Update the user state immediately
            debouncedUpdateState({
              user: currentSession?.user || null,
            });

            // Clear profile on sign out
            if (event === 'SIGNED_OUT') {
              updateState({ 
                profile: null,
                isLoading: false 
              });
              return;
            }

            // Fetch profile on sign in
            if (event === 'SIGNED_IN' && currentSession?.user) {
              // Set loading to true while fetching profile
              updateState({ isLoading: true });
              
              // Reset retry counter
              profileRetries = 0;
              
              // Use setTimeout to avoid potential deadlock with Supabase Auth
              setTimeout(() => {
                if (isMounted) {
                  fetchProfileWithRetry(currentSession.user.id);
                }
              }, 0);
            }
          }
        );

        // Then check for an existing session
        try {
          console.log('Checking for existing session...');
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          console.log('Existing session:', currentSession?.user?.email || 'None');
          
          // Clear timeout since we got a response
          clearTimeout(timeoutId);
          
          // Update user state from existing session
          debouncedUpdateState({
            user: currentSession?.user || null,
          });

          // Fetch profile if user is signed in
          if (currentSession?.user) {
            profileRetries = 0;
            fetchProfileWithRetry(currentSession.user.id);
          } else {
            // No existing session, mark as not loading
            updateState({ isLoading: false });
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.error('Error checking session:', error);
          updateState({ isLoading: false });
        }

        // Return cleanup function
        return () => {
          isMounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Critical error in auth setup:', error);
        if (isMounted) {
          updateState({ isLoading: false, error: 'Authentication system failed to initialize' });
        }
      }
    };

    // Execute setup
    const cleanup = setupAuth();
    
    // Return cleanup function
    return () => {
      isMounted = false;
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [updateState]);
}
