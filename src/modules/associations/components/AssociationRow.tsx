
import React from 'react';
import { AssociationWithRelations } from '../types/associationsTypes';
import { getEquipmentInfo, getChipInfo, getOperatorInfo, getAssociationPeriod } from '../utils/associationFormatters';
import { Badge } from '@/components/ui/badge';
import EndAssociationButton from './EndAssociationButton';

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
  const getAssetTypeIcon = () => {
    // Assets com solution_id 1,2,4 têm prioridade máxima
    if (association.equipment?.solution_id && [1, 2, 4].includes(association.equipment.solution_id)) {
      return (
        <div className="w-2 h-2 rounded-full bg-red-500" title="Prioridade Alta" />
      );
    }
    
    // Chips
    if (association.chip?.solution_id === 11) {
      return (
        <div className="w-2 h-2 rounded-full bg-blue-500" title="Chip" />
      );
    }
    
    // Outros equipamentos
    return (
      <div className="w-2 h-2 rounded-full bg-green-500" title="Equipamento" />
    );
  };

  return (
    <div className="bg-card rounded border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getAssetTypeIcon()}
          <Badge variant={association.status ? 'default' : 'secondary'} className="text-xs">
            {association.status ? 'Ativa' : 'Inativa'}
          </Badge>
          {association.equipment?.solution && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {association.equipment.solution.solution}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">
            {getAssociationPeriod(association)}
          </div>
          {onEndAssociation && (
            <EndAssociationButton
              association={association}
              onEndAssociation={onEndAssociation}
              isLoading={isEndingAssociation}
            />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-muted-foreground">Equipamento:</span>
          <div className="font-medium">
            {getEquipmentInfo(association)}
          </div>
        </div>
        
        <div>
          <span className="text-muted-foreground">Chip:</span>
          <div className="font-medium">
            {getChipInfo(association)}
          </div>
        </div>
        
        <div>
          <span className="text-muted-foreground">Operadora:</span>
          <div className="font-medium">
            {getOperatorInfo(association)}
          </div>
        </div>
        
        {association.plan_gb && (
          <div>
            <span className="text-muted-foreground">Plano:</span>
            <div className="font-medium">{association.plan_gb}GB</div>
          </div>
        )}
      </div>
      
      {association.notes && (
        <div className="text-xs text-muted-foreground mt-2">
          <strong>Observações:</strong> {association.notes}
        </div>
      )}
    </div>
  );
};

export default AssociationRow;
