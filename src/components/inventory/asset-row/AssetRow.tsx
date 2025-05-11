
import React, { useState } from "react";
import { Asset, AssetStatus, StatusRecord } from "@/types/asset";
import { TableCell, TableRow } from "@/components/ui/table";
import { toast } from "@/utils/toast";
import { AssetTypeIndicator } from "./AssetTypeIndicator";
import { AssetDetails } from "./AssetDetails";
import { AssetStatusBadge } from "./AssetStatusBadge";
import { AssetActions } from "./AssetActions";
import { DeleteAssetDialog } from "./DeleteAssetDialog";
import { StatusChangeDialog } from "./StatusChangeDialog";

interface AssetRowProps {
  asset: Asset;
  statusRecords: StatusRecord[];
  onEdit: (asset: Asset) => void;
  onViewDetails: (asset: Asset) => void;
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>;
  deleteAsset: (id: string) => Promise<boolean>;
}

export const AssetRow: React.FC<AssetRowProps> = ({
  asset,
  statusRecords,
  onEdit,
  onViewDetails,
  updateAsset,
  deleteAsset,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{ id: number, name: string, status: AssetStatus } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteAsset(asset.id);
      if (success) {
        toast.success("O ativo foi excluído com sucesso.");
      } else {
        toast.error("Não foi possível excluir o ativo.");
      }
    } catch (error) {
      console.error("Erro ao excluir ativo:", error);
      toast.error("Ocorreu um erro ao excluir o ativo.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusUpdate = async (status: AssetStatus, statusId: number) => {
    const statusName = statusRecords.find(s => s.id === statusId)?.nome || status;
    
    setSelectedStatus({
      id: statusId,
      name: statusName,
      status: status
    });
    setIsStatusDialogOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!selectedStatus) return;
    
    try {
      const updatedAsset = await updateAsset(asset.id, { 
        status: selectedStatus.status, 
        statusId: selectedStatus.id 
      });
      
      if (updatedAsset) {
        toast.success(`O ativo agora está marcado como ${selectedStatus.name}.`);
      } else {
        toast.error("Não foi possível atualizar o status do ativo.");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Ocorreu um erro ao atualizar o status do ativo.");
    } finally {
      setIsStatusDialogOpen(false);
      setSelectedStatus(null);
    }
  };

  return (
    <>
      <TableRow 
        key={asset.id}
        className="cursor-pointer hover:bg-gray-50"
        onClick={() => onViewDetails(asset)}
      >
        <TableCell onClick={(e) => e.stopPropagation()}>
          <AssetTypeIndicator type={asset.type} />
        </TableCell>
        
        <TableCell className="font-medium">
          {asset.type === "CHIP"
            ? asset.iccid
            : asset.uniqueId
          }
        </TableCell>
        
        <TableCell>
          <AssetDetails asset={asset} />
        </TableCell>
        
        <TableCell>
          {new Date(asset.registrationDate).toLocaleDateString("pt-BR")}
        </TableCell>
        
        <TableCell onClick={(e) => e.stopPropagation()}>
          <AssetStatusBadge status={asset.status} />
        </TableCell>
        
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <AssetActions 
            asset={asset}
            onEdit={onEdit}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onStatusUpdate={handleStatusUpdate}
          />
        </TableCell>
      </TableRow>

      <DeleteAssetDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      <StatusChangeDialog
        isOpen={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        onConfirm={handleStatusConfirm}
        selectedStatus={selectedStatus}
      />
    </>
  );
};

export default AssetRow;
