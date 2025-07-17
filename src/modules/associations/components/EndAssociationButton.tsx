
import React from 'react';
import { StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AssociationWithRelations } from '../types/associationsTypes';

interface EndAssociationButtonProps {
  association: AssociationWithRelations;
  onEndAssociation: (association: AssociationWithRelations) => void;
  isLoading?: boolean;
}

const EndAssociationButton: React.FC<EndAssociationButtonProps> = ({
  association,
  onEndAssociation,
  isLoading = false
}) => {
  // Só mostra o botão para associações ativas
  if (!association.status) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onEndAssociation(association)}
      disabled={isLoading}
      className="flex items-center gap-2 text-destructive hover:text-destructive"
    >
      <StopCircle className="h-4 w-4" />
      {isLoading ? 'Finalizando...' : 'Finalizar'}
    </Button>
  );
};

export default EndAssociationButton;
