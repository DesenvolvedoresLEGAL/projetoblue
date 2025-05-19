
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { profileService } from '@/services/profileService';

export function useAuthSession(updateState: (state: any) => void) {
  useEffect(() => {
    const setupAuth = async () => {
      // First set up the auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          console.log('Auth state changed:', event, currentSession?.user?.email);
          
          // Update the user state immediately
          updateState({
            user: currentSession?.user || null,
          });

          // Clear profile on sign out
          if (event === 'SIGNED_OUT') {
            updateState({ 
              profile: null,
              isLoading: false 
            });
          }

          // Fetch profile on sign in
          if (event === 'SIGNED_IN' && currentSession?.user) {
            // Use setTimeout to avoid potential deadlock with Supabase Auth
            setTimeout(async () => {
              try {
                const profile = await profileService.fetchUserProfile(currentSession.user.id);
                console.log('Profile fetched after sign in:', profile);
                updateState({ 
                  profile,
                  isLoading: false 
                });
              } catch (error) {
                console.error('Error fetching profile after sign in:', error);
                updateState({ isLoading: false });
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
        
        // Update user state from existing session
        updateState({
          user: currentSession?.user || null,
        });

        // Fetch profile if user is signed in
        if (currentSession?.user) {
          try {
            const profile = await profileService.fetchUserProfile(currentSession.user.id);
            console.log('Profile fetched from existing session:', profile);
            updateState({ 
              profile,
              isLoading: false 
            });
          } catch (error) {
            console.error('Error fetching profile from existing session:', error);
            updateState({ isLoading: false });
          }
        } else {
          // No existing session, mark as not loading
          updateState({ isLoading: false });
        }
      } catch (error) {
        console.error('Error checking session:', error);
        updateState({ isLoading: false });
      }

      // Return cleanup function
      return () => {
        subscription.unsubscribe();
      };
    };

    // Execute setup
    setupAuth();
  }, [updateState]);
}
