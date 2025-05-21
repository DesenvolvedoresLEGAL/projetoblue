
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AssetWithRelations } from '@/hooks/useAssetsData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAssetEditForm } from '@/hooks/useAssetEditForm';
import { referenceDataService } from '@/services/api/referenceDataService';
import CommonFormFields from './edit/CommonFormFields';
import ChipEditForm from './edit/ChipEditForm';
import DeviceEditForm from './edit/DeviceEditForm';

interface EditAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithRelations | null;
  onAssetUpdated: () => void;
}

const EditAssetDialog = ({ isOpen, onClose, asset, onAssetUpdated }: EditAssetDialogProps) => {
  const {
    isLoading,
    formData,
    isChip,
    handleChange,
    handleStatusChange,
    handleManufacturerChange,
    handlePlanChange,
    handleSubmit
  } = useAssetEditForm({ asset, onAssetUpdated, onClose });
  
  // Fetch manufacturers and plans for dropdowns
  const { data: allManufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: () => referenceDataService.getManufacturers(),
    enabled: isOpen,
  });
  
  // Filter manufacturers - only show operators for chips
  const manufacturers = isChip
    ? allManufacturers.filter(m => ['CLARO', 'VIVO', 'TIM', 'OI'].includes(m.name.toUpperCase()))
    : allManufacturers;
  
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('plans').select('id, nome');
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching plans:', error);
        return [];
      }
    },
    enabled: isOpen,
  });

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Editar Ativo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <CommonFormFields 
              formData={formData}
              isChip={isChip}
              handleStatusChange={handleStatusChange}
              handleManufacturerChange={handleManufacturerChange}
              manufacturers={manufacturers}
            />
            
            {isChip ? (
              <ChipEditForm 
                formData={formData}
                handleChange={handleChange}
                handlePlanChange={handlePlanChange}
                plans={plans}
              />
            ) : (
              <DeviceEditForm 
                formData={formData}
                handleChange={handleChange}
              />
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssetDialog;
