import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SetupService } from '../services/setupService';
import type { SetupStatus, SetupFormData } from '../types';
import { toast } from 'sonner';

// Hook for getting technician setups
export const useSetupList = (
  technicianId: string,
  filters?: {
    status?: SetupStatus;
    from?: string;
    to?: string;
  }
) => {
  return useQuery({
    queryKey: ['setups', technicianId, filters],
    queryFn: () => SetupService.getSetupsForTechnician(technicianId, filters),
    enabled: !!technicianId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute - for realtime updates
  });
};

// Hook for getting single setup
export const useSetupDetails = (setupId: string) => {
  return useQuery({
    queryKey: ['setup', setupId],
    queryFn: () => SetupService.getSetup(setupId),
    enabled: !!setupId,
    staleTime: 30000,
  });
};

// Hook for starting a setup
export const useStartSetup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, technicianId }: { orderId: string; technicianId?: string }) =>
      SetupService.startSetup(orderId, technicianId),
    onSuccess: (data) => {
      toast.success('Setup iniciado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['setups'] });
      return data;
    },
    onError: (error) => {
      toast.error('Erro ao iniciar setup: ' + error.message);
    },
  });
};

// Hook for completing a setup
export const useCompleteSetup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setupId, formData }: { setupId: string; formData: SetupFormData }) =>
      SetupService.completeSetup(setupId, formData),
    onSuccess: () => {
      toast.success('Setup concluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['setups'] });
      queryClient.invalidateQueries({ queryKey: ['setup'] });
    },
    onError: (error) => {
      toast.error('Erro ao concluir setup: ' + error.message);
    },
  });
};

// Hook for approving a setup (supervisor)
export const useApproveSetup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (setupId: string) => SetupService.approveSetup(setupId),
    onSuccess: () => {
      toast.success('Setup aprovado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['setups'] });
      queryClient.invalidateQueries({ queryKey: ['setup'] });
    },
    onError: (error) => {
      toast.error('Erro ao aprovar setup: ' + error.message);
    },
  });
};

// Hook for rejecting a setup (supervisor)
export const useRejectSetup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setupId, reason }: { setupId: string; reason: string }) =>
      SetupService.rejectSetup(setupId, reason),
    onSuccess: () => {
      toast.success('Setup rejeitado.');
      queryClient.invalidateQueries({ queryKey: ['setups'] });
      queryClient.invalidateQueries({ queryKey: ['setup'] });
    },
    onError: (error) => {
      toast.error('Erro ao rejeitar setup: ' + error.message);
    },
  });
};

// Hook for QR scanning
export const useQRScanner = () => {
  return useMutation({
    mutationFn: async (qrCode: string) => {
      return Promise.resolve(SetupService.parseQRCode(qrCode));
    },
    onError: (error) => {
      toast.error('QR Code inválido: ' + error.message);
    },
  });
};