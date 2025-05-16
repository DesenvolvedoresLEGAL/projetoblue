
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { profileService } from '@/services/profileService';

export function useAuthSession(updateState: (state: any) => void) {
  // Use a ref to track component mount state
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Set flag to true on mount
    isMounted.current = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        if (!isMounted.current) return;
        
        // Update user state based on session
        updateState({
          user: currentSession?.user || null,
          isLoading: false,
        });

        // Handle specific events
        if (event === 'SIGNED_OUT') {
          if (isMounted.current) {
            updateState({ profile: null });
          }
        }

        // Fetch profile only after sign in and when component is still mounted
        if (event === 'SIGNED_IN' && currentSession?.user && isMounted.current) {
          try {
            const profile = await profileService.fetchUserProfile(currentSession.user.id);
            console.log('Profile fetched after sign in:', profile);
            
            if (isMounted.current) {
              updateState({ profile });
            }
          } catch (error) {
            console.error('Error fetching profile after sign in:', error);
          }
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
        
        updateState({
          user: currentSession?.user || null,
          isLoading: false,
        });

        // If there's a session, fetch the user profile
        if (currentSession?.user && isMounted.current) {
          try {
            const profile = await profileService.fetchUserProfile(currentSession.user.id);
            console.log('Profile fetched from existing session:', profile);
            
            if (isMounted.current) {
              updateState({ profile });
            }
          } catch (error) {
            console.error('Error fetching profile from existing session:', error);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (isMounted.current) {
          updateState({ isLoading: false });
        }
      }
    };

    checkExistingSession();

    // Cleanup function
    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [updateState]);
}
