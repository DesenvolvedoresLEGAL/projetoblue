
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SelectedAsset } from '@/pages/AssetAssociation';
import { toast } from 'sonner';
import { Search, Package } from "lucide-react";

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

  // Buscar ativos disponíveis
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
        .eq('status_id', 1); // Apenas disponíveis

      // Filtrar por tipo
      if (type === 'chip') {
        query = query.eq('solution_id', 11);
        if (searchTerm.trim()) {
          query = query.ilike('iccid', `%${searchTerm.trim()}%`);
        }
      } else {
        query = query.neq('solution_id', 11);
        if (searchTerm.trim()) {
          query = query.or(
            `radio.ilike.%${searchTerm.trim()}%,` +
            `serial_number.ilike.%${searchTerm.trim()}%,` +
            `model.ilike.%${searchTerm.trim()}%`
          );
        }
      }

      // Verificar quais ativos já estão associados
      const { data: associatedAssets } = await supabase
        .from('asset_client_assoc')
        .select('asset_id')
        .is('exit_date', null);

      const associatedIds = associatedAssets?.map(a => a.asset_id) || [];

      const { data, error } = await query
        .not('uuid', 'in', `(${associatedIds.join(',')})`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar ativos:', error);
        throw error;
      }

      return data.map(asset => ({
        id: asset.uuid,
        uuid: asset.uuid,
        type: asset.solution_id === 11 ? 'CHIP' : 'EQUIPMENT',
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
        serialNumber: asset.serial_number || '',
        gb: 0,
        notes: '',
        rented_days: 0,
        admin_user: 'admin',
        admin_pass: '',
        plan_id: 1,
        associationType: 'aluguel',
        startDate: new Date().toISOString().split('T')[0]
      })) as SelectedAsset[];
    },
    enabled: open
  });

  const handleAssetSelect = (asset: SelectedAsset) => {
    // Verificar se já foi selecionado
    if (selectedAssets.some(selected => selected.uuid === asset.uuid)) {
      toast.error('Este ativo já foi selecionado');
      return;
    }

    onAssetSelected(asset);
    onOpenChange(false);
    toast.success(`${type === 'chip' ? 'CHIP' : 'Equipamento'} adicionado com sucesso!`);
  };

  const filteredAssets = assets.filter(asset => 
    !selectedAssets.some(selected => selected.uuid === asset.uuid)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {type === 'chip' ? '📱 CHIPs Disponíveis' : '📡 Equipamentos Disponíveis'}
          </DialogTitle>
          <DialogDescription>
            Selecione {type === 'chip' ? 'um CHIP' : 'um equipamento'} da lista abaixo
          </DialogDescription>
        </DialogHeader>

        {/* Campo de busca */}
        <div className="space-y-2">
          <Label htmlFor="modal-search">
            Buscar {type === 'chip' ? 'por ICCID' : 'por rádio, serial ou modelo'}
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="modal-search"
              placeholder={type === 'chip' ? 'Digite ICCID...' : 'Digite rádio, serial ou modelo...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de ativos */}
        <div className="flex-1 overflow-y-auto max-h-96 space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando ativos...
            </div>
          ) : filteredAssets.length > 0 ? (
            <>
              <div className="text-sm text-muted-foreground mb-2">
                {filteredAssets.length} {type === 'chip' ? 'CHIP(s)' : 'equipamento(s)'} disponível(eis):
              </div>
              {filteredAssets.map((asset) => (
                <div
                  key={asset.uuid}
                  className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors hover:border-primary"
                  onClick={() => handleAssetSelect(asset)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-primary flex items-center gap-2">
                        {type === 'chip' ? '📱' : '📡'} 
                        {asset.solucao || 'Sem solução'}
                        {asset.marca && ` - ${asset.marca}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {type === 'chip' ? (
                          <>
                            <div>ICCID: {asset.iccid}</div>
                            {asset.line_number && <div>Linha: {asset.line_number}</div>}
                          </>
                        ) : (
                          <>
                            <div>Rádio: {asset.radio}</div>
                            <div>Serial: {asset.serial_number}</div>
                            <div>Modelo: {asset.model}</div>
                          </>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Selecionar
                    </Button>
                  </div>
                </div>
              ))}
            </>
          ) : searchTerm.trim() ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum {type === 'chip' ? 'CHIP' : 'equipamento'} encontrado para "{searchTerm}"
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum {type === 'chip' ? 'CHIP' : 'equipamento'} disponível no momento
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
