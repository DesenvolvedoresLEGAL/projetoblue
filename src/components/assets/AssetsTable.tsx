
import React from 'react';
import { Button } from "@/components/ui/button";
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

interface AssetsTableProps {
  assets: AssetWithRelations[];
}

const AssetsTable = ({ assets }: AssetsTableProps) => {
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
            <TableHead>Radio</TableHead>
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
                <TableCell>{asset.manufacturer.name}</TableCell>
                <TableCell>{asset.model || 'N/A'}</TableCell>
                <TableCell>{asset.radio || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
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
