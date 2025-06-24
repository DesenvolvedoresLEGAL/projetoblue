
import React from 'react';
import { Package, Calendar, Hash, Radio, Smartphone, Router } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import AssetStatusBadge from './AssetStatusBadge';
import { AssetWithRelations } from '@modules/assets/hooks/useAssetsData';
import AssetActions from './AssetActions';
import { formatPhoneNumber } from '@/utils/formatters';
import { capitalize } from '@/utils/stringUtils';
import { Badge } from '@/components/ui/badge';

interface AssetsTableProps {
  assets: AssetWithRelations[];
  totalCount?: number;
  onAssetUpdated: () => void;
  onAssetDeleted: () => void;
  currentPage: number;
  pageSize: number;
  isLoading?: boolean;
}

const AssetsTable = ({ 
  assets, 
  totalCount,
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
        default: {
          const value = asset[fieldName as keyof AssetWithRelations];
          if (typeof value === 'object' && value !== null) {
            if ('name' in value) return value.name || 'N/A';
            return 'N/A';
          }
          return value?.toString() || 'N/A';
        }
      }
    };

    const displayValue = getDisplayValue(asset, fieldName);

    if (asset.matchedField === fieldName) {
      return <Badge variant="outline" className="bg-yellow-50">{displayValue}</Badge>;
    }

    return displayValue;
  };

  const formatCreatedDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getAssetIcon = (solutionName: string) => {
    if (solutionName === 'CHIP') return <Smartphone className="h-4 w-4" />;
    return <Router className="h-4 w-4" />;
  };

  return (
    <Card className="border border-gray-200 rounded-lg shadow-sm">
      <CardHeader className="border-b border-gray-200 bg-gray-50/50 p-3 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-[#020CBC] text-lg sm:text-xl">
          <Package className="h-5 w-5 sm:h-6 sm:w-6" />
          Lista de Ativos ({totalCount ?? assets.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile Card View (< 640px) */}
        <div className="block sm:hidden space-y-3 p-3">
          {assets.map((asset, index) => (
            <div key={asset.uuid} className={`bg-white rounded-lg border border-gray-200 p-4 ${isLoading ? 'opacity-70' : ''}`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getAssetIcon(asset.solucao.name)}
                    <h3 className="font-medium text-[#020CBC] text-base">
                      {asset.solucao.id === 11 ? 
                        (asset.line_number ? formatPhoneNumber(asset.line_number.toString()) : 'N/A') : 
                        (asset.radio || 'N/A')}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {asset.solucao.id === 11 ? 
                      `...${highlightMatchedValue(asset, 'iccid')}` : 
                      highlightMatchedValue(asset, 'serial_number')}
                  </p>
                </div>
                <AssetActions
                  asset={asset}
                  onAssetUpdated={onAssetUpdated}
                  onAssetDeleted={onAssetDeleted}
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">#{getRowNumber(index)}</span>
                </div>
                <div className="mb-2">
                  <AssetStatusBadge status={capitalize(asset.status.name)} />
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{capitalize(asset.manufacturer.name)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{formatCreatedDate(asset.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (≥ 640px) */}
        <div className="hidden sm:block">
          <div className={`overflow-x-auto ${isLoading ? 'opacity-70' : ''} transition-opacity duration-200`}>
            <div className="min-w-[600px] sm:min-w-[800px] lg:min-w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="w-16 px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">Nº</TableHead>
                    <TableHead className="min-w-[120px] px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">Radio/Número</TableHead>
                    <TableHead className="min-w-[100px] px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">ICCID / SN</TableHead>
                    <TableHead className="min-w-[100px] px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">Status</TableHead>
                    <TableHead className="hidden md:table-cell min-w-[100px] px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">Fabricante</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[100px] px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">Modelo</TableHead>
                    <TableHead className="hidden lg:table-cell min-w-[100px] px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">Tipo</TableHead>
                    <TableHead className="hidden xl:table-cell min-w-[100px] px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">Criado em</TableHead>
                    <TableHead className="text-right min-w-[80px] px-2 sm:px-4 py-3 text-sm font-medium text-[#020CBC]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets && assets.length > 0 ? (
                    assets.map((asset, index) => (
                      <TableRow key={asset.uuid} className="hover:bg-gray-50 border-b border-gray-100">
                        <TableCell className="font-medium text-sm px-2 sm:px-4 py-3 text-gray-900">
                          {getRowNumber(index)}
                        </TableCell>
                        <TableCell className="min-w-[120px] px-2 sm:px-4 py-3 text-gray-700 text-sm">
                          <div className="truncate max-w-[120px]" title={asset.solucao.id === 11 ? 
                            (asset.line_number ? formatPhoneNumber(asset.line_number.toString()) : 'N/A') : 
                            (asset.radio || 'N/A')}>
                            {asset.solucao.id === 11 ?
                              <>{asset.line_number ? formatPhoneNumber(asset.line_number.toString()) : 'N/A'}</> :
                              <>{asset.radio || 'N/A'}</>}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[100px] px-2 sm:px-4 py-3 text-gray-700 text-sm">
                          <div className="truncate max-w-[100px]" title={asset.solucao.id === 11 ?
                            `...${highlightMatchedValue(asset, 'iccid')}` :
                            String(highlightMatchedValue(asset, 'serial_number'))}>
                            {asset.solucao.id === 11 ?
                              <>...{highlightMatchedValue(asset, 'iccid')}</> :
                              <>{highlightMatchedValue(asset, 'serial_number')}</>
                            }
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[100px] px-2 sm:px-4 py-3">
                          <AssetStatusBadge status={capitalize(asset.status.name)} />
                        </TableCell>
                        <TableCell className="hidden md:table-cell min-w-[100px] px-2 sm:px-4 py-3 text-gray-700 text-sm">
                          <div className="truncate max-w-[100px]" title={capitalize(asset.manufacturer.name)}>
                            {capitalize(asset.manufacturer.name)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell min-w-[100px] px-2 sm:px-4 py-3 text-gray-700 text-sm">
                          <div className="truncate max-w-[100px]" title={!asset.model ? 'N/A' : asset.solucao.id === 11 ? capitalize(asset.model) : asset.model}>
                            {!asset.model ? 'N/A' : asset.solucao.id === 11 ? capitalize(asset.model) : asset.model}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell min-w-[100px] px-2 sm:px-4 py-3 text-gray-700 text-sm">
                          <div className="truncate max-w-[100px]" title={asset.solucao.name}>
                            {asset.solucao.name}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell min-w-[100px] px-2 sm:px-4 py-3 text-gray-700 text-sm">
                          {formatCreatedDate(asset.created_at)}
                        </TableCell>
                        <TableCell className="text-right min-w-[80px] px-2 sm:px-4 py-3">
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
                      <TableCell colSpan={9} className="text-center py-4">
                        {isLoading ? 'Buscando ativos...' : 'Nenhum ativo encontrado com os filtros atuais.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetsTable;
