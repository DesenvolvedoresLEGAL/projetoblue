import React from 'react';
import { Clock, Edit, Trash2, Calendar } from 'lucide-react';
import { AssetWithRelations } from '@/types/assetWithRelations';

interface AssetSystemInfoProps {
  asset: AssetWithRelations;
}

const AssetSystemInfo = ({ asset }: AssetSystemInfoProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-2">Informações do Sistema</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Criado em:
          </span>
          <span className="text-sm text-gray-600">
            {new Date(asset.created_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Edit className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Atualizado em:
          </span>
          <span className="text-sm text-gray-600">
            {new Date(asset.updated_at).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            ID do Ativo:
          </span>
          <span className="text-sm text-gray-600">
            {asset.uuid}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssetSystemInfo;

