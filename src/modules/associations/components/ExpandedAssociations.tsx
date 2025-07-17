
import React from 'react';
import { AssociationWithRelations } from '../types/associationsTypes';
import AssociationRow from './AssociationRow';

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
  return (
    <div className="bg-muted/20 p-4">
      <div className="mb-3">
        <h4 className="text-sm font-medium text-foreground mb-1">
          Associações de {clientName}
        </h4>
        <p className="text-xs text-muted-foreground">
          {associations.length} {associations.length === 1 ? 'associação' : 'associações'} • 
          {associations.filter(a => a.status).length} ativa{associations.filter(a => a.status).length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="space-y-3">
        {associations.map((association) => (
          <AssociationRow
            key={association.uuid}
            association={association}
            onEndAssociation={onEndAssociation}
            isEndingAssociation={endingAssociationId === association.uuid}
          />
        ))}
      </div>
    </div>
  );
};

export default ExpandedAssociations;
