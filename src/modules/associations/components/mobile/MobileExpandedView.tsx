
import React from 'react';
import { AssociationWithRelations } from '../../types/associationsTypes';
import AssociationRow from '../AssociationRow';

interface MobileExpandedViewProps {
  associations: AssociationWithRelations[];
  clientName: string;
  onEndAssociation: (association: AssociationWithRelations) => void;
  endingAssociationId: string | null;
}

const MobileExpandedView: React.FC<MobileExpandedViewProps> = ({
  associations,
  clientName,
  onEndAssociation,
  endingAssociationId
}) => {
  return (
    <div className="p-4 space-y-3">
      <div className="text-sm font-medium text-muted-foreground mb-3">
        Associações de {clientName}
      </div>
      
      <div className="space-y-3">
        {associations.map((association) => (
          <div key={association.uuid} className="bg-background rounded-lg">
            <AssociationRow
              association={association}
              onEndAssociation={onEndAssociation}
              isEndingAssociation={endingAssociationId === association.uuid}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileExpandedView;
