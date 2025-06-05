import React from 'react';
import { ChevronRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import AssetStatusBadge from './AssetStatusBadge';
import { AssetWithRelations } from '@modules/assets/hooks/useAssetsData';
import AssetActions from './AssetActions';
import { formatPhoneNumber } from '@/utils/formatters';
import { capitalize } from '@/utils/stringUtils';
import { Badge } from '@/components/ui/badge';

interface AssetsTableProps {
  assets: AssetWithRelations[];
  onAssetUpdated: () => void;
  onAssetDeleted: () => void;
  currentPage: number;
  pageSize: number;
  isLoading?: boolean;
}

const AssetsTable = ({ 
  assets, 
  onAssetUpdated, 
  onAssetDeleted, 
  currentPage, 
  pageSize,
  isLoading = false 
}: AssetsTableProps) => {
  const getRowNumber = (index: number): number => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  const highlightMatchedValue = (asset: AssetWithRelations, fieldName: string): React.ReactNode => {
    const getDisplayValue = (asset: AssetWithRelations, fieldName: string): string => {
      switch (fieldName) {
        case "line_number":
          return asset.line_number?.toString() || 'N/A';
        case "iccid":
          return asset.iccid?.substring(asset.iccid.length - 5, asset.iccid.length) || 'N/A';
        case "radio":
          return asset.radio || 'N/A';
        case "serial_number":
          return asset.serial_number || 'N/A';
        case "model":
          return asset.model || 'N/A';
        default:
          const value = asset[fieldName as keyof AssetWithRelations];
          if (typeof value === 'object' && value !== null) {
            if ('name' in value) return value.name || 'N/A';
            return 'N/A';
          }
          return value?.toString() || 'N/A';
      }
    };

    const displayValue = getDisplayValue(asset, fieldName);

    if (asset.matchedField === fieldName) {
      return <Badge variant="outline" className="bg-yellow-50">{displayValue}</Badge>;
    }

    return displayValue;
  };

  return (
    <div className="relative">
      {/* Wrapper com scroll horizontal e largura mínima */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px] sm:min-w-[800px] lg:min-w-full">
          <div className={`border rounded-md ${isLoading ? 'opacity-70' : ''} transition-opacity duration-200`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Nº</TableHead>
                  <TableHead className="min-w-[120px]">Radio/Número</TableHead>
                  <TableHead className="min-w-[100px]">ICCID / SN</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="hidden md:table-cell min-w-[100px]">Fabricante</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[100px]">Modelo</TableHead>
                  <TableHead className="hidden lg:table-cell min-w-[100px]">Tipo</TableHead>
                  <TableHead className="text-right min-w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets && assets.length > 0 ? (
                  assets.map((asset, index) => (
                    <TableRow key={asset.uuid} className={isLoading ? 'opacity-70' : ''}>
                      <TableCell className="font-medium text-sm">
                        {getRowNumber(index)}
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="truncate max-w-[120px]" title={asset.solucao.id === 11 ? 
                          (asset.line_number ? formatPhoneNumber(asset.line_number.toString()) : 'N/A') : 
                          (asset.radio || 'N/A')}>
                          {asset.solucao.id === 11 ?
                            <>{asset.line_number ? formatPhoneNumber(asset.line_number.toString()) : 'N/A'}</> :
                            <>{asset.radio || 'N/A'}</>}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        <div className="truncate max-w-[100px]" title={asset.solucao.id === 11 ?
                          `...${highlightMatchedValue(asset, 'iccid')}` :
                          String(highlightMatchedValue(asset, 'serial_number'))}>
                          {asset.solucao.id === 11 ?
                            <>...{highlightMatchedValue(asset, 'iccid')}</> :
                            <>{highlightMatchedValue(asset, 'serial_number')}</>
                          }
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[100px]">
                        <AssetStatusBadge status={capitalize(asset.status.name)} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell min-w-[100px]">
                        <div className="truncate max-w-[100px]" title={capitalize(asset.manufacturer.name)}>
                          {capitalize(asset.manufacturer.name)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell min-w-[100px]">
                        <div className="truncate max-w-[100px]" title={!asset.model ? 'N/A' : asset.solucao.id === 11 ? capitalize(asset.model) : asset.model}>
                          {!asset.model ? 'N/A' : asset.solucao.id === 11 ? capitalize(asset.model) : asset.model}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell min-w-[100px]">
                        <div className="truncate max-w-[100px]" title={asset.solucao.name}>
                          {asset.solucao.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-right min-w-[80px]">
                        <AssetActions
                          asset={asset}
                          onAssetUpdated={onAssetUpdated}
                          onAssetDeleted={onAssetDeleted}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      {isLoading ? 'Buscando ativos...' : 'Nenhum ativo encontrado com os filtros atuais.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* Indicador de scroll horizontal para mobile/tablet */}
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-legal-primary/10 to-transparent pointer-events-none lg:hidden flex items-center justify-center">
        <ChevronRight className="h-4 w-4 text-legal-primary animate-pulse" />
      </div>
    </div>
  );
};

export default AssetsTable;
