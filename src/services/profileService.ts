import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types/auth';
import { toUserRole } from '@/utils/roleUtils';

export const profileService = {
  async fetchUserProfile(userId: string, includeDeleted = false): Promise<UserProfile | null> {
    try {
      console.log(`Fetching profile for user: ${userId}`);
      
      // First attempt with 'profiles' table query
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);

      // Apply soft-delete filter unless explicitly included
      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (data) {
        console.log('Profile found:', data.email);
        
        // Normalizar role para garantir valor reconhecido
        data.role = toUserRole(data.role as string);
        
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
          updated_at: data.updated_at,
          deleted_at: data.deleted_at // Incluir deleted_at no retorno
        };
      }
      
      console.warn(`No profile found for user ${userId}, attempting to create profile`);
      
      // MELHORADO: Tentar criar perfil sem depender de auth.getUser()
      try {
        console.log(`Tentando criar perfil via ensure_user_profile RPC para usuário ${userId}`);
        
        // FALLBACK: Não tentar obter userData se temos problemas de auth
        // Em vez disso, usar o email da sessão atual se disponível
        const session = await supabase.auth.getSession();
        const userEmail = session.data.session?.user?.email;
        
        if (!userEmail) {
          console.error('Não foi possível obter email do usuário da sessão');
          return null;
        }
        
        // Chamar a função RPC para garantir a criação do perfil
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('ensure_user_profile', {
            user_id: userId,
            user_email: userEmail,
            user_role: 'cliente'
          });
          
        if (rpcError) {
          console.error('Falha ao criar perfil via RPC:', rpcError);
        } else {
          console.log('RPC ensure_user_profile executado:', rpcData);
          
          // Tentar buscar o perfil novamente após criação
          let retryQuery = supabase
            .from('profiles')
            .select('*')
            .eq('id', userId);

          if (!includeDeleted) {
            retryQuery = retryQuery.is('deleted_at', null);
          }

          const { data: newProfileData } = await retryQuery.maybeSingle();
            
          if (newProfileData) {
            console.log('Perfil encontrado após criação via RPC');
            return {
              id: newProfileData.id,
              email: newProfileData.email,
              role: newProfileData.role as UserRole,
              created_at: newProfileData.created_at,
              last_login: newProfileData.last_login || new Date().toISOString(),
              is_active: newProfileData.is_active !== false,
              is_approved: newProfileData.is_approved !== false,
              bits_referral_code: newProfileData.bits_referral_code,
              updated_at: newProfileData.updated_at,
              deleted_at: newProfileData.deleted_at
            };
          }
        }
        
        // Fallback final: criar um perfil mínimo se não conseguiu via RPC
        if (userEmail) {
          return {
            id: userId,
            email: userEmail,
            role: 'cliente', 
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            is_active: true,
            is_approved: true
          };
        }
        
        return null;
      } catch (createError) {
        console.error('Error creating missing profile:', createError);
        return null;
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
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
