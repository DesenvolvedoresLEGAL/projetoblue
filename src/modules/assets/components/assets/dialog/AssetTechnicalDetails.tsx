import React from 'react';
import { Smartphone, Router, Hash, Wrench } from 'lucide-react';
import { AssetWithRelations } from '@/types/assetWithRelations';
import { formatPhoneNumber } from '@/utils/formatters';
import { CopyableField } from './CopyableField';

interface AssetTechnicalDetailsProps {
  asset: AssetWithRelations;
  showPasswords: boolean;
}

export const AssetTechnicalDetails: React.FC<AssetTechnicalDetailsProps> = ({
  asset,
  showPasswords
}) => {
  const isChip = asset.solucao.id === 11;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-1 flex items-center gap-2">
        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
        Detalhes Técnicos
      </h3>
      
      <div className="space-y-3">
        {isChip ? (
          <>
            <div className="flex justify-between">
              <span className="font-medium text-sm">ICCID:</span>
              <CopyableField value={asset.iccid} label="ICCID" />
            </div>
            
            {asset.line_number && (
              <div className="flex justify-between">
                <span className="font-medium text-sm">Número de Linha:</span>
                <CopyableField value={asset.line_number.toString()} label="Número de Linha" />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="font-medium text-sm">Número de Série:</span>
              <CopyableField value={asset.serial_number} label="Número de Série" />
            </div>
            
            {asset.radio && (
              <div className="flex justify-between">
                <span className="font-medium text-sm">Rádio:</span>
                <CopyableField value={asset.radio} label="Rádio" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
