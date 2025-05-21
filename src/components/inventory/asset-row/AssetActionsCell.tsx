
import React, { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Asset, AssetStatus } from "@/types/asset";
import DeleteAssetDialog from "./DeleteAssetDialog";
import StatusChangeDialog from "./StatusChangeDialog";

interface AssetActionsCellProps {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>;
  deleteAsset: (id: string) => Promise<boolean>;
}

const AssetActionsCell = ({
  asset,
  onEdit,
  updateAsset,
  deleteAsset,
}: AssetActionsCellProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{id: number, name: string, status: AssetStatus} | null>(null);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleStatusUpdate = (status: AssetStatus, statusId: number) => {
    const statusName = status;
    
    setSelectedStatus({
      id: statusId,
      name: statusName,
      status: status
    });
    setIsStatusDialogOpen(true);
  };

  return (
    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => onEdit(asset)}
          >
            <Pencil className="h-4 w-4" />
            Editar ativo
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => handleStatusUpdate("DISPONÍVEL", 1)}
          >
            Marcar como Disponível
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusUpdate("SEM DADOS", 4)}
          >
            Marcar como Sem Dados
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusUpdate("BLOQUEADO", 5)}
          >
            Marcar como Bloqueado
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleStatusUpdate("MANUTENÇÃO", 6)}
          >
            Marcar como Em Manutenção
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="text-red-500 focus:text-red-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteAssetDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        assetId={asset.id}
        deleteAsset={deleteAsset}
      />

      <StatusChangeDialog
        isOpen={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        asset={asset}
        selectedStatus={selectedStatus}
        updateAsset={updateAsset}
      />
    </TableCell>
  );
};

export default AssetActionsCell;
