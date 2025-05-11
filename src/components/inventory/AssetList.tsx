
import React from "react";
import { Asset } from "@/types/asset";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import AssetRow from "./asset-row/AssetRow";
import { StatusRecord } from "@/types/asset";

interface AssetListProps {
  assets: Asset[];
  statusRecords: StatusRecord[];
  onEdit: (asset: Asset) => void;
  onViewDetails: (asset: Asset) => void;
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>;
  deleteAsset: (id: string) => Promise<boolean>;
  clearFilters: () => void;
}

const AssetList = ({
  assets,
  statusRecords,
  onEdit,
  onViewDetails,
  updateAsset,
  deleteAsset,
  clearFilters,
}: AssetListProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        {assets.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead>ID / ICCID</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <AssetRow
                    key={asset.id}
                    asset={asset}
                    statusRecords={statusRecords}
                    onEdit={onEdit}
                    onViewDetails={onViewDetails}
                    updateAsset={updateAsset}
                    deleteAsset={deleteAsset}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-center text-gray-500 mb-4">
              Nenhum ativo encontrado com os filtros atuais.
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetList;
