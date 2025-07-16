
import React from 'react';
import { AssociationWithRelations } from '../types/associationsTypes';
import { groupAssociationsByStatus } from '../utils/associationSorters';
import AssociationRow from './AssociationRow';

interface ExpandedAssociationsProps {
  associations: AssociationWithRelations[];
  clientName: string;
}

const ExpandedAssociations: React.FC<ExpandedAssociationsProps> = ({ 
  associations, 
  clientName 
}) => {
  const { active, inactive, totalActive, totalInactive } = groupAssociationsByStatus(associations);

  return (
    <div className="p-4 space-y-4 bg-muted/20">
      <h4 className="font-medium text-foreground mb-3">
        Associações de {clientName} ({associations.length})
      </h4>

      {/* Associações Ativas */}
      {totalActive > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <h5 className="text-sm font-medium text-green-600">
              Ativas ({totalActive})
            </h5>
          </div>
          <div className="space-y-2">
            {active.map((association) => (
              <AssociationRow 
                key={association.uuid} 
                association={association} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Associações Inativas */}
      {totalInactive > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <h5 className="text-sm font-medium text-gray-600">
              Inativas ({totalInactive})
            </h5>
          </div>
          <div className="space-y-2">
            {inactive.map((association) => (
              <AssociationRow 
                key={association.uuid} 
                association={association} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Caso não tenha associações */}
      {associations.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-4">
          Nenhuma associação encontrada para este cliente.
        </div>
      )}
    </div>
  );
};

export default ExpandedAssociations;
