import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2, Settings } from 'lucide-react';
import { AssetWithRelations } from '@modules/assets/hooks/useAssetsData';
import { AssetConfiguration } from '@modules/associations/types';

interface AssetConfigurationFormProps {
  asset: AssetWithRelations;
  onRemove: (assetId: string) => void;
  onConfigurationChange: (assetId: string, config: any) => void;
  initialConfiguration?: AssetConfiguration;
}

export const AssetConfigurationForm: React.FC<AssetConfigurationFormProps> = ({
  asset,
  onRemove,
  onConfigurationChange,
  initialConfiguration
}) => {
  const [gb, setGb] = React.useState(initialConfiguration?.configuration?.gb || 0);
  const [notes, setNotes] = React.useState(initialConfiguration?.configuration?.notes || '');
  const [planId, setPlanId] = React.useState(initialConfiguration?.configuration?.planId || 1);
  const [associationType, setAssociationType] = React.useState(initialConfiguration?.configuration?.associationType || 'ALUGUEL');
  const [startDate, setStartDate] = React.useState(initialConfiguration?.configuration?.startDate || new Date().toISOString());
  const [endDate, setEndDate] = React.useState(initialConfiguration?.configuration?.endDate || '');
  const [ssid_atual, setSsidAtual] = React.useState(initialConfiguration?.configuration?.ssid_atual || '');
  const [pass_atual, setPassAtual] = React.useState(initialConfiguration?.configuration?.pass_atual || '');
  const [isPrincipalChip, setIsPrincipalChip] = React.useState(initialConfiguration?.configuration?.isPrincipalChip || false);

  React.useEffect(() => {
    onConfigurationChange(asset.uuid, {
      gb,
      notes,
      planId,
      associationType,
      startDate,
      endDate,
      ssid_atual,
      pass_atual,
      isPrincipalChip
    });
  }, [gb, notes, planId, associationType, startDate, endDate, onConfigurationChange, asset.uuid, ssid_atual, pass_atual, isPrincipalChip]);

  return (
    <Card className="border-legal-primary/20 shadow-md">
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configurar Ativo
        </CardTitle>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onRemove(asset.uuid)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Campos específicos para CHIP */}
        {asset.solution_id === 11 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Plano</Label>
                <Select value={planId.toString()} onValueChange={(value) => setPlanId(Number(value))}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Plano 1</SelectItem>
                    <SelectItem value="2">Plano 2</SelectItem>
                    <SelectItem value="3">Plano 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gb">Tamanho GB</Label>
                <Input
                  type="number"
                  id="gb"
                  value={gb}
                  onChange={(e) => setGb(Number(e.target.value))}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="isPrincipalChip" className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  id="isPrincipalChip"
                  checked={isPrincipalChip}
                  onChange={(e) => setIsPrincipalChip(e.target.checked)}
                  className="text-sm"
                />
                <span>Chip Principal</span>
              </Label>
            </div>
          </>
        )}

        {/* Campos específicos para Roteador */}
        {asset.solution_id !== 11 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ssid_atual">SSID Atual</Label>
                <Input
                  type="text"
                  id="ssid_atual"
                  value={ssid_atual}
                  onChange={(e) => setSsidAtual(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass_atual">Senha Atual</Label>
                <Input
                  type="text"
                  id="pass_atual"
                  value={pass_atual}
                  onChange={(e) => setPassAtual(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </>
        )}

        {/* Campos genéricos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="associationType">Tipo de Associação</Label>
            <Select value={associationType} onValueChange={setAssociationType}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALUGUEL">Aluguel</SelectItem>
                <SelectItem value="COMODATO">Comodato</SelectItem>
                <SelectItem value="VENDA">Venda</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Data de Início</Label>
            <Input
              type="date"
              id="startDate"
              value={startDate.split('T')[0]}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Data de Término</Label>
          <Input
            type="date"
            id="endDate"
            value={endDate.split('T')[0]}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};
