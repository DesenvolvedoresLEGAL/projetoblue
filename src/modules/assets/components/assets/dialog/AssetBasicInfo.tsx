
import React from 'react';
import { AssetWithRelations } from '@modules/assets/hooks/useAssetsData';
import AssetStatusBadge from '../AssetStatusBadge';

interface AssetBasicInfoProps {
  asset: AssetWithRelations;
}

export const AssetBasicInfo: React.FC<AssetBasicInfoProps> = ({ asset }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-1 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
        Informações Básicas
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="font-medium text-sm">Identificador:</span>
          <span className="text-sm">{asset.uuid}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium text-sm">Tipo:</span>
          <span className="text-sm">{asset.solucao.name}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium text-sm">Status:</span>
          <AssetStatusBadge status={asset.status.name} />
        </div>
        
        <div className="flex justify-between">
          <span className="font-medium text-sm">Fabricante:</span>
          <span className="text-sm">{asset.manufacturer.name}</span>
        </div>
        
        {asset.model && (
          <div className="flex justify-between">
            <span className="font-medium text-sm">Modelo:</span>
            <span className="text-sm">{asset.model}</span>
          </div>
        )}

        {asset.rented_days !== undefined && (
          <div className="flex justify-between">
            <span className="font-medium text-sm">Dias Alugados:</span>
            <span className="text-sm">{asset.rented_days}</span>
          </div>
        )}
      </div>
    </div>
  );
};
