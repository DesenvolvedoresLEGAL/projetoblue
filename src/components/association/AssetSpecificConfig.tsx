
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectedAsset } from '@/pages/AssetAssociation';
import { Wifi, Smartphone, Package } from "lucide-react";

interface AssetSpecificConfigProps {
  asset: SelectedAsset;
  associationType: 'ALUGUEL' | 'ASSINATURA' | 'EMPRESTIMO';
  onUpdate: (updates: Partial<SelectedAsset>) => void;
}

export const AssetSpecificConfig: React.FC<AssetSpecificConfigProps> = ({
  asset,
  associationType,
  onUpdate
}) => {
  const [rentedDays, setRentedDays] = useState(asset.rented_days || 30);
  const [ssidAtual, setSsidAtual] = useState(asset.ssid_atual || '');
  const [passAtual, setPassAtual] = useState(asset.pass_atual || '');
  const [isPrincipalChip, setIsPrincipalChip] = useState(asset.isPrincipalChip || false);

  // Verificar se é equipamento (não CHIP)
  const isEquipment = asset.solution_id !== 11 && asset.type !== 'CHIP';
  
  // Verificar se é CHIP
  const isChip = asset.solution_id === 11 || asset.type === 'CHIP';

  // Atualizar o asset quando os valores mudarem
  useEffect(() => {
    const updates: Partial<SelectedAsset> = {};

    // Campos específicos para equipamentos
    if (isEquipment) {
      updates.rented_days = rentedDays;
      updates.ssid_atual = ssidAtual;
      updates.pass_atual = passAtual;
    }

    // Campo específico para CHIPs
    if (isChip) {
      updates.isPrincipalChip = isPrincipalChip;
      updates.notes = isPrincipalChip ? 'principal' : 'backup';
    }

    onUpdate(updates);
  }, [rentedDays, ssidAtual, passAtual, isPrincipalChip, onUpdate, isEquipment, isChip]);

  // Se não há configurações específicas para este tipo de ativo, não renderizar nada
  if (!isEquipment && !isChip) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Configurações específicas para equipamentos */}
      {isEquipment && (
        <>
          {/* Dias de Aluguel (apenas para equipamentos quando tipo = ALUGUEL) */}
          {associationType === 'ALUGUEL' && (
            <Card className="border-[#4D2BFB]/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-[#03F9FF]" />
                  Configuração de Aluguel
                </CardTitle>
                <CardDescription className="text-xs">
                  Configure os dias de aluguel para este equipamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rented-days" className="text-sm">Dias de Aluguel</Label>
                  <Input
                    id="rented-days"
                    type="number"
                    value={rentedDays}
                    onChange={(e) => setRentedDays(parseInt(e.target.value) || 30)}
                    placeholder="30"
                    min="1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Configurações de Rede */}
          <Card className="border-[#4D2BFB]/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Wifi className="h-4 w-4 text-[#03F9FF]" />
                Configurações de Rede
              </CardTitle>
              <CardDescription className="text-xs">
                Configure as credenciais de rede para este equipamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SSID da Rede */}
                <div className="space-y-2">
                  <Label htmlFor="ssid-atual" className="text-sm">SSID da Rede</Label>
                  <Input
                    id="ssid-atual"
                    value={ssidAtual}
                    onChange={(e) => setSsidAtual(e.target.value)}
                    placeholder="Nome da rede WiFi"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome da rede WiFi que será configurada para o cliente
                  </p>
                </div>

                {/* Senha da Rede */}
                <div className="space-y-2">
                  <Label htmlFor="pass-atual" className="text-sm">Senha da Rede</Label>
                  <Input
                    id="pass-atual"
                    type="password"
                    value={passAtual}
                    onChange={(e) => setPassAtual(e.target.value)}
                    placeholder="Senha da rede WiFi"
                  />
                  <p className="text-xs text-muted-foreground">
                    Senha que será configurada para acesso à rede
                  </p>
                </div>
              </div>

              <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                <strong>💡 Importante:</strong> Estas configurações serão aplicadas especificamente para esta associação e não alterarão as configurações originais do equipamento.
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Configuração específica para CHIPs */}
      {isChip && (
        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Smartphone className="h-4 w-4 text-[#03F9FF]" />
              Configuração do CHIP
            </CardTitle>
            <CardDescription className="text-xs">
              Defina se este CHIP será principal ou backup na associação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="principal-chip"
                checked={isPrincipalChip}
                onCheckedChange={(checked) => setIsPrincipalChip(checked === true)}
              />
              <Label htmlFor="principal-chip" className="text-sm font-medium">
                Este chip é principal?
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              {isPrincipalChip 
                ? 'Este CHIP será marcado como principal na associação.'
                : 'Este CHIP será marcado como backup na associação.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
