
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types/auth';

export const profileService = {
  async fetchUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log(`Fetching profile for user: ${userId}`);
      
      // First attempt with 'profiles' table query
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
        console.log('Profile found:', data.email);
        
        // Map the profiles table fields to the UserProfile type
        return {
          id: data.id,
          email: data.email,
          role: data.role as UserRole,
          created_at: data.created_at,
          last_login: data.last_login || new Date().toISOString(),
          is_active: data.is_active !== false, // Default to true if undefined
          is_approved: data.is_approved !== false, // Default to true if undefined
          bits_referral_code: data.bits_referral_code
        };
      }
      
      console.warn(`No profile found for user ${userId}, attempting to fetch user data instead`);
      
      // Fallback: try to get at least the user data if profile doesn't exist
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError || !userData?.user) {
        console.error('Error fetching user data as fallback:', userError);
        return null;
      }
      
      // Create a minimal profile from user data
      return {
        id: userData.user.id,
        email: userData.user.email || '',
        role: 'user', // Default role
        created_at: userData.user.created_at || new Date().toISOString(),
        last_login: new Date().toISOString(),
        is_active: true,
        is_approved: true
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Don't throw, just return null to let calling code handle it
      return null;
    }
  },
  
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      await supabase
        .from('profiles')
        .update({ last_login: now })
        .eq('id', userId);
      
      console.log(`Updated last_login for user ${userId}`);
    } catch (error) {
      console.error('Failed to update last_login:', error);
      // Non-critical error, don't throw
    }
  }
};
