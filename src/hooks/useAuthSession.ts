
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { profileService } from '@/services/profileService';

export function useAuthSession(updateState: (state: any) => void) {
  useEffect(() => {
    const setupAuth = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          console.log('Auth state changed:', event, currentSession?.user?.email);
          
          updateState({
            user: currentSession?.user || null,
            isLoading: false,
          });

          if (event === 'SIGNED_OUT') {
            updateState({ profile: null });
          }

          if (event === 'SIGNED_IN' && currentSession?.user) {
            setTimeout(async () => {
              try {
                const profile = await profileService.fetchUserProfile(currentSession.user.id);
                console.log('Profile fetched after sign in:', profile);
                updateState({ profile });
              } catch (error) {
                console.error('Error fetching profile after sign in:', error);
              }
            }, 0);
          }
        }
      );

      try {
        console.log('Checking for existing session...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Existing session:', currentSession?.user?.email || 'None');
        
        updateState({
          user: currentSession?.user || null,
          isLoading: false,
        });

        if (currentSession?.user) {
          try {
            const profile = await profileService.fetchUserProfile(currentSession.user.id);
            console.log('Profile fetched from existing session:', profile);
            updateState({ profile });
          } catch (error) {
            console.error('Error fetching profile from existing session:', error);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        updateState({ isLoading: false });
      }

      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();
  }, [updateState]);
}
