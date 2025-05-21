import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AssetWithRelations } from '@/hooks/useAssetsData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assetService } from '@/services/api/asset';
import { toast } from '@/utils/toast';
import { referenceDataService } from '@/services/api/referenceDataService';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EditAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithRelations | null;
  onAssetUpdated: () => void;
}

const EditAssetDialog = ({ isOpen, onClose, asset, onAssetUpdated }: EditAssetDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData<{
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

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Editar Ativo</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status_id">Status</Label>
              <Select
                value={formData.status_id?.toString()}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">DISPONÍVEL</SelectItem>
                  <SelectItem value="2">ALUGADO</SelectItem>
                  <SelectItem value="3">ASSINATURA</SelectItem>
                  <SelectItem value="4">SEM DADOS</SelectItem>
                  <SelectItem value="5">BLOQUEADO</SelectItem>
                  <SelectItem value="6">MANUTENÇÃO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manufacturer_id">{isChip ? 'Operadora' : 'Fabricante'}</Label>
              <Select
                value={formData.manufacturer_id?.toString()}
                onValueChange={handleManufacturerChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={`Selecione ${isChip ? 'uma operadora' : 'um fabricante'}`} />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.map(manufacturer => (
                    <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                      {manufacturer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Only show Radio field for non-CHIP assets */}
            {!isChip && (
              <div className="space-y-2">
                <Label htmlFor="radio">Etiqueta / Rádio</Label>
                <Input
                  id="radio"
                  name="radio"
                  value={formData.radio || ''}
                  onChange={handleChange}
                />
              </div>
            )}

            {isChip ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="iccid">ICCID</Label>
                  <Input
                    id="iccid"
                    name="iccid"
                    value={formData.iccid || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="line_number">Número da Linha</Label>
                  <Input
                    id="line_number"
                    name="line_number"
                    value={formData.line_number || ''}
                    onChange={handleChange}
                    type="number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plan_id">Plano</Label>
                  <Select
                    value={formData.plan_id?.toString()}
                    onValueChange={handlePlanChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serial_number">Número de Série</Label>
                  <Input
                    id="serial_number"
                    name="serial_number"
                    value={formData.serial_number || ''}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rented_days">Dias Alugados</Label>
                  <Input
                    id="rented_days"
                    name="rented_days"
                    type="number"
                    value={formData.rented_days || '0'}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin_user">Usuário Admin</Label>
                  <Input
                    id="admin_user"
                    name="admin_user"
                    value={formData.admin_user || 'admin'}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin_pass">Senha Admin</Label>
                  <Input
                    id="admin_pass"
                    name="admin_pass"
                    type="password"
                    value={formData.admin_pass || ''}
                    onChange={handleChange}
                    placeholder="Digite para alterar a senha"
                  />
                </div>
              </>
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
