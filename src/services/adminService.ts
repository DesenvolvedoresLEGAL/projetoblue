
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_approved: boolean;
  created_at: string;
  last_login?: string;
}

export interface ProfileUpdateData {
  email?: string;
  is_active?: boolean;
  is_approved?: boolean;
}

const adminService = {
  async listUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase.rpc('admin_list_users');
      
      if (error) {
        console.error('Erro ao listar usuários:', error);
        throw new Error(error.message || 'Falha ao carregar usuários');
      }
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Expected array from admin_list_users, got:', typeof data);
        return [];
      }
      
      return data as AdminUser[];
    } catch (error: any) {
      console.error('Erro ao listar usuários:', error);
      throw new Error(error.message || 'Não foi possível carregar a lista de usuários');
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase.rpc('admin_delete_user', {
        user_id: userId
      });

      if (error) {
        throw new Error(error.message || 'Falha ao deletar usuário');
      }

      if (!data) {
        throw new Error('Falha ao deletar usuário');
      }
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      throw new Error(error.message || 'Não foi possível deletar o usuário');
    }
  },

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    try {
      const { data, error } = await supabase.rpc('admin_update_user_role', {
        user_id: userId,
        new_role: role
      });

      if (error) {
        throw new Error(error.message || 'Falha ao atualizar role');
      }

      if (!data) {
        throw new Error('Falha ao atualizar role');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar role:', error);
      throw new Error(error.message || 'Não foi possível atualizar o cargo');
    }
  },

  async updateUserProfile(userId: string, profileData: ProfileUpdateData): Promise<void> {
    try {
      const { data, error } = await supabase.rpc('admin_update_user_profile', {
        user_id: userId,
        profile_updates: profileData
      });

      if (error) {
        throw new Error(error.message || 'Falha ao atualizar perfil');
      }

      if (!data) {
        throw new Error('Falha ao atualizar perfil');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      throw new Error(error.message || 'Não foi possível atualizar o perfil');
    }
  }
};

export { adminService };
