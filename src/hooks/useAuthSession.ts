
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
    const maxRetries = 2; // Reduzido de 3 para 2
    const retryDelay = 1500; // Aumentado de 1000 para 1500

    // Fetch profile with retry mechanism
    const fetchProfileWithRetry = async (userId: string) => {
      try {
        if (!isMounted) return;
        
        const profile = await profileService.fetchUserProfile(userId);
        
        if (!isMounted) return;
        
        if (profile) {
          console.log('Profile fetched successfully:', profile.email);
          // Verificar se o role está entre os valores esperados
          if (!['admin', 'gestor', 'consultor', 'suporte', 'cliente', 'user'].includes(profile.role)) {
            console.warn(`Invalid role detected: ${profile.role}, defaulting to 'cliente'`);
            profile.role = 'cliente';
          }
          
          updateState({ 
            profile,
            isLoading: false,
            error: null
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
            setTimeout(() => {
              if (isMounted) {
                fetchProfileWithRetry(userId);
              }
            }, retryDelay * profileRetries);
          } else {
            console.error('Failed to fetch profile after multiple attempts');
            updateState({ 
              profile: null,
              isLoading: false,
              error: 'Failed to load user profile'
            });
            
            // Não mostrar toast de erro em caso de falha do perfil
            // O usuário conseguiu fazer login, então vamos deixar passar
            console.warn('Profile fetch failed but continuing with basic auth state');
          }
        }
      } catch (error: any) {
        if (!isMounted) return;
        
        console.error('Error fetching profile:', error);
        
        // Se o erro é relacionado a auth (403, token issues), não fazer retry
        if (error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
          console.warn('Auth error detected, stopping retries and continuing with basic state');
          updateState({ 
            isLoading: false,
            error: null // Não mostrar erro para o usuário
          });
          return;
        }
        
        if (profileRetries < maxRetries) {
          profileRetries++;
          setTimeout(() => {
            if (isMounted) {
              fetchProfileWithRetry(userId);
            }
          }, retryDelay * profileRetries);
        } else {
          console.warn('Profile loading failed after max retries, continuing without profile');
          updateState({ 
            isLoading: false,
            error: null // Não bloquear o usuário por problemas de perfil
          });
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
        }, 8000); // Aumentado de 5000 para 8000

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
              }, 500); // Aumentado de 0 para 500ms
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
          updateState({ isLoading: false, error: null }); // Não mostrar erro crítico
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
