
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AssetWithRelations } from '@/hooks/useAssetsData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assetService } from '@/services/api/asset';
import { toast } from '@/utils/toast';

interface EditAssetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetWithRelations | null;
  onAssetUpdated: () => void;
}

const EditAssetDialog = ({ isOpen, onClose, asset, onAssetUpdated }: EditAssetDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    model?: string;
    serial_number?: string;
    iccid?: string;
    line_number?: string;
    radio?: string;
    status_id?: number;
  }>({});

  useEffect(() => {
    if (asset) {
      setFormData({
        model: asset.model || '',
        serial_number: asset.serial_number || '',
        iccid: asset.iccid || '',
        line_number: asset.line_number?.toString() || '',
        radio: asset.radio || '',
        status_id: asset.status.id || 1,
      });
    }
  }, [asset]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status_id: parseInt(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset) return;
    
    setIsLoading(true);
    
    try {
      // Convert line_number from string to number if it exists
      const dataToUpdate = {
        ...formData,
        line_number: formData.line_number ? parseInt(formData.line_number) : undefined
      };
      
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

            {asset.model !== undefined && (
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model || ''}
                  onChange={handleChange}
                />
              </div>
            )}

            {asset.solucao.id !== 11 && (
              <div className="space-y-2">
                <Label htmlFor="serial_number">Número de Série</Label>
                <Input
                  id="serial_number"
                  name="serial_number"
                  value={formData.serial_number || ''}
                  onChange={handleChange}
                />
              </div>
            )}

            {asset.solucao.id === 11 && (
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
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="radio">Rádio</Label>
              <Input
                id="radio"
                name="radio"
                value={formData.radio || ''}
                onChange={handleChange}
              />
            </div>
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
