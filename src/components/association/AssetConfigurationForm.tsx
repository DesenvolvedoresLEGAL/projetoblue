
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SelectedAsset } from '@/pages/AssetAssociation';
import { formatPhoneNumber } from '@/utils/phoneFormatter';

interface AssetConfigurationFormProps {
  asset: SelectedAsset;
  onUpdate: (updates: Partial<SelectedAsset>) => void;
}

export const AssetConfigurationForm: React.FC<AssetConfigurationFormProps> = ({
  asset,
  onUpdate
}) => {
  // Buscar fabricantes
  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .is('deleted_at', null)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Buscar planos
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
    }
  });

  // Filtrar operadoras para CHIPs (apenas VIVO, TIM, Claro)
  const operadoras = asset.type === 'CHIP' 
    ? manufacturers.filter(m => ['VIVO', 'TIM', 'CLARO'].includes(m.name?.toUpperCase()))
    : manufacturers;

  const handleInputChange = (field: string, value: any) => {
    onUpdate({ [field]: value });
  };

  if (asset.type === 'CHIP') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Número da linha */}
          <div className="space-y-2">
            <Label htmlFor={`line-${asset.uuid}`}>Número da Linha *</Label>
            <Input
              id={`line-${asset.uuid}`}
              type="text"
              value={asset.line_number || ''}
              onChange={(e) => handleInputChange('line_number', e.target.value)}
              placeholder="Digite o número da linha"
            />
            {asset.line_number && (
              <p className="text-xs text-muted-foreground">
                Formatado: {formatPhoneNumber(asset.line_number)}
              </p>
            )}
          </div>

          {/* Operadora */}
          <div className="space-y-2">
            <Label htmlFor={`carrier-${asset.uuid}`}>Operadora</Label>
            <Select
              value={asset.manufacturer_id?.toString() || ''}
              onValueChange={(value) => {
                const selectedManuf = operadoras.find(m => m.id.toString() === value);
                handleInputChange('manufacturer_id', parseInt(value));
                handleInputChange('carrier', selectedManuf?.name || 'Unknown');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a operadora" />
              </SelectTrigger>
              <SelectContent>
                {operadoras.map((operadora) => (
                  <SelectItem key={operadora.id} value={operadora.id.toString()}>
                    {operadora.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Plano */}
          <div className="space-y-2">
            <Label htmlFor={`plan-${asset.uuid}`}>Plano</Label>
            <Select
              value={asset.plan_id?.toString() || ''}
              onValueChange={(value) => handleInputChange('plan_id', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()}>
                    {plan.nome} {plan.tamanho_gb && `(${plan.tamanho_gb}GB)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* GB */}
          <div className="space-y-2">
            <Label htmlFor={`gb-${asset.uuid}`}>GB</Label>
            <Input
              id={`gb-${asset.uuid}`}
              type="number"
              value={asset.gb || 0}
              onChange={(e) => handleInputChange('gb', parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-2">
          <Label htmlFor={`notes-${asset.uuid}`}>Observações</Label>
          <Textarea
            id={`notes-${asset.uuid}`}
            value={asset.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Observações adicionais..."
            rows={2}
          />
        </div>
      </div>
    );
  }

  // Configuração para equipamentos
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Serial Number */}
        <div className="space-y-2">
          <Label htmlFor={`serial-${asset.uuid}`}>Número de Série *</Label>
          <Input
            id={`serial-${asset.uuid}`}
            value={asset.serial_number || ''}
            onChange={(e) => handleInputChange('serial_number', e.target.value)}
            placeholder="Digite o número de série"
          />
        </div>

        {/* Modelo */}
        <div className="space-y-2">
          <Label htmlFor={`model-${asset.uuid}`}>Modelo *</Label>
          <Input
            id={`model-${asset.uuid}`}
            value={asset.model || ''}
            onChange={(e) => {
              handleInputChange('model', e.target.value);
              handleInputChange('modelo', e.target.value);
            }}
            placeholder="Digite o modelo"
          />
        </div>

        {/* Fabricante */}
        <div className="space-y-2">
          <Label htmlFor={`manufacturer-${asset.uuid}`}>Fabricante</Label>
          <Select
            value={asset.manufacturer_id?.toString() || ''}
            onValueChange={(value) => handleInputChange('manufacturer_id', parseInt(value))}
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

        {/* Dias de Aluguel */}
        <div className="space-y-2">
          <Label htmlFor={`rented-days-${asset.uuid}`}>Dias de Aluguel</Label>
          <Input
            id={`rented-days-${asset.uuid}`}
            type="number"
            value={asset.rented_days || 0}
            onChange={(e) => handleInputChange('rented_days', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>

        {/* SSID */}
        <div className="space-y-2">
          <Label htmlFor={`ssid-${asset.uuid}`}>SSID</Label>
          <Input
            id={`ssid-${asset.uuid}`}
            value={asset.ssid || '#WiFi.LEGAL'}
            onChange={(e) => handleInputChange('ssid', e.target.value)}
            placeholder="#WiFi.LEGAL"
          />
        </div>

        {/* Senha */}
        <div className="space-y-2">
          <Label htmlFor={`password-${asset.uuid}`}>Senha</Label>
          <Input
            id={`password-${asset.uuid}`}
            value={asset.password || '123legal'}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="123legal"
          />
        </div>

        {/* Usuário Admin */}
        <div className="space-y-2">
          <Label htmlFor={`admin-user-${asset.uuid}`}>Usuário Admin</Label>
          <Input
            id={`admin-user-${asset.uuid}`}
            value={asset.admin_user || 'admin'}
            onChange={(e) => handleInputChange('admin_user', e.target.value)}
            placeholder="admin"
          />
        </div>

        {/* Senha Admin */}
        <div className="space-y-2">
          <Label htmlFor={`admin-pass-${asset.uuid}`}>Senha Admin</Label>
          <Input
            id={`admin-pass-${asset.uuid}`}
            type="password"
            value={asset.admin_pass || ''}
            onChange={(e) => handleInputChange('admin_pass', e.target.value)}
            placeholder="Digite a senha do admin"
          />
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor={`notes-${asset.uuid}`}>Observações</Label>
        <Textarea
          id={`notes-${asset.uuid}`}
          value={asset.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Observações adicionais..."
          rows={2}
        />
      </div>
    </div>
  );
};
