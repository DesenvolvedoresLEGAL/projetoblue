
import { useState, useEffect } from 'react';
import { toast } from '@/utils/toast';
import { AssetWithRelations } from '@/types/assetWithRelations';
import { assetService } from '@modules/assets/services/asset';
import { showFriendlyError } from '@/utils/errorTranslator';

interface UseAssetEditFormProps {
  asset: AssetWithRelations | null;
  onAssetUpdated: () => void;
  onClose: () => void;
}

export const useAssetEditForm = ({ asset, onAssetUpdated, onClose }: UseAssetEditFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    model?: string;
    solution_id: number;
    serial_number?: string;
    iccid?: string;
    line_number?: string;
    radio?: string;
    status_id?: number;
    manufacturer_id?: number;
    plan_id?: number;
    rented_days?: string;
    admin_user?: string;
    admin_pass?: string;
    ssid_atual?: string;
    pass_atual?: string;
  }>(null);

  // Determine if asset is a CHIP based on solution id
  const isChip = asset?.solucao?.id === 11;

  useEffect(() => {
    if (asset) {
      
      setFormData({
        model: asset.model || '',
        serial_number: asset.serial_number || '',
        iccid: asset.iccid || '',
        line_number: asset.line_number?.toString() || '',
        radio: asset.radio || '',
        status_id: asset.status?.id || 1,
        manufacturer_id: asset.manufacturer?.id || undefined,
        plan_id: asset.plan?.id || undefined,
        rented_days: asset.rented_days?.toString() || '0',
        admin_user: asset.admin_user || 'admin',
        admin_pass: asset.admin_pass || '',
        solution_id: asset.solution_id || undefined
      });
    }
  }, [asset]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    const status_id = parseInt(value);
    
    setFormData(prev => ({ ...prev, status_id }));
  };
  
  const handleSolutionChange = (value: string) => {
    const solution_id = parseInt(value);
    
    setFormData(prev => ({ ...prev, solution_id }));
  };

  const handleManufacturerChange = (value: string) => {
    const manufacturer_id = parseInt(value);
    
    setFormData(prev => ({ ...prev, manufacturer_id }));
  };

  const handlePlanChange = (value: string) => {
    const plan_id = parseInt(value);
    
    setFormData(prev => ({ ...prev, plan_id }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset) return;
    
    setIsLoading(true);
    
    try {
      // Prepare data to update based on the asset type
      const dataToUpdate: Record<string, unknown> = {
        status_id: formData.status_id,
        manufacturer_id: formData.manufacturer_id,
        solution_id: formData.solution_id
      };
      
      if (isChip) {
        // For CHIP type
        dataToUpdate.iccid = formData.iccid;
        dataToUpdate.line_number = formData.line_number ? parseInt(formData.line_number) : null;
        dataToUpdate.plan_id = formData.plan_id;
        // Explicitly do NOT include radio field for CHIP
      } else {
        // For other asset types (non-CHIP)
        dataToUpdate.model = formData.model;
        dataToUpdate.serial_number = formData.serial_number;
        dataToUpdate.radio = formData.radio; // Include radio only for non-CHIP assets
        dataToUpdate.rented_days = formData.rented_days ? parseInt(formData.rented_days) : 0;
        dataToUpdate.admin_user = formData.admin_user || 'admin';
        dataToUpdate.admin_pass = formData.admin_pass || '';
        dataToUpdate.ssid_atual = formData.ssid_atual || '';
        dataToUpdate.pass_atual = formData.pass_atual || '';
      }
      
      
      const updatedAsset = await assetService.updateAsset(asset.uuid, dataToUpdate);
      
      if (updatedAsset) {
        toast.success("Ativo atualizado com sucesso");
        onAssetUpdated();
        onClose();
      } else {
        toast.error("Não foi possível atualizar o ativo. Tente novamente ou entre em contato com o suporte.");
      }
    } catch (error) {
      
      const friendlyMessage = showFriendlyError(error, 'update');
      toast.error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    formData,
    isChip,
    handleChange,
    handleStatusChange,
    handleManufacturerChange,
    handlePlanChange,
    handleSubmit,
    handleSolutionChange
  };
};
