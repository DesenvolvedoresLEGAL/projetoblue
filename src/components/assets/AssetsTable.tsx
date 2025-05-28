
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import AssetStatusBadge from './AssetStatusBadge';
import { AssetWithRelations } from '@/hooks/useAssetsData';
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
}

const AssetsTable = ({ assets, onAssetUpdated, onAssetDeleted, currentPage, pageSize }: AssetsTableProps) => {
  // Calculate row number based on pagination
  const getRowNumber = (index: number): number => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  // Função para destacar visualmente o campo que correspondeu à busca
  const highlightMatchedValue = (asset: AssetWithRelations, fieldName: string): React.ReactNode => {
    // Helper function to get the display value as string
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
          // Handle object values by extracting displayable properties
          if (typeof value === 'object' && value !== null) {
            if ('name' in value) return value.name || 'N/A';
            if ('nome' in value) return value.nome || 'N/A';
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
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>ICCID / SN</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fabricante</TableHead>
            <TableHead>Modelo</TableHead>
            <TableHead>Radio/Número</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets && assets.length > 0 ? (
            assets.map((asset, index) => (
              <TableRow key={asset.uuid}>
                <TableCell className="font-medium">
                  {getRowNumber(index)}
                </TableCell>
                <TableCell>{asset.solucao.name}</TableCell>
                <TableCell>
                  {/* Mostrar número da linha para chips e número de série para outros */}
                  {asset.solucao.id === 11 ?
                    <>...{highlightMatchedValue(asset, 'iccid')}</> :
                    <>{highlightMatchedValue(asset, 'serial_number')}</>
                  }
                </TableCell>
                <TableCell>
                  <AssetStatusBadge status={capitalize(asset.status.name)} />
                </TableCell>
                <TableCell>{capitalize(asset.manufacturer.name)}</TableCell>
                <TableCell>{!asset.model ? 'N/A' : asset.solucao.id === 11 ? capitalize(asset.model) : asset.model}</TableCell>
                <TableCell>{asset.solucao.id === 11 ?
                  <>{asset.line_number ? formatPhoneNumber(asset.line_number.toString()) : 'N/A'}</> :
                  <>{asset.radio || 'N/A'}</>}
                </TableCell>
                <TableCell className="text-right">
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
                Nenhum ativo encontrado com os filtros atuais.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AssetsTable;
