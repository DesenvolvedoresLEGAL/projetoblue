
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SelectedAsset } from '@/pages/AssetAssociation';

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
        .is('deleted_at', null);

      if (searchType === 'chip') {
        query = query.eq('iccid', searchValue.trim());
      } else {
        query = query.eq('radio', searchValue.trim());
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error(`${searchType === 'chip' ? 'CHIP' : 'Equipamento'} não encontrado`);
        } else {
          console.error('Search error:', error);
          toast.error('Erro ao buscar ativo');
        }
        return;
      }

      // Verificar se já foi selecionado
      if (selectedAssets.some(asset => asset.id === data.uuid)) {
        toast.error('Este ativo já foi selecionado');
        return;
      }

      // Verificar se está disponível
      if (data.status_id !== 1) { // Assumindo que 1 = Disponível
        toast.error('Este ativo não está disponível para associação');
        return;
      }

      // Mapear para SelectedAsset
      const asset: SelectedAsset = {
        id: data.uuid,
        uuid: data.uuid,
        type: data.solution_id === 11 ? 'CHIP' : 'ROTEADOR',
        registrationDate: data.created_at,
        status: data.asset_status?.status || 'DISPONÍVEL',
        statusId: data.status_id,
        solucao: data.asset_solutions?.solution,
        marca: data.manufacturers?.name,
        modelo: data.model,
        serial_number: data.serial_number,
        radio: data.radio,
        solution_id: data.solution_id,
        manufacturer_id: data.manufacturer_id,
        iccid: data.iccid,
        phoneNumber: data.line_number?.toString() || '',
        carrier: 'Unknown',
        uniqueId: data.uuid,
        brand: data.manufacturers?.name || '',
        model: data.model || '',
        ssid: '',
        password: '',
        serialNumber: data.serial_number || ''
      };

      onAssetFound(asset);
      setSearchValue('');
      toast.success(`${searchType === 'chip' ? 'CHIP' : 'Equipamento'} encontrado e adicionado!`);

    } catch (error) {
      console.error('Search error:', error);
      toast.error('Erro inesperado ao buscar ativo');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Seletor de tipo */}
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
          📡 Equipamento (por Rádio)
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
          📱 CHIP (por ICCID)
        </Button>
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
                ? 'Digite o ICCID...' 
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
      </div>

      {searchType === 'chip' && (
        <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
          <strong>Nota:</strong> CHIPs só podem ser associados junto com equipamentos SPEEDY 5G.
        </div>
      )}
    </div>
  );
};
