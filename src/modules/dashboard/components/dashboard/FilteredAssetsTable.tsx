import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetFilterValues } from '@modules/dashboard/components/dashboard/AssetFilters';
import { formatRelativeTime } from '@/utils/dashboardUtils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { AssetWithRelations } from '@/types/assetWithRelations';
import { getStatusName, getSolutionName, getManufacturerName } from '@/utils/typeGuards';

interface FilteredAssetsTableProps {
  assets: AssetWithRelations[];
  isLoading: boolean;
  filters: AssetFilterValues;
}

export function FilteredAssetsTable({ assets, isLoading, filters }: FilteredAssetsTableProps) {
  const hasFilters = Object.keys(filters).length > 0;
  
  // Helper function to get asset type label
  const getAssetTypeLabel = (asset: AssetWithRelations) => {
    return getSolutionName(asset.solucao) || getManufacturerName(asset.manufacturer) || '-';
  };
  
  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: any) => {
    if (!status) return 'outline';
    
    const statusText = getStatusName(status);
    const statusLower = statusText.toLowerCase();
    if (statusLower === 'disponivel' || statusLower === 'disponível') {
      return 'default';
    } else if (statusLower.includes('bloqueado') || statusLower.includes('manut') || statusLower.includes('sem dados')) {
      return 'destructive';
    } else {
      return 'secondary';
    }
  };

  if (!hasFilters) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ativos Filtrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Utilize os filtros acima para listar ativos específicos.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Ativos Filtrados
          {assets.length > 0 && <span className="text-sm ml-2 font-normal text-muted-foreground">({assets.length} resultados)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : assets.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identificador</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Criado</TableHead>
                  <TableHead className="w-[100px]">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset, index) => (
                  <TableRow key={asset.uuid}>
                    <TableCell className="font-medium">
                      {asset.solution_id === 11 ? asset.line_number || 'N/A' : asset.radio || 'N/A'}
                    </TableCell>
                    <TableCell>{getAssetTypeLabel(asset)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(asset.status)}>
                        {getStatusName(asset.status) || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getManufacturerName(asset.manufacturer) || '-'}</TableCell>
                    <TableCell>{formatRelativeTime(new Date(asset.created_at))}</TableCell>
                    <TableCell>
                      <Link to={`/assets/details/${asset.uuid}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Detalhes
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum resultado encontrado para os filtros aplicados.
          </div>
        )}
      </CardContent>
    </Card>
  );
}