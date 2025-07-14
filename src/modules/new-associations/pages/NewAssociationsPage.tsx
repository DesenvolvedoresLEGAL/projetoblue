import React from 'react';
import { StandardPageHeader } from '@/components/ui/standard-page-header';
import { Users } from 'lucide-react';

export default function NewAssociationsPage() {
  return (
    <div className="p-4 space-y-4">
      <StandardPageHeader
        icon={Users}
        title="Nova Página de Associações"
        description="Interface em desenvolvimento para associação de ativos"
      />
      <p>Conteúdo em desenvolvimento...</p>
    </div>
  );
}
