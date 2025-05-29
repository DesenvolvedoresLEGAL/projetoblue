
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectedAsset } from '@/pages/AssetAssociation';
import { Settings, Calendar } from "lucide-react";

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
  const [rentedDays, setRentedDays] = useState(asset.rented_days || 30);
  const [notes, setNotes] = useState(asset.notes || '');

  // Atualizar o asset quando os valores mudarem
  useEffect(() => {
    onUpdate({
      associationType,
      startDate: startDate?.toISOString(),
      rented_days: rentedDays,
      notes
    });
  }, [associationType, startDate, rentedDays, notes, onUpdate]);

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
  );
};
