
import React from 'react';
import { List } from 'lucide-react';
import { StandardPageHeader } from '@/components/ui/standard-page-header';
import { AssociationsListContentOptimized } from '@/modules/associations/components/AssociationsListContentOptimized';

const AssociationsListOptimized: React.FC = () => {
  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={List}
        title="Listagem de Associações (Otimizada)"
        description="Versão otimizada com queries paralelas e performance aprimorada"
      />
      <AssociationsListContentOptimized />
    </div>
  );
};

export default AssociationsListOptimized;
