
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
import { capitalize } from '@/utils/stringUtils';
import { formatPhoneNumber } from '@/utils/formatters';
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
  const highlightMatchedValue = (asset: AssetWithRelations, fieldName: string) => {
    if (asset.matchedField === fieldName) {
      return <Badge variant="outline" className="bg-yellow-50">{fieldName === "line_number" ? asset.line_number : 
             fieldName === "iccid" ? asset.iccid?.substring(asset.iccid.length - 5, asset.iccid.length) : 
             asset[fieldName as keyof AssetWithRelations] || 'N/A'}</Badge>;
    }
    
    return fieldName === "line_number" ? asset.line_number : 
           fieldName === "iccid" ? asset.iccid?.substring(asset.iccid.length - 5, asset.iccid.length) : 
           asset[fieldName as keyof AssetWithRelations] || 'N/A';
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Detalhes</TableHead>
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
                    `ICCID: ${highlightMatchedValue(asset, 'iccid')}` : 
                    `Serial: ${highlightMatchedValue(asset, 'serial_number')}`
                  }
                </TableCell>
                <TableCell>
                  <AssetStatusBadge status={capitalize(asset.status.name)} />
                </TableCell>
                <TableCell>{capitalize(asset.manufacturer.name)}</TableCell>
                <TableCell>{asset.model ? capitalize(asset.model) : 'N/A'}</TableCell>
                <TableCell>{asset.solucao.id === 11 ?
                    `NÚMERO: ${asset.line_number ? formatPhoneNumber(asset.line_number) : 'N/A'}` :
                    `ETIQUETA: ${asset.radio || 'N/A'}`}</TableCell>
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
