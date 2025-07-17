
import React from 'react';
import { Asset } from '../types/associationsTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className={`${className} bg-muted/30`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {isChip ? (
              <Smartphone className="h-4 w-4" />
            ) : (
              <Router className="h-4 w-4" />
            )}
            {title}
          </CardTitle>
          <AssetTypeIndicator 
            solutionId={asset.solution_id}
            solutionName={asset.solution?.solution}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {/* Identificador principal */}
        <div className="text-sm">
          <span className="text-muted-foreground">ID: </span>
          <span className="font-mono">
            {isChip ? (asset.iccid || asset.line_number || 'N/A') : (asset.radio || asset.serial_number || 'N/A')}
          </span>
        </div>

        {/* Modelo */}
        {asset.model && (
          <div className="text-sm">
            <span className="text-muted-foreground">Modelo: </span>
            <span>{asset.model}</span>
          </div>
        )}

        {/* Fabricante */}
        {asset.manufacturer?.name && (
          <div className="text-sm">
            <span className="text-muted-foreground">Fabricante: </span>
            <span>{asset.manufacturer.name}</span>
          </div>
        )}

        {/* Linha (para chips) */}
        {isChip && asset.line_number && (
          <div className="text-sm">
            <span className="text-muted-foreground">Linha: </span>
            <span className="font-mono">{asset.line_number}</span>
          </div>
        )}

        {/* Serial Number */}
        {asset.serial_number && (
          <div className="text-sm">
            <span className="text-muted-foreground">S/N: </span>
            <span className="font-mono text-xs">{asset.serial_number}</span>
          </div>
        )}

        {/* Status */}
        {asset.status?.status && (
          <div className="pt-1">
            <Badge variant="outline" className="text-xs">
              {asset.status.status}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetDetailsView;
