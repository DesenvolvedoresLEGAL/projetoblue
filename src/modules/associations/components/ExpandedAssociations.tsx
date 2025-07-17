
import React from 'react';
import { AssociationWithRelations } from '../types/associationsTypes';
import AssociationRow from './AssociationRow';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { groupAssociationsByStatus } from '../utils/associationSorters';

interface ExpandedAssociationsProps {
  associations: AssociationWithRelations[];
  clientName: string;
  onEndAssociation?: (association: AssociationWithRelations) => void;
  endingAssociationId?: string;
}

const ExpandedAssociations: React.FC<ExpandedAssociationsProps> = ({ 
  associations, 
  clientName,
  onEndAssociation,
  endingAssociationId
}) => {
  // Agrupar associações por status
  const groupedAssociations = groupAssociationsByStatus(associations);

  // Estatísticas por tipo
  const stats = associations.reduce((acc, association) => {
    if (association.chipType === 'principal') acc.principal++;
    else if (association.chipType === 'backup') acc.backup++;
    else if (association.equipment_id) acc.equipment++;
    
    if (association.status) acc.active++;
    else acc.inactive++;
    
    return acc;
  }, { principal: 0, backup: 0, equipment: 0, active: 0, inactive: 0 });

  return (
    <div className="bg-muted/20 p-4">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-foreground">
            Associações de {clientName}
          </h4>
          <div className="flex gap-1">
            {stats.principal > 0 && (
              <Badge variant="default" className="text-xs">
                {stats.principal} Principal{stats.principal > 1 ? 's' : ''}
              </Badge>
            )}
            {stats.backup > 0 && (
              <Badge variant="secondary" className="text-xs">
                {stats.backup} Backup{stats.backup > 1 ? 's' : ''}
              </Badge>
            )}
            {stats.equipment > 0 && (
              <Badge variant="outline" className="text-xs">
                {stats.equipment} Equipamento{stats.equipment > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {associations.length} {associations.length === 1 ? 'associação' : 'associações'} • 
          {stats.active} ativa{stats.active !== 1 ? 's' : ''} • 
          {stats.inactive} inativa{stats.inactive !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="space-y-4">
        {/* Associações Ativas */}
        {groupedAssociations.totalActive > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-muted">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <h5 className="text-sm font-medium text-foreground">
                Associações Ativas
              </h5>
              <Badge variant="default" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                {groupedAssociations.totalActive}
              </Badge>
            </div>
            <div className="space-y-3">
              {groupedAssociations.active.map((association) => (
                <AssociationRow
                  key={association.uuid}
                  association={association}
                  onEndAssociation={onEndAssociation}
                  isEndingAssociation={endingAssociationId === association.uuid}
                />
              ))}
            </div>
          </div>
        )}

        {/* Associações Finalizadas */}
        {groupedAssociations.totalInactive > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-muted">
              <XCircle className="h-4 w-4 text-muted-foreground" />
              <h5 className="text-sm font-medium text-muted-foreground">
                Associações Finalizadas
              </h5>
              <Badge variant="secondary" className="text-xs">
                {groupedAssociations.totalInactive}
              </Badge>
            </div>
            <div className="space-y-3">
              {groupedAssociations.inactive.map((association) => (
                <AssociationRow
                  key={association.uuid}
                  association={association}
                  onEndAssociation={onEndAssociation}
                  isEndingAssociation={endingAssociationId === association.uuid}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandedAssociations;
