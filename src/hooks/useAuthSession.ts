
import { useEffect, useRef } from 'react';
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
    
    // Refs para controlar operações em andamento
    const activeOperations = useRef(new Set<string>());
    const timeoutRefs = useRef(new Map<string, NodeJS.Timeout>());
    
    // Track retries for profile fetch (reduzido para evitar loops)
    let profileRetries = 0;
    const maxRetries = 2; // Reduzido de 3 para 2
    const retryDelay = 2000; // Aumentado para 2000ms

    // Função para cancelar operação específica
    const cancelOperation = (operationId: string) => {
      console.log(`🚫 Cancelando operação: ${operationId}`);
      activeOperations.current.delete(operationId);
      
      const timeout = timeoutRefs.current.get(operationId);
      if (timeout) {
        clearTimeout(timeout);
        timeoutRefs.current.delete(operationId);
      }
    };

    // Função para timeout de operações
    const withOperationTimeout = <T>(
      promise: Promise<T>, 
      timeoutMs: number, 
      operationId: string
    ): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<never>((_, reject) => {
          const timeout = setTimeout(() => {
            console.error(`⏰ Timeout na operação ${operationId} após ${timeoutMs}ms`);
            cancelOperation(operationId);
            reject(new Error(`Timeout: ${operationId} demorou mais que ${timeoutMs}ms`));
          }, timeoutMs);
          
          timeoutRefs.current.set(operationId, timeout);
        })
      ]);
    };

    // Fetch profile with retry mechanism e timeout
    const fetchProfileWithRetry = async (userId: string) => {
      const operationId = `fetchProfile-${userId}-${Date.now()}`;
      
      // Verificar se já existe uma operação similar em andamento
      const existingOperation = Array.from(activeOperations.current).find(op => 
        op.includes(`fetchProfile-${userId}`)
      );
      
      if (existingOperation) {
        console.log(`⚠️ Operação de busca de perfil já em andamento para ${userId}`);
        return;
      }
      
      activeOperations.current.add(operationId);
      
      try {
        if (!isMounted) return;
        
        console.log(`🔍 Buscando perfil para ${userId} (tentativa ${profileRetries + 1})`);
        
        const profilePromise = profileService.fetchUserProfile(userId);
        const profile = await withOperationTimeout(profilePromise, 8000, operationId);
        
        if (!isMounted) return;
        
        if (profile) {
          console.log('✅ Profile fetched successfully:', profile.email);
          
          // Verificar se o role está entre os valores esperados
          if (!['admin', 'suporte', 'cliente', 'usuario'].includes(profile.role)) {
            console.warn(`⚠️ Invalid role detected: ${profile.role}, defaulting to 'cliente'`);
            profile.role = 'cliente';
          }
          
          updateState({ 
            profile,
            isLoading: false,
            error: null
          });
          
          // Atualizar último login (operação não crítica)
          profileService.updateLastLogin(userId).catch(err => 
            console.warn('⚠️ Non-critical: Failed to update last_login:', err)
          );
          
          // Reset retry counter on success
          profileRetries = 0;
        } else {
          // Retry logic with exponential backoff
          if (profileRetries < maxRetries) {
            profileRetries++;
            const nextDelay = retryDelay * profileRetries;
            console.log(`🔄 Profile fetch attempt ${profileRetries} failed, retrying in ${nextDelay}ms`);
            
            const timeout = setTimeout(() => {
              if (isMounted) {
                fetchProfileWithRetry(userId);
              }
            }, nextDelay);
            
            timeoutRefs.current.set(`retry-${operationId}`, timeout);
          } else {
            console.error('❌ Failed to fetch profile after multiple attempts');
            updateState({ 
              profile: null,
              isLoading: false,
              error: null // Não mostrar erro para não bloquear o usuário
            });
            
            console.warn('⚠️ Profile fetch failed but continuing with basic auth state');
          }
        }
      } catch (error: any) {
        if (!isMounted) return;
        
        console.error('❌ Error fetching profile:', error);
        
        // Se o erro é relacionado a auth (403, token issues), não fazer retry
        if (error?.message?.includes('403') || 
            error?.message?.includes('Forbidden') || 
            error?.message?.includes('Timeout')) {
          console.warn('⚠️ Auth/timeout error detected, stopping retries and continuing with basic state');
          updateState({ 
            isLoading: false,
            error: null // Não mostrar erro para o usuário
          });
          return;
        }
        
        if (profileRetries < maxRetries) {
          profileRetries++;
          const nextDelay = retryDelay * profileRetries;
          console.log(`🔄 Retrying profile fetch in ${nextDelay}ms due to error`);
          
          const timeout = setTimeout(() => {
            if (isMounted) {
              fetchProfileWithRetry(userId);
            }
          }, nextDelay);
          
          timeoutRefs.current.set(`retry-error-${operationId}`, timeout);
        } else {
          console.warn('⚠️ Profile loading failed after max retries, continuing without profile');
          updateState({ 
            isLoading: false,
            error: null // Não bloquear o usuário por problemas de perfil
          });
        }
      } finally {
        cancelOperation(operationId);
      }
    };

    // Debounced state update to prevent flickering
    const debouncedUpdateState = debounce(updateState, 100);

    const setupAuth = async () => {
      try {
        // Clear loading state if session check takes too long
        const setupTimeoutId = setTimeout(() => {
          if (isMounted) {
            console.log('⏰ Auth session check timed out');
            updateState({ isLoading: false });
          }
        }, 10000); // Aumentado para 10 segundos

        // First set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('🔄 Auth state changed:', event, currentSession?.user?.email);
            
            // Update the user state immediately
            debouncedUpdateState({
              user: currentSession?.user || null,
            });

            // Clear profile on sign out
            if (event === 'SIGNED_OUT') {
              console.log('👋 User signed out, clearing state');
              
              // Cancelar todas as operações em andamento
              activeOperations.current.forEach(cancelOperation);
              activeOperations.current.clear();
              
              updateState({ 
                profile: null,
                isLoading: false 
              });
              return;
            }

            // Fetch profile on sign in
            if (event === 'SIGNED_IN' && currentSession?.user) {
              console.log('👤 User signed in, fetching profile');
              
              // Set loading to true while fetching profile
              updateState({ isLoading: true });
              
              // Reset retry counter
              profileRetries = 0;
              
              // Use setTimeout to avoid potential deadlock with Supabase Auth
              setTimeout(() => {
                if (isMounted) {
                  fetchProfileWithRetry(currentSession.user.id);
                }
              }, 1000); // Aumentado para 1 segundo
            }
          }
        );

        // Then check for an existing session
        try {
          console.log('🔍 Checking for existing session...');
          const sessionPromise = supabase.auth.getSession();
          const { data: { session: currentSession } } = await withOperationTimeout(
            sessionPromise, 
            8000, 
            'getSession'
          );
          
          console.log('📋 Existing session:', currentSession?.user?.email || 'None');
          
          // Clear timeout since we got a response
          clearTimeout(setupTimeoutId);
          
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
        } catch (sessionError) {
          clearTimeout(setupTimeoutId);
          console.error('❌ Error checking session:', sessionError);
          updateState({ isLoading: false });
        }

        // Return cleanup function
        return () => {
          console.log('🧹 Cleaning up auth session');
          isMounted = false;
          
          // Cancelar todas as operações ativas
          activeOperations.current.forEach(cancelOperation);
          activeOperations.current.clear();
          
          // Limpar todos os timeouts
          timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
          timeoutRefs.current.clear();
          
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('❌ Critical error in auth setup:', error);
        if (isMounted) {
          updateState({ isLoading: false, error: null }); // Não mostrar erro crítico
        }
      }
    };

    // Execute setup
    const cleanup = setupAuth();
    
    // Return cleanup function
    return () => {
      console.log('🧹 Component cleanup initiated');
      isMounted = false;
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [updateState]);
}
