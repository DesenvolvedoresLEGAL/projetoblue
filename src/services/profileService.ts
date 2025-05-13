
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/auth';

export const profileService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('uuid', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        await supabase
          .from('users')
          .update({ is_approved: data.is_approved })
          .eq('uuid', userId);
      }

      if (data) {
        // Map the users table fields to the UserProfile type
        return {
          id: data.uuid,
          email: data.email,
          role: data.id_role === 1 ? 'admin' : 'analyst',
          created_at: new Date().toISOString(), // Use current date since field doesn't exist
          last_login: new Date().toISOString(), // Use current date since field doesn't exist
          is_active: Boolean(data.is_approved),
          is_approved: Boolean(data.is_approved)
        };
      }

      return null;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  },
};
