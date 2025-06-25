import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AssetWithRelations } from '@/types/assetWithRelations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAssetEditForm } from '@modules/assets/hooks/useAssetEditForm';
import { referenceDataService } from '@modules/assets/services/referenceDataService';
import { useIsMobile } from '@/hooks/useIsMobile';
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
  const isMobile = useIsMobile();
  
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
      <DialogContent 
        className={`
          ${isMobile 
            ? 'w-full max-w-[95vw] h-[90vh] max-h-[90vh] m-2 p-0' 
            : 'max-w-md max-h-[85vh]'
          }
          overflow-hidden flex flex-col
        `}
      >
        <DialogHeader className={isMobile ? "p-4 pb-2 flex-shrink-0" : "flex-shrink-0"}>
          <DialogTitle className={`font-medium ${isMobile ? 'text-lg' : 'text-xl'}`}>
            Editar Ativo
          </DialogTitle>
        </DialogHeader>
        
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-4' : 'px-6'}`}>
          <form onSubmit={handleSubmit} className={`space-y-${isMobile ? '4' : '4'} pb-4`}>
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
          </form>
        </div>
        
        <DialogFooter 
          className={`
            flex-shrink-0 border-t bg-background
            ${isMobile 
              ? 'flex-col space-y-2 p-4 gap-0' 
              : 'flex-row space-y-0 p-6 pt-4'
            }
          `}
        >
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
            className={isMobile ? 'w-full h-12 text-base order-2' : 'w-auto'}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            onClick={handleSubmit}
            className={isMobile ? 'w-full h-12 text-base order-1' : 'w-auto'}
          >
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditAssetDialog;
