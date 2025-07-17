
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AssociationWithRelations } from '../types/associationsTypes';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import EndAssociationButton from './EndAssociationButton';
import ChipTypeIndicator from './ChipTypeIndicator';
import AssetDetailsView from './AssetDetailsView';

interface AssociationRowProps {
  association: AssociationWithRelations;
  onEndAssociation?: (association: AssociationWithRelations) => void;
  isEndingAssociation?: boolean;
}

const AssociationRow: React.FC<AssociationRowProps> = ({
  association,
  onEndAssociation,
  isEndingAssociation = false
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const isActive = association.status;
  const hasEquipment = Boolean(association.equipment);
  const hasChip = Boolean(association.chip);

  return (
    <div className={`
      border rounded-lg p-4 space-y-4 transition-colors
      ${isActive ? 'bg-card border-border' : 'bg-muted/50 border-muted'}
    `}>
      {/* Header da associação */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? 'Ativa' : 'Finalizada'}
            </Badge>
            {association.chipType && association.chipType !== 'none' && (
              <ChipTypeIndicator chipType={association.chipType} />
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Início: {formatDate(association.entry_date)}</span>
            </div>
            {association.exit_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Fim: {formatDate(association.exit_date)}</span>
              </div>
            )}
          </div>
        </div>

        {isActive && onEndAssociation && (
          <EndAssociationButton
            association={association}
            onEndAssociation={onEndAssociation}
            isLoading={isEndingAssociation}
          />
        )}
      </div>

      {/* Detalhes dos ativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hasEquipment && association.equipment && (
          <AssetDetailsView
            asset={association.equipment}
            title="Equipamento"
          />
        )}
        
        {hasChip && association.chip && (
          <AssetDetailsView
            asset={association.chip}
            title={association.chipType === 'principal' ? 'Chip Principal' : 'Chip Backup'}
          />
        )}
      </div>

      {/* Configurações de rede (se disponível) */}
      {(association.equipment_ssid || association.equipment_pass) && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <h5 className="text-sm font-medium mb-2 text-foreground">Configurações de Rede</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {association.equipment_ssid && (
              <div>
                <span className="text-muted-foreground">SSID: </span>
                <span className="font-mono">{association.equipment_ssid}</span>
              </div>
            )}
            {association.equipment_pass && (
              <div>
                <span className="text-muted-foreground">Senha: </span>
                <span className="font-mono">••••••••</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plano (se disponível) */}
      {association.plan_gb && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Plano:</span>
          <Badge variant="outline">{association.plan_gb}GB</Badge>
        </div>
      )}

      {/* Notas (se disponível) */}
      {association.notes && (
        <div className="p-3 bg-muted/30 rounded-lg">
          <h5 className="text-sm font-medium mb-1 text-foreground">Notas</h5>
          <p className="text-sm text-muted-foreground">{association.notes}</p>
        </div>
      )}
    </div>
  );
};

export default AssociationRow;
