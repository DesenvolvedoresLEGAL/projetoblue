
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { profileService } from '@/services/profileService';
import { toast } from '@/utils/toast';
import { toUserRole } from '@/utils/roleUtils';
import { useAuthActions } from './useAuthActions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Debounce function to prevent multiple redirects
const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms = 300,
) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

import type { AuthState } from '@/types/auth';

export function useAuthSession(
  updateState: (state: Partial<AuthState>) => void,
  currentState: AuthState
) {
  const { signOut } = useAuthActions(updateState);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStayLogged = () => {
    setIsDialogOpen(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSignOut = () => {
    setIsDialogOpen(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    signOut(currentState.profile?.role);
  };

  useEffect(() => {
    let isMounted = true;
    let refreshIntervalId: ReturnType<typeof setInterval> | null = null;
    
    // Track retries for profile fetch
    let profileRetries = 0;
    const maxRetries = 2; // Reduzido de 3 para 2
    const retryDelay = 1500; // Aumentado de 1000 para 1500

    // Fetch profile with retry mechanism
    const fetchProfileWithRetry = async (userId: string) => {
      try {
        if (!isMounted) return;
        
          // Incluir perfis soft-deletados para validação
          const profile = await profileService.fetchUserProfile(userId, true);
        
        if (!isMounted) return;
        
        if (profile) {
          
          
          // Normalizar role considerando sinônimos
          profile.role = toUserRole(profile.role);
          
          updateState({ 
            profile,
            isLoading: false,
            error: null
          });
          
          // Atualizar último login
          profileService
            .updateLastLogin(userId)
            .catch(err => {
              
            });
        } else {
          // Retry logic with exponential backoff
          if (profileRetries < maxRetries) {
            profileRetries++;
            
            setTimeout(() => {
              if (isMounted) {
                fetchProfileWithRetry(userId);
              }
            }, retryDelay * profileRetries);
          } else {
            
            updateState({ 
              profile: null,
              isLoading: false,
              error: 'Failed to load user profile'
            });
            
            // Não mostrar toast de erro em caso de falha do perfil
            // O usuário conseguiu fazer login, então vamos deixar passar
            
          }
        }
        } catch (error: unknown) {
        if (!isMounted) return;
        
        
        
        const errorObj = error as { message?: string };
        
        // Se o erro é relacionado a auth (403, token issues), não fazer retry
        if (errorObj.message?.includes('403') || errorObj.message?.includes('Forbidden')) {
          
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
            
            updateState({ isLoading: false });
          }
        }, 10000); // Aumentado de 5000 para 8000

        // First set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            
            
            // Update the user state immediately
            debouncedUpdateState({
              user: currentSession?.user || null,
            });

            // Clear profile on sign out
            if (event === 'SIGNED_OUT') {
              updateState({
                user: null,
                profile: null,
                isLoading: false
              });
              return;
            }

            // Fetch profile on sign in
            if (event === 'SIGNED_IN' && currentSession?.user) {
              const sameUser = currentState.user?.id === currentSession.user.id;
              const hasProfile = sameUser && currentState.profile;

              if (!hasProfile) {
                updateState({ isLoading: true });
              }

              // Reset retry counter
              profileRetries = 0;
              fetchProfileWithRetry(currentSession.user.id);
            }
          }
        );

        // Then check for an existing session
        try {
          
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          
          
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

          // Start periodic session refresh every 30 minutes
          refreshIntervalId = setInterval(async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!isMounted) return;
              if (session?.user) {
                debouncedUpdateState({ user: session.user });
                fetchProfileWithRetry(session.user.id);
                setIsDialogOpen(true);
              }
            } catch (err) {
              return;
            }
          }, 2 * 60 * 60 * 1000);
        } catch (error) {
          clearTimeout(timeoutId);
          
          updateState({ isLoading: false });
        }

        // Return cleanup function
        return () => {
          isMounted = false;
          subscription.unsubscribe();
          if (refreshIntervalId) {
            clearInterval(refreshIntervalId);
          }
        };
      } catch (error) {
        
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      timeoutRef.current = setTimeout(() => {
        handleSignOut();
      }, 60 * 1000);
    } else if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [handleSignOut, isDialogOpen]);

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Olá, ainda está ai?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleSignOut}>não</AlertDialogCancel>
          <AlertDialogAction onClick={handleStayLogged}>sim</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
