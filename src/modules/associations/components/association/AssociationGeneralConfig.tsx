
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Settings, FileText } from 'lucide-react';

export interface AssociationGeneralConfig {
  associationType: number;
  startDate: Date;
  endDate?: Date;
  notes: string;
  planId?: number;
  planGb?: number;
}

interface AssociationGeneralConfigProps {
  config: AssociationGeneralConfig;
  onUpdate: (updates: Partial<AssociationGeneralConfig>) => void;
}

export const AssociationGeneralConfigComponent: React.FC<AssociationGeneralConfigProps> = ({
  config,
  onUpdate
}) => {
  const handleStartDateChange = (dateString: string) => {
    if (dateString) {
      onUpdate({ startDate: new Date(dateString) });
    }
  };

  const handleEndDateChange = (dateString: string) => {
    if (dateString) {
      onUpdate({ endDate: new Date(dateString) });
    } else {
      onUpdate({ endDate: undefined });
    }
  };

  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <Card className="border-[#4D2BFB]/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-5 w-5 text-[#03F9FF]" />
          Configuração Geral da Associação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="association-type" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tipo de Associação
            </Label>
            <Select
              value={config.associationType.toString()}
              onValueChange={(value) => onUpdate({ associationType: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Aluguel</SelectItem>
                <SelectItem value="2">Assinatura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan-gb">GB do Plano</Label>
            <Input
              id="plan-gb"
              type="number"
              value={config.planGb || ''}
              onChange={(e) => onUpdate({ planGb: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="GB disponível"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data de Início
            </Label>
            <Input
              id="start-date"
              type="date"
              value={formatDateForInput(config.startDate)}
              onChange={(e) => handleStartDateChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">Data de Fim (Opcional)</Label>
            <Input
              id="end-date"
              type="date"
              value={formatDateForInput(config.endDate)}
              onChange={(e) => handleEndDateChange(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={config.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Adicione observações sobre esta associação..."
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onUpdate({ 
              startDate: new Date(), 
              endDate: undefined, 
              notes: '', 
              associationType: 1,
              planGb: undefined
            })}
          >
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Export the type separately to avoid naming conflicts
export type { AssociationGeneralConfig };
