import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SelectedAsset } from '@modules/associations/types';

interface AssetSearchFormProps {
  onAssetFound: (asset: SelectedAsset) => void;
  selectedAssets: SelectedAsset[];
}

export const AssetSearchForm: React.FC<AssetSearchFormProps> = ({
  onAssetFound,
  selectedAssets
}) => {
  const [searchType, setSearchType] = useState<'chip' | 'equipment'>('equipment');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Digite um valor para buscar');
      return;
    }

    setIsSearching(true);

    try {
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

      // Filtro por tipo e campo específico
      if (searchType === 'chip') {
        // Para CHIP: busca por ICCID (parcial - começa com) e solution_id = 11
        query = query
          .eq('solution_id', 11)
          .ilike('iccid', `${searchValue.trim()}%`);
      } else {
        // Para equipamento: busca por rádio (exato) e solution_id != 11
        query = query
          .neq('solution_id', 11)
          .eq('radio', searchValue.trim());
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error(`${searchType === 'chip' ? 'CHIP' : 'Equipamento'} não encontrado ou não disponível`);
        } else {
          console.error('Erro na busca:', error);
          toast.error('Erro ao buscar ativo');
        }
        return;
      }

      // Verificar se já foi selecionado
      if (selectedAssets.some(asset => asset.uuid === data.uuid)) {
        toast.error('Este ativo já foi selecionado');
        return;
      }

      // Verificar se o ativo está associado atualmente
      const { data: associationCheck } = await supabase
        .from('asset_client_assoc')
        .select('id')
        .eq('asset_id', data.uuid)
        .is('exit_date', null)
        .limit(1);

      if (associationCheck && associationCheck.length > 0) {
        toast.error('Este ativo já está associado a outro cliente');
        return;
      }

      // Mapear para SelectedAsset
      const asset: SelectedAsset = {
        id: data.uuid,
        uuid: data.uuid,
        type: data.solution_id === 11 ? 'CHIP' : 'EQUIPMENT',
        registrationDate: data.created_at,
        status: data.asset_status?.status || 'DISPONÍVEL',
        statusId: data.status_id,
        solucao: data.asset_solutions?.solution,
        marca: data.manufacturers?.name,
        modelo: data.model,
        serial_number: data.serial_number,
        model: data.model,
        radio: data.radio,
        solution_id: data.solution_id,
        manufacturer_id: data.manufacturer_id,
        iccid: data.iccid,
        line_number: data.line_number?.toString() || '',
        phoneNumber: data.line_number?.toString() || '',
        carrier: 'Unknown',
        uniqueId: data.uuid,
        brand: data.manufacturers?.name || '',
        ssid: '#WiFi.LEGAL',
        password: '123legal',
        serialNumber: data.serial_number || '',
        gb: 0,
        notes: '',
        rented_days: 0,
        admin_user: 'admin',
        admin_pass: '',
        plan_id: 1
      };

      onAssetFound(asset);
      setSearchValue('');
      toast.success(`${searchType === 'chip' ? 'CHIP' : 'Equipamento'} encontrado e adicionado!`);

    } catch (error) {
      console.error('Erro na busca:', error);
      toast.error('Erro inesperado ao buscar ativo');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Seletor de tipo melhorado */}
      <div className="space-y-2">
        <Label>Tipo de Ativo</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={searchType === 'equipment' ? 'default' : 'outline'}
            onClick={() => {
              setSearchType('equipment');
              setSearchValue('');
            }}
            className="flex-1"
          >
            📡 Equipamento
          </Button>
          <Button
            type="button"
            variant={searchType === 'chip' ? 'default' : 'outline'}
            onClick={() => {
              setSearchType('chip');
              setSearchValue('');
            }}
            className="flex-1"
          >
            📱 CHIP
          </Button>
        </div>
      </div>

      {/* Campo de busca */}
      <div className="space-y-2">
        <Label htmlFor="search">
          {searchType === 'chip' ? 'ICCID do CHIP' : 'Rádio do Equipamento'}
        </Label>
        <div className="flex gap-2">
          <Input
            id="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={
              searchType === 'chip' 
                ? 'Digite o ICCID (busca parcial)...' 
                : 'Digite o número do rádio...'
            }
            disabled={isSearching}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchValue.trim()}
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          {searchType === 'chip' 
            ? 'Exemplo: 8955041...' 
            : 'Exemplo: 1001, 2045'
          }
        </div>
      </div>

      {searchType === 'chip' && (
        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded border-l-4 border-blue-400">
          <strong>💡 Dica:</strong> CHIPs são obrigatórios para equipamentos SPEEDY 5G. 
          A busca por ICCID permite correspondência parcial (começa com).
        </div>
      )}
    </div>
  );
};
