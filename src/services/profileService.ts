
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
        // Map the profiles table fields to the UserProfile type
        return {
          id: data.id,
          email: data.email,
          role: data.role === 'admin' ? 'admin' : 'analyst',
          created_at: data.created_at || new Date().toISOString(),
          last_login: new Date().toISOString(), // This field may not be in the table
          is_active: true, // Default value since it might not exist in the table
          is_approved: true // Default value since it might not exist in the table
        };
      }

      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  },
};
