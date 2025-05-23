
import React from 'react';
import Association from './Association';

const AssetAssociation = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Associação de Ativos
        </h1>
        <p className="text-muted-foreground">
          Gerencie a associação de ativos com clientes
        </p>
      </div>
      
      <Association />
    </div>
  );
};

export default AssetAssociation;
