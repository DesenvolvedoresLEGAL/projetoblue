
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StandardStatusBadge } from "@/components/ui/standard-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetWithRelations } from "@/types/assetWithRelations";

interface FilteredAssetsTableProps {
  title: string;
  assets: AssetWithRelations[];
  isLoading?: boolean;
}

export function FilteredAssetsTable({ title, assets, isLoading }: FilteredAssetsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Carregando ativos...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum ativo encontrado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title} ({assets.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Identificador</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Modelo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => {
              const identifier = asset.radio || 
                               asset.line_number?.toString() || 
                               asset.serial_number || 
                               asset.iccid || 
                               'N/A';
              
              return (
                <TableRow key={asset.uuid}>
                  <TableCell className="font-medium">
                    {identifier}
                  </TableCell>
                  <TableCell>
                    {asset.solucao?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <StandardStatusBadge status={asset.status?.name || 'Unknown'} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {asset.model || 'N/A'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
