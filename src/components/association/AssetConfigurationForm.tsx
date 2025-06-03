
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectedAsset } from '@/pages/AssetAssociation';
import { Settings, Calendar, Wifi } from "lucide-react";

interface AssetConfigurationFormProps {
  asset: SelectedAsset;
  onUpdate: (updates: Partial<SelectedAsset>) => void;
}

export const AssetConfigurationForm: React.FC<AssetConfigurationFormProps> = ({
  asset,
  onUpdate
}) => {
  const [associationType, setAssociationType] = useState(asset.associationType || 'ALUGUEL');
  const [startDate, setStartDate] = useState<Date | undefined>(
    asset.startDate ? new Date(asset.startDate) : new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    asset.endDate ? new Date(asset.endDate) : undefined
  );
  const [rentedDays, setRentedDays] = useState(asset.rented_days || 30);
  const [notes, setNotes] = useState(asset.notes || '');
  
  // Campos de rede (apenas para equipamentos)
  const [ssidAtual, setSsidAtual] = useState(asset.ssid_atual || '');
  const [passAtual, setPassAtual] = useState(asset.pass_atual || '');

  // Verificar se é equipamento (não CHIP)
  const isEquipment = asset.solution_id !== 11 && asset.type !== 'CHIP';

  // Validação de datas
  const isEndDateValid = !endDate || !startDate || endDate >= startDate;

  // Atualizar o asset quando os valores mudarem
  useEffect(() => {
    const updates: Partial<SelectedAsset> = {
      associationType,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      rented_days: rentedDays,
      notes
    };

    // Adicionar campos de rede apenas para equipamentos
    if (isEquipment) {
      updates.ssid_atual = ssidAtual;
      updates.pass_atual = passAtual;
    }

    onUpdate(updates);
  }, [associationType, startDate, endDate, rentedDays, notes, ssidAtual, passAtual, onUpdate, isEquipment]);

  return (
    <div className="space-y-4">
      {/* Seção: Configuração da Associação (sempre visível) */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-[#03F9FF]" />
            Configuração da Associação
          </CardTitle>
          <CardDescription className="text-xs">
            Configure os detalhes da associação deste ativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Associação */}
            <div className="space-y-2">
              <Label htmlFor="association-type" className="text-sm">Tipo de Associação *</Label>
              <Select 
                value={associationType} 
                onValueChange={(value: 'ALUGUEL' | 'ASSINATURA' | 'EMPRESTIMO') => setAssociationType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                  <SelectItem value="ASSINATURA">Assinatura</SelectItem>
                  <SelectItem value="EMPRESTIMO">Empréstimo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data de Início */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Data de Início *
              </Label>
              <DatePicker
                date={startDate}
                setDate={setStartDate}
                placeholder="Selecionar data de início"
              />
            </div>

            {/* Data de Fim */}
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Data de Fim
              </Label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                placeholder="Selecionar data de fim (opcional)"
              />
              {!isEndDateValid && (
                <p className="text-xs text-red-500">
                  A data de fim deve ser posterior à data de início
                </p>
              )}
            </div>

            {/* Dias de Aluguel (se aplicável) */}
            {associationType === 'ALUGUEL' && (
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
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre esta associação..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção: Configurações de Rede (apenas para equipamentos) */}
      {isEquipment && (
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
      )}
    </div>
  );
};
