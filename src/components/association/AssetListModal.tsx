
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Package, Smartphone } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SelectedAsset } from '@/pages/AssetAssociation';

interface AssetListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssetSelected: (asset: SelectedAsset) => void;
  selectedAssets: SelectedAsset[];
  type: 'equipment' | 'chip';
}

export const AssetListModal: React.FC<AssetListModalProps> = ({
  open,
  onOpenChange,
  onAssetSelected,
  selectedAssets,
  type
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['available-assets', type, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('assets')
        .select(`
          uuid, serial_number, model, iccid, solution_id, status_id, 
          line_number, radio, manufacturer_id, created_at, updated_at,
          manufacturers(id, name),
          asset_status(id, status),
          asset_solutions(id, solution)
        `)
        .is('deleted_at', null)
        .eq('status_id', 1); // Apenas ativos disponíveis

      if (type === 'chip') {
        query = query.eq('solution_id', 11); // CHIPs
        if (searchTerm.trim()) {
          query = query.ilike('iccid', `%${searchTerm.trim()}%`);
        }
      } else {
        query = query.neq('solution_id', 11); // Equipamentos (não CHIPs)
        if (searchTerm.trim()) {
          query = query.or(
            `radio.ilike.%${searchTerm.trim()}%,` +
            `serial_number.ilike.%${searchTerm.trim()}%,` +
            `model.ilike.%${searchTerm.trim()}%`
          );
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(50);

      if (error) {
        console.error('Error fetching assets:', error);
        throw error;
      }

      // Filtrar ativos já selecionados
      const alreadySelected = selectedAssets.map(a => a.uuid);
      const availableAssets = data?.filter(asset => !alreadySelected.includes(asset.uuid)) || [];

      return availableAssets.map(asset => ({
        id: asset.uuid,
        uuid: asset.uuid,
        type: asset.solution_id === 11 ? 'CHIP' : 'ROTEADOR',
        registrationDate: asset.created_at,
        status: asset.asset_status?.status || 'DISPONÍVEL',
        statusId: asset.status_id,
        solucao: asset.asset_solutions?.solution,
        marca: asset.manufacturers?.name,
        modelo: asset.model,
        serial_number: asset.serial_number,
        model: asset.model,
        radio: asset.radio,
        solution_id: asset.solution_id,
        manufacturer_id: asset.manufacturer_id,
        iccid: asset.iccid,
        line_number: asset.line_number?.toString() || '',
        phoneNumber: asset.line_number?.toString() || '',
        carrier: 'Unknown',
        uniqueId: asset.uuid,
        brand: asset.manufacturers?.name || '',
        ssid: '#WiFi.LEGAL',
        password: '123legal',
        serialNumber: asset.serial_number || ''
      })) as SelectedAsset[];
    },
    enabled: open
  });

  const handleAssetSelect = (asset: SelectedAsset) => {
    onAssetSelected(asset);
    onOpenChange(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'chip' ? <Smartphone className="h-5 w-5" /> : <Package className="h-5 w-5" />}
            Selecionar {type === 'chip' ? 'CHIP' : 'Equipamento'}
          </DialogTitle>
          <DialogDescription>
            {type === 'chip' 
              ? 'Escolha um CHIP disponível para associar'
              : 'Escolha um equipamento disponível para associar'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Campo de busca */}
          <div className="space-y-2">
            <Label htmlFor="asset-search">
              {type === 'chip' ? 'Buscar por ICCID' : 'Buscar por Rádio, Serial ou Modelo'}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="asset-search"
                placeholder={type === 'chip' ? 'Digite o ICCID...' : 'Digite rádio, serial ou modelo...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de ativos */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Carregando ativos...
              </div>
            ) : assets.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground mb-2">
                  {assets.length} {type === 'chip' ? 'CHIP(s)' : 'equipamento(s)'} disponível(is):
                </div>
                {assets.map((asset) => (
                  <div
                    key={asset.uuid}
                    className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleAssetSelect(asset)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium flex items-center gap-2">
                        {type === 'chip' ? '📱' : '📡'} 
                        {asset.solucao}
                      </div>
                      <Badge variant="secondary">{asset.status}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {type === 'chip' ? (
                        <>
                          <div>ICCID: {asset.iccid}</div>
                          <div>Linha: {asset.line_number || 'Não informada'}</div>
                        </>
                      ) : (
                        <>
                          <div>Rádio: {asset.radio || 'Não informado'}</div>
                          <div>Serial: {asset.serial_number || 'Não informado'}</div>
                          <div>Modelo: {asset.model || 'Não informado'}</div>
                          <div>Fabricante: {asset.marca || 'Não informado'}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm.trim() 
                  ? `Nenhum ${type === 'chip' ? 'CHIP' : 'equipamento'} encontrado para "${searchTerm}"`
                  : `Nenhum ${type === 'chip' ? 'CHIP' : 'equipamento'} disponível`
                }
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
