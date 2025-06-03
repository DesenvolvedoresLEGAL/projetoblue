
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { SelectedAsset } from '@/pages/AssetAssociation';
import { Settings, Calendar, Wifi, AlertCircle } from "lucide-react";

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
  
  // Campos específicos para configuração de rede (apenas para equipamentos)
  const [ssidAtual, setSsidAtual] = useState(asset.ssid_atual || '');
  const [passAtual, setPassAtual] = useState(asset.pass_atual || '');

  // Detectar se é CHIP ou EQUIPAMENTO baseado no solution_id
  const isChip = asset.solution_id === 11;
  const isEquipment = !isChip;

  // Atualizar o asset quando os valores mudarem
  useEffect(() => {
    const updates: Partial<SelectedAsset> = {
      associationType,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      rented_days: rentedDays,
      notes
    };

    // Incluir campos de rede apenas para equipamentos
    if (isEquipment) {
      updates.ssid_atual = ssidAtual;
      updates.pass_atual = passAtual;
    }

    onUpdate(updates);
  }, [associationType, startDate, endDate, rentedDays, notes, ssidAtual, passAtual, isEquipment, onUpdate]);

  return (
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
      
      <CardContent className="space-y-6">
        {/* Seção: Dados Globais da Associação */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#4D2BFB]" />
            <h4 className="font-medium text-sm text-[#020CBC]">Dados da Associação</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Associação */}
            <div className="space-y-2">
              <Label htmlFor="association-type" className="text-sm font-medium">
                Tipo de Associação *
              </Label>
              <Select value={associationType} onValueChange={setAssociationType}>
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

            {/* Dias de Aluguel (apenas para aluguel) */}
            {associationType === 'ALUGUEL' && (
              <div className="space-y-2">
                <Label htmlFor="rented-days" className="text-sm font-medium">
                  Dias de Aluguel
                </Label>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Data de Início */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1">
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
              <Label className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Data de Fim (opcional)
              </Label>
              <DatePicker
                date={endDate}
                setDate={setEndDate}
                placeholder="Deixe vazio para associação ativa"
              />
              {endDate && startDate && endDate <= startDate && (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  Data de fim deve ser posterior à data de início
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre esta associação..."
              rows={2}
            />
          </div>
        </div>

        {/* Seção: Configurações de Rede (apenas para equipamentos) */}
        {isEquipment && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-[#4D2BFB]" />
                <h4 className="font-medium text-sm text-[#020CBC]">Configurações de Rede</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SSID Atual */}
                <div className="space-y-2">
                  <Label htmlFor="ssid-atual" className="text-sm font-medium">
                    SSID da Rede (Atual)
                  </Label>
                  <Input
                    id="ssid-atual"
                    value={ssidAtual}
                    onChange={(e) => setSsidAtual(e.target.value)}
                    placeholder="Nome da rede Wi-Fi"
                  />
                  <p className="text-xs text-muted-foreground">
                    Configure o nome da rede para esta associação
                  </p>
                </div>

                {/* Senha Atual */}
                <div className="space-y-2">
                  <Label htmlFor="pass-atual" className="text-sm font-medium">
                    Senha da Rede (Atual)
                  </Label>
                  <Input
                    id="pass-atual"
                    type="password"
                    value={passAtual}
                    onChange={(e) => setPassAtual(e.target.value)}
                    placeholder="Senha da rede Wi-Fi"
                  />
                  <p className="text-xs text-muted-foreground">
                    Configure a senha da rede para esta associação
                  </p>
                </div>
              </div>

              {/* Informação sobre dados de fábrica */}
              {(asset.ssid_fabrica || asset.pass_fabrica) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800">
                      <p className="font-medium mb-1">Dados de Fábrica (somente leitura):</p>
                      {asset.ssid_fabrica && (
                        <p>SSID de Fábrica: <code className="bg-blue-100 px-1 rounded">{asset.ssid_fabrica}</code></p>
                      )}
                      {asset.pass_fabrica && (
                        <p>Senha de Fábrica: <code className="bg-blue-100 px-1 rounded">•••••••••</code></p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Informação para CHIPs */}
        {isChip && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-600" />
              <p className="text-xs text-gray-700">
                CHIPs não possuem configurações de rede específicas.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
