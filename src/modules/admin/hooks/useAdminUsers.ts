
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, type AdminUser, type ProfileUpdateData } from '@/services/adminService';
import { UserRole } from '@/types/auth';
import { toast } from '@/utils/toast';

// Query para listar usuários
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.listUsers,
    staleTime: 30000, // 30 segundos
    gcTime: 300000, // 5 minutos
  });
};

// Mutation para deletar usuário
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuário removido com sucesso');
    },
    onError: (error: Error) => {
      console.error('Erro ao deletar usuário:', error);
      toast.error(error.message || 'Não foi possível deletar o usuário');
    },
  });
};

// Mutation para atualizar role
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Cargo atualizado com sucesso');
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar role:', error);
      toast.error(error.message || 'Não foi possível atualizar o cargo');
    },
  });
};

// Mutation para atualizar perfil
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, profileData }: { userId: string; profileData: ProfileUpdateData }) =>
      adminService.updateUserProfile(userId, profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Perfil atualizado com sucesso');
    },
    onError: (error: Error) => {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.message || 'Não foi possível atualizar o perfil');
    },
  });
};
