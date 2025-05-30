
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectedAsset } from '@/pages/AssetAssociation';
import { Settings, Calendar, Wifi, Lock } from "lucide-react";

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
  const [notes, setNotes] = useState(asset.notes || '');
  const [isBackupChip, setIsBackupChip] = useState(false);
  const [ssid, setSsid] = useState(asset.ssid || '');
  const [networkPassword, setNetworkPassword] = useState(asset.pass || '');

  // Verificar se é CHIP baseado na solution
  const isChip = asset.asset_solution_name?.toUpperCase() === 'CHIP' || asset.solution_id === 11;

  // Atualizar o asset quando os valores mudarem
  useEffect(() => {
    let finalNotes = notes;
    
    // Se for chip, adicionar informação de backup nas observações
    if (isChip) {
      const backupText = `Chip backup: ${isBackupChip ? 'Sim' : 'Não'}`;
      // Remover qualquer informação anterior de backup e adicionar a nova
      const notesWithoutBackup = notes.replace(/Chip backup: (Sim|Não)\s*/g, '').trim();
      finalNotes = notesWithoutBackup ? `${notesWithoutBackup}\n${backupText}` : backupText;
    }

    onUpdate({
      associationType,
      startDate: startDate?.toISOString(),
      notes: finalNotes,
      ssid: !isChip ? ssid : undefined,
      pass: !isChip ? networkPassword : undefined
    });
  }, [associationType, startDate, notes, isBackupChip, ssid, networkPassword, isChip, onUpdate]);

  // Extrair informação de backup das observações existentes
  useEffect(() => {
    if (isChip && notes) {
      const backupMatch = notes.match(/Chip backup: (Sim|Não)/);
      if (backupMatch) {
        setIsBackupChip(backupMatch[1] === 'Sim');
      }
    }
  }, [isChip, notes]);

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
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de Associação */}
          <div className="space-y-2">
            <Label htmlFor="association-type" className="text-sm">Tipo de Associação</Label>
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

          {/* Data de Início */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Data de Início
            </Label>
            <DatePicker
              date={startDate}
              setDate={setStartDate}
              placeholder="Selecionar data de início"
            />
          </div>
        </div>

        {/* Checkbox para Chip Backup (apenas para CHIPs) */}
        {isChip && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="backup-chip"
              checked={isBackupChip}
              onCheckedChange={setIsBackupChip}
            />
            <Label
              htmlFor="backup-chip"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              É chip backup?
            </Label>
          </div>
        )}

        {/* Campos SSID e Senha (apenas para equipamentos) */}
        {!isChip && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ssid" className="text-sm flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                SSID da Rede
              </Label>
              <Input
                id="ssid"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="#WiFi.LEGAL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="network-password" className="text-sm flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Senha da Rede
              </Label>
              <Input
                id="network-password"
                type="password"
                value={networkPassword}
                onChange={(e) => setNetworkPassword(e.target.value)}
                placeholder="123legal"
              />
            </div>
          </div>
        )}

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
  );
};
