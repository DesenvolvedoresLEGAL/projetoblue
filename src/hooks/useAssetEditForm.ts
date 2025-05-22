
import { useState, useEffect } from 'react';
import { AssetWithRelations } from '@/hooks/useAssetsData';
import assetService from '@/services/api/asset';
import { toast } from '@/utils/toast';

interface UseAssetEditFormProps {
  asset: AssetWithRelations | null;
  onAssetUpdated: () => void;
  onClose: () => void;
}

export const useAssetEditForm = ({ asset, onAssetUpdated, onClose }: UseAssetEditFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    model?: string;
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
  }>({});

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
        plan_id: asset.plano?.id || undefined,
        rented_days: asset.rented_days?.toString() || '0',
        admin_user: asset.admin_user || 'admin',
        admin_pass: asset.admin_pass || '',
      });
    }
  }, [asset]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    const statusId = parseInt(value);
    console.log(`Setting status_id to: ${statusId}`);
    setFormData(prev => ({ ...prev, status_id: statusId }));
  };

  const handleManufacturerChange = (value: string) => {
    const manufacturerId = parseInt(value);
    console.log(`Setting manufacturer_id to: ${manufacturerId}`);
    setFormData(prev => ({ ...prev, manufacturer_id: manufacturerId }));
  };

  const handlePlanChange = (value: string) => {
    const planId = parseInt(value);
    console.log(`Setting plan_id to: ${planId}`);
    setFormData(prev => ({ ...prev, plan_id: planId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset) return;
    
    setIsLoading(true);
    console.log('Form data to submit:', formData);
    
    try {
      // Prepare data to update based on the asset type
      const dataToUpdate: any = {
        statusId: formData.status_id,
        manufacturer_id: formData.manufacturer_id
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
      }
      
      console.log('Calling updateAsset with data:', dataToUpdate);
      const updatedAsset = await assetService.updateAsset(asset.uuid, dataToUpdate);
      
      if (updatedAsset) {
        toast.success("Ativo atualizado com sucesso");
        onAssetUpdated();
        onClose();
      } else {
        toast.error("Falha ao atualizar ativo");
      }
    } catch (error) {
      console.error('Erro ao atualizar ativo:', error);
      toast.error("Ocorreu um erro ao processar a solicitação");
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
    handleSubmit
  };
};
