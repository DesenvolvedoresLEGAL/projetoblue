
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AssetWithRelations } from './useAssetsData';
import { assetService } from '@/services/api/asset';
import { toast } from '@/utils/toast';

interface UseAssetEditFormProps {
  asset: AssetWithRelations | null;
  onAssetUpdated: () => void;
  onClose: () => void;
}

export const useAssetEditForm = ({ asset, onAssetUpdated, onClose }: UseAssetEditFormProps) => {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    status_id: 1,
    manufacturer_id: undefined as number | undefined,
    plan_id: undefined as number | undefined,
    // CHIP specific fields
    iccid: '',
    line_number: undefined as number | undefined,
    // Device specific fields
    model: '',
    serial_number: '',
    radio: '',
    admin_user: '',
    admin_pass: '',
    rented_days: 0,
  });

  // Detectar se é chip baseado no solution_id
  const isChip = asset?.solucao?.id === 11;

  // Preencher formulário quando asset muda
  useEffect(() => {
    if (asset) {
      console.log('🔄 Preenchendo formulário com dados do asset:', asset);
      setFormData({
        status_id: asset.status?.id || 1,
        manufacturer_id: asset.manufacturer?.id,
        plan_id: asset.plano?.id,
        // CHIP fields
        iccid: asset.iccid || '',
        line_number: asset.line_number,
        // Device fields
        model: asset.model || '',
        serial_number: asset.serial_number || '',
        radio: asset.radio || '',
        admin_user: asset.admin_user || 'admin',
        admin_pass: asset.admin_pass || '',
        rented_days: asset.rented_days || 0,
      });
    }
  }, [asset]);

  // Mutation para atualizar asset
  const updateMutation = useMutation({
    mutationFn: async (updateData: any) => {
      if (!asset) throw new Error('Asset não encontrado');
      
      console.log('📤 Enviando dados de atualização:', updateData);
      const result = await assetService.updateAsset(asset.uuid, updateData);
      
      if (!result) {
        throw new Error('Falha na atualização do asset');
      }
      
      return result;
    },
    onSuccess: () => {
      console.log('✅ Asset atualizado com sucesso');
      toast.success('Asset atualizado com sucesso');
      
      // Invalidar queries relacionadas para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      
      // Callbacks
      onAssetUpdated();
      onClose();
    },
    onError: (error: Error) => {
      console.error('❌ Erro ao atualizar asset:', error);
      toast.error(`Erro ao atualizar asset: ${error.message}`);
    },
  });

  // Handlers para mudanças nos campos
  const handleChange = (field: string, value: any) => {
    console.log(`🔧 Alterando campo ${field} para:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatusChange = (statusId: string) => {
    console.log('🏷️ Alterando status para:', statusId);
    handleChange('status_id', Number(statusId));
  };

  const handleManufacturerChange = (manufacturerId: string) => {
    console.log('🏭 Alterando fabricante para:', manufacturerId);
    handleChange('manufacturer_id', Number(manufacturerId));
  };

  const handlePlanChange = (planId: string) => {
    console.log('📋 Alterando plano para:', planId);
    handleChange('plan_id', Number(planId));
  };

  // Submit do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset) {
      toast.error('Asset não encontrado');
      return;
    }

    // Preparar dados para envio baseado no tipo do asset
    const updateData: any = {
      status_id: formData.status_id,
      manufacturer_id: formData.manufacturer_id,
      rented_days: formData.rented_days,
    };

    if (isChip) {
      // Campos específicos para CHIPs
      updateData.iccid = formData.iccid;
      updateData.line_number = formData.line_number;
      updateData.plan_id = formData.plan_id;
    } else {
      // Campos específicos para dispositivos
      updateData.model = formData.model;
      updateData.serial_number = formData.serial_number;
      updateData.radio = formData.radio;
      updateData.admin_user = formData.admin_user;
      updateData.admin_pass = formData.admin_pass;
    }

    console.log('📝 Submetendo formulário com dados:', updateData);
    updateMutation.mutate(updateData);
  };

  return {
    formData,
    isChip,
    isLoading: updateMutation.isPending,
    handleChange,
    handleStatusChange,
    handleManufacturerChange,
    handlePlanChange,
    handleSubmit,
  };
};
