
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

export const profileService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        // Update profile is_active status if needed
        if (data.is_active === false) {
          await supabase
            .from('profiles')
            .update({ is_active: true })
            .eq('id', userId);
        }
      }

      if (data) {
        // Map the profiles table fields to the UserProfile type
        return {
          id: data.id,
          email: data.email,
          role: data.role === 'admin' ? 'admin' : 'analyst',
          created_at: data.created_at || new Date().toISOString(),
          last_login: new Date().toISOString(), // No field for this, use current date
          is_active: Boolean(data.is_active),
          is_approved: Boolean(data.is_active)
        };
      }

      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  },
};
