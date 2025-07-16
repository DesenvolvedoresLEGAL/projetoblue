
import React from 'react';
import { List } from 'lucide-react';
import { StandardPageHeader } from '@/components/ui/standard-page-header';
import { AssociationsListContent } from '@/modules/associations/components/AssociationsListContent';

const AssociationsList: React.FC = () => {
  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={List}
        title="Listagem de Associações"
        description="Gerencie e visualize todas as associações de ativos por cliente"
      />
      <AssociationsListContent />
    </div>
  );
};

export default AssociationsList;
