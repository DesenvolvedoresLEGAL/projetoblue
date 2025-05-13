
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types/auth';

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
          role: data.role as UserRole,
          created_at: data.created_at || new Date().toISOString(),
          last_login: new Date().toISOString(), // No field for this, use current date
          is_active: true, // Default to true since this field doesn't exist in DB
          is_approved: true // Default to true since this field doesn't exist in DB
        };
      }

      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  },
};
