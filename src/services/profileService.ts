
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
        
        // Validate the role to ensure it's one of the valid values
        const role = data.role as UserRole;
        if (!['admin', 'gestor', 'consultor', 'suporte', 'cliente', 'user'].includes(role)) {
          console.warn(`Invalid role found for user ${userId}: ${role}, defaulting to 'cliente'`);
          data.role = 'cliente';
        }
        
        // Map the profiles table fields to the UserProfile type
        return {
          id: data.id,
          email: data.email,
          role: data.role as UserRole,
          created_at: data.created_at,
          last_login: data.last_login || new Date().toISOString(),
          is_active: data.is_active !== false, // Default to true if undefined
          is_approved: data.is_approved !== false, // Default to true if undefined
          bits_referral_code: data.bits_referral_code,
          updated_at: data.updated_at
        };
      }
      
      console.warn(`No profile found for user ${userId}, attempting to fetch user data instead`);
      
      // Fallback: try to get at least the user data if profile doesn't exist
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError || !userData?.user) {
        console.error('Error fetching user data as fallback:', userError);
        return null;
      }
      
      // Try to create the profile automatically
      try {
        const defaultRole: UserRole = 'cliente';
        const profileData = {
          id: userData.user.id,
          email: userData.user.email || '',
          role: defaultRole,
          is_active: true,
          is_approved: true
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(profileData);
          
        if (insertError) {
          console.error('Failed to create missing profile:', insertError);
        } else {
          console.log(`Created missing profile for user ${userData.user.id}`);
        }
        
        // Create a minimal profile from user data
        return {
          id: userData.user.id,
          email: userData.user.email || '',
          role: defaultRole,
          created_at: userData.user.created_at || new Date().toISOString(),
          last_login: new Date().toISOString(),
          is_active: true,
          is_approved: true
        };
      } catch (createError) {
        console.error('Error creating missing profile:', createError);
        // Still return a minimal profile to avoid interrupting the flow
        return {
          id: userData.user.id,
          email: userData.user.email || '',
          role: 'cliente', 
          created_at: userData.user.created_at || new Date().toISOString(),
          last_login: new Date().toISOString(),
          is_active: true,
          is_approved: true
        };
      }
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
        .update({ 
          last_login: now,
          updated_at: now
        })
        .eq('id', userId);
      
      console.log(`Updated last_login for user ${userId}`);
    } catch (error) {
      console.error('Failed to update last_login:', error);
      // Non-critical error, don't throw
    }
  }
};
