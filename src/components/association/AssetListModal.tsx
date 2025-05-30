
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SelectedAsset } from '@/pages/AssetAssociation';
import { Search, Smartphone, Wifi } from "lucide-react";
import { toast } from 'sonner';

interface AssetListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssetSelected: (asset: SelectedAsset) => void;
  selectedAssets: SelectedAsset[];
  type: 'chip' | 'equipment';
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
    queryKey: ['available-assets', type],
    queryFn: async () => {
      let query = supabase
        .from('assets')
        .select(`
          uuid, serial_number, model, iccid, solution_id, status_id, 
          line_number, radio, manufacturer_id, created_at,
          manufacturers(id, name),
          asset_status(id, status),
          asset_solutions(id, solution)
        `)
        .is('deleted_at', null)
        .eq('status_id', 1); // Apenas disponíveis

      // Filtrar por tipo
      if (type === 'chip') {
        query = query.eq('solution_id', 11);
      } else {
        query = query.neq('solution_id', 11);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Mapear para SelectedAsset
      return (data || []).map(asset => ({
        uuid: asset.uuid,
        solution_id: asset.solution_id,
        asset_solution_name: asset.asset_solutions?.solution,
        registrationDate: asset.created_at,
        status: asset.asset_status?.status || 'DISPONÍVEL',
        statusId: asset.status_id,
        solucao: asset.asset_solutions?.solution,
        marca: asset.manufacturers?.name,
        modelo: asset.model,
        serial_number: asset.serial_number,
        model: asset.model,
        radio: asset.radio,
        manufacturer_id: asset.manufacturer_id,
        iccid: asset.iccid,
        line_number: asset.line_number || null,
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
        associationType: 'ALUGUEL',
        startDate: new Date().toISOString()
      } as SelectedAsset));
    },
    enabled: open
  });

  // Filtrar ativos pela busca
  const filteredAssets = assets.filter(asset => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    if (type === 'chip') {
      return asset.iccid?.toLowerCase().includes(searchLower) ||
             asset.line_number?.toString()?.toLowerCase().includes(searchLower);
    } else {
      return asset.radio?.toLowerCase().includes(searchLower) ||
             asset.serial_number?.toLowerCase().includes(searchLower) ||
             asset.model?.toLowerCase().includes(searchLower);
    }
  });

  const handleAssetSelect = (asset: SelectedAsset) => {
    // Verificar se já foi selecionado
    if (selectedAssets.some(selected => selected.uuid === asset.uuid)) {
      toast.error('Este ativo já foi selecionado');
      return;
    }

    onAssetSelected(asset);
    onOpenChange(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'chip' ? <Smartphone className="h-5 w-5" /> : <Wifi className="h-5 w-5" />}
            {type === 'chip' ? 'CHIPs Disponíveis' : 'Equipamentos Disponíveis'}
          </DialogTitle>
          <DialogDescription>
            Selecione um {type === 'chip' ? 'CHIP' : 'equipamento'} para adicionar à associação
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo de busca */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={`Buscar ${type === 'chip' ? 'por ICCID ou linha' : 'por rádio, serial ou modelo'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabela de ativos */}
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando ativos...</p>
            </div>
          ) : filteredAssets.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identificação</TableHead>
                    <TableHead>Tipo/Modelo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.uuid}>
                      <TableCell>
                        <div className="font-medium">
                          {type === 'chip' ? asset.iccid : asset.radio || asset.serial_number}
                        </div>
                        {type === 'chip' && asset.line_number && (
                          <div className="text-sm text-muted-foreground">
                            Linha: {asset.line_number}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {asset.marca || asset.brand || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {asset.modelo || asset.model || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {asset.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleAssetSelect(asset)}
                          className="bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white"
                        >
                          Selecionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum {type === 'chip' ? 'CHIP' : 'equipamento'} disponível encontrado
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
