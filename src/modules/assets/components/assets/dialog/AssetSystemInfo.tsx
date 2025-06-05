
import React from 'react';
import { AssetWithRelations } from '@modules/assets/hooks/useAssetsData';
import { formatDate } from '@/utils/formatDate';

interface AssetSystemInfoProps {
  asset: AssetWithRelations;
}

export const AssetSystemInfo: React.FC<AssetSystemInfoProps> = ({ asset }) => {
  return (
    <div className="space-y-4 col-span-1 md:col-span-2">
      <h3 className="text-lg font-semibold border-b pb-1 flex items-center gap-2">
        <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
        Informações de Sistema
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <span className="font-medium block text-sm">Data de Criação:</span>
          <span className="text-sm">{formatDate(asset.created_at)}</span>
        </div>
        
        <div>
          <span className="font-medium block text-sm">Última Atualização:</span>
          <span className="text-sm">{formatDate(asset.updated_at)}</span>
        </div>
        
        <div>
          <span className="font-medium block text-sm">ID da Solução:</span>
          <span className="text-sm">{asset.solucao.id}</span>
        </div>
        
        <div>
          <span className="font-medium block text-sm">ID do Status:</span>
          <span className="text-sm">{asset.status.id || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};
