
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SelectedAsset } from '@/pages/AssetAssociation';

interface AssetConfigurationFormProps {
  asset: SelectedAsset;
  onUpdate: (updates: Partial<SelectedAsset>) => void;
}

export const AssetConfigurationForm: React.FC<AssetConfigurationFormProps> = ({
  asset,
  onUpdate
}) => {
  // Buscar status
  const { data: statusOptions = [] } = useQuery({
    queryKey: ['asset-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_status')
        .select('*')
        .is('deleted_at', null)
        .order('status');
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar fabricantes (filtrados para CHIPs - só operadoras)
  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      let query = supabase
        .from('manufacturers')
        .select('*')
        .is('deleted_at', null);

      // Para CHIPs, filtrar apenas operadoras
      if (asset.type === 'CHIP') {
        query = query.ilike('name', '%operadora%');
      }

      const { data, error } = await query.order('name');
      if (error) throw error;
      return data;
    }
  });

  // Buscar planos (só para CHIPs)
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .is('deleted_at', null)
        .order('nome');
      
      if (error) throw error;
      return data;
    },
    enabled: asset.type === 'CHIP'
  });

  // Buscar soluções (para equipamentos, excluindo CHIP)
  const { data: solutions = [] } = useQuery({
    queryKey: ['asset-solutions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_solutions')
        .select('*')
        .neq('solution', 'CHIP')
        .is('deleted_at', null)
        .order('solution');
      
      if (error) throw error;
      return data;
    },
    enabled: asset.type === 'ROTEADOR'
  });

  if (asset.type === 'CHIP') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`line_number_${asset.uuid}`}>Número da Linha *</Label>
          <Input
            id={`line_number_${asset.uuid}`}
            value={asset.line_number || ''}
            onChange={(e) => onUpdate({ line_number: e.target.value })}
            placeholder="11999999999"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`manufacturer_${asset.uuid}`}>Operadora</Label>
          <Select
            value={asset.manufacturer_id?.toString() || ''}
            onValueChange={(value) => onUpdate({ manufacturer_id: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a operadora" />
            </SelectTrigger>
            <SelectContent>
              {manufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                  {manufacturer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`status_${asset.uuid}`}>Status</Label>
          <Select
            value={asset.statusId?.toString() || '2'}
            onValueChange={(value) => onUpdate({ statusId: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.id} value={status.id.toString()}>
                  {status.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`plan_${asset.uuid}`}>Plano</Label>
          <Select
            value={asset.plan_id?.toString() || ''}
            onValueChange={(value) => onUpdate({ plan_id: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o plano" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id.toString()}>
                  {plan.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`gb_${asset.uuid}`}>Quantidade de GB</Label>
          <Input
            id={`gb_${asset.uuid}`}
            type="number"
            value={asset.gb || ''}
            onChange={(e) => onUpdate({ gb: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`notes_${asset.uuid}`}>Observações</Label>
          <Textarea
            id={`notes_${asset.uuid}`}
            value={asset.notes || ''}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Informações adicionais sobre o equipamento associado..."
            rows={3}
          />
        </div>
      </div>
    );
  }

  // Formulário para equipamentos
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={`serial_${asset.uuid}`}>Número de Série *</Label>
        <Input
          id={`serial_${asset.uuid}`}
          value={asset.serial_number || ''}
          onChange={(e) => onUpdate({ serial_number: e.target.value })}
          placeholder="Digite o número de série"
          readOnly
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`model_${asset.uuid}`}>Modelo *</Label>
        <Input
          id={`model_${asset.uuid}`}
          value={asset.model || ''}
          onChange={(e) => onUpdate({ model: e.target.value })}
          placeholder="Digite o modelo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`rented_days_${asset.uuid}`}>Dias de Aluguel *</Label>
        <Input
          id={`rented_days_${asset.uuid}`}
          type="number"
          value={asset.rented_days || ''}
          onChange={(e) => onUpdate({ rented_days: parseInt(e.target.value) || 0 })}
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`radio_${asset.uuid}`}>Rádio *</Label>
        <Input
          id={`radio_${asset.uuid}`}
          value={asset.radio || ''}
          onChange={(e) => onUpdate({ radio: e.target.value })}
          placeholder="Número do rádio"
          readOnly
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`status_${asset.uuid}`}>Status</Label>
        <Select
          value={asset.statusId?.toString() || '2'}
          onValueChange={(value) => onUpdate({ statusId: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.id} value={status.id.toString()}>
                {status.status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`manufacturer_${asset.uuid}`}>Fabricante</Label>
        <Select
          value={asset.manufacturer_id?.toString() || ''}
          onValueChange={(value) => onUpdate({ manufacturer_id: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o fabricante" />
          </SelectTrigger>
          <SelectContent>
            {manufacturers.map((manufacturer) => (
              <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                {manufacturer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`solution_${asset.uuid}`}>Solução</Label>
        <Select
          value={asset.solution_id?.toString() || ''}
          onValueChange={(value) => onUpdate({ solution_id: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a solução" />
          </SelectTrigger>
          <SelectContent>
            {solutions.map((solution) => (
              <SelectItem key={solution.id} value={solution.id.toString()}>
                {solution.solution}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`admin_user_${asset.uuid}`}>Usuário Admin</Label>
        <Input
          id={`admin_user_${asset.uuid}`}
          value={asset.admin_user || 'admin'}
          onChange={(e) => onUpdate({ admin_user: e.target.value })}
          placeholder="admin"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`admin_pass_${asset.uuid}`}>Senha Admin</Label>
        <Input
          id={`admin_pass_${asset.uuid}`}
          value={asset.admin_pass || ''}
          onChange={(e) => onUpdate({ admin_pass: e.target.value })}
          placeholder="Digite a senha"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`ssid_${asset.uuid}`}>SSID</Label>
        <Input
          id={`ssid_${asset.uuid}`}
          value={asset.ssid || '#WiFi.LEGAL'}
          onChange={(e) => onUpdate({ ssid: e.target.value })}
          placeholder="#WiFi.LEGAL"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`password_${asset.uuid}`}>Senha de Rede</Label>
        <Input
          id={`password_${asset.uuid}`}
          value={asset.password || '123legal'}
          onChange={(e) => onUpdate({ password: e.target.value })}
          placeholder="123legal"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`notes_${asset.uuid}`}>Observações</Label>
        <Textarea
          id={`notes_${asset.uuid}`}
          value={asset.notes || ''}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Informações adicionais sobre o chip associado..."
          rows={3}
        />
      </div>
    </div>
  );
};
