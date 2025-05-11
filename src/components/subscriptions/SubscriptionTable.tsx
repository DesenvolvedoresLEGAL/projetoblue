
import React from "react";
import { Asset, Client } from "@/types/asset";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { SubscriptionRow } from "./SubscriptionRow";

interface SubscriptionTableProps {
  displayedAssets: Asset[];
  selectedAssets: string[];
  toggleSelectAll: () => void;
  toggleSelectAsset: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  openExtendDialog: (asset: Asset) => void;
}

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  displayedAssets,
  selectedAssets,
  toggleSelectAll,
  toggleSelectAsset,
  getClientById,
  openExtendDialog,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox 
              checked={displayedAssets.length > 0 && selectedAssets.length === displayedAssets.length} 
              onCheckedChange={toggleSelectAll} 
            />
          </TableHead>
          <TableHead>Ativo</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Período</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayedAssets.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
              Nenhuma assinatura encontrada.
            </TableCell>
          </TableRow>
        ) : (
          displayedAssets.map((asset) => {
            const client = asset.clientId ? getClientById(asset.clientId) : undefined;
            return (
              <SubscriptionRow 
                key={asset.id}
                asset={asset}
                client={client}
                isSelected={selectedAssets.includes(asset.id)}
                toggleSelectAsset={toggleSelectAsset}
                openExtendDialog={openExtendDialog}
              />
            );
          })
        )}
      </TableBody>
    </Table>
  );
};
