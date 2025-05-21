
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

interface AssetsTableProps {
  assets: AssetWithRelations[];
  onAssetUpdated: () => void;
  onAssetDeleted: () => void;
}

const AssetsTable = ({ assets, onAssetUpdated, onAssetDeleted }: AssetsTableProps) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Identificador</TableHead>
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
            assets.map((asset) => (
              <TableRow key={asset.uuid}>
                <TableCell className="font-medium">
                  {asset.uuid.substring(0, 8)}
                </TableCell>
                <TableCell>{asset.solucao.name}</TableCell>
                <TableCell>
                  {/* Mostrar número da linha para chips e número de série para outros */}
                  {asset.solucao.id === 11 ? 
                    `ICCID: ${asset.iccid?.substring(asset.iccid.length - 5, asset.iccid.length) || 'N/A'}` : 
                    `Serial: ${asset.serial_number || 'N/A'}`
                  }
                </TableCell>
                <TableCell>
                  <AssetStatusBadge status={asset.status.name} />
                </TableCell>
                <TableCell>{capitalize(asset.manufacturer.name)}</TableCell>
                <TableCell>{asset.model ? capitalize(asset.model) : 'N/A'}</TableCell>
                <TableCell>{asset.solucao.name != "CHIP" ?
                    `ETIQUETA: ${asset.radio}` :
                    `NÚMERO: ${asset.line_number}`}</TableCell>
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
