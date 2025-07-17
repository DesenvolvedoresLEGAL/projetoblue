
import React from 'react';
import { Asset } from '../types/associationsTypes';
import { Badge } from '@/components/ui/badge';
import { Chip, Router, Smartphone } from 'lucide-react';
import AssetTypeIndicator from './AssetTypeIndicator';

interface AssetDetailsViewProps {
  asset: Asset;
  title: string;
  className?: string;
}

const AssetDetailsView: React.FC<AssetDetailsViewProps> = ({ 
  asset, 
  title, 
  className = '' 
}) => {
  const isChip = asset.solution_id === 11;

  return (
    <div className={`${className} bg-muted/20 rounded-md p-3 border border-muted`}>
      {/* Linha principal com informações essenciais */}
      <div className="flex items-center gap-2 text-sm">
        {/* Ícone e tipo */}
        <div className="flex items-center gap-1 text-muted-foreground">
          {isChip ? (
            <Smartphone className="h-3 w-3" />
          ) : (
            <Router className="h-3 w-3" />
          )}
          <span className="text-xs font-medium">{title}</span>
        </div>

        {/* Separador */}
        <span className="text-muted-foreground">•</span>

        {/* ID Principal */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">ID:</span>
          <span className="font-mono text-xs font-medium">
            {isChip ? (asset.iccid || asset.line_number || 'N/A') : (asset.radio || asset.serial_number || 'N/A')}
          </span>
        </div>

        {/* Modelo (se disponível) */}
        {asset.model && (
          <>
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Modelo:</span>
              <span className="text-xs">{asset.model}</span>
            </div>
          </>
        )}

        {/* Status */}
        <div className="ml-auto">
          <AssetTypeIndicator 
            solutionId={asset.solution_id}
            solutionName={asset.solution?.solution}
          />
        </div>

        {asset.status?.status && (
          <Badge variant="outline" className="text-xs py-0 px-2 h-5">
            {asset.status.status}
          </Badge>
        )}
      </div>

      {/* Linha secundária com informações adicionais (se necessário) */}
      {(asset.manufacturer?.name || asset.serial_number || (isChip && asset.line_number)) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          {/* Fabricante */}
          {asset.manufacturer?.name && (
            <>
              <span>Fabricante: {asset.manufacturer.name}</span>
            </>
          )}

          {/* Serial Number */}
          {asset.serial_number && (
            <>
              {asset.manufacturer?.name && <span>•</span>}
              <span>S/N: <span className="font-mono">{asset.serial_number}</span></span>
            </>
          )}

          {/* Linha (para chips) */}
          {isChip && asset.line_number && (
            <>
              {(asset.manufacturer?.name || asset.serial_number) && <span>•</span>}
              <span>Linha: <span className="font-mono">{asset.line_number}</span></span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AssetDetailsView;
