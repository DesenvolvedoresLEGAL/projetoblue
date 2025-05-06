
import React, { useState } from "react";
import { Asset, AssetStatus, ChipAsset, RouterAsset, StatusRecord } from "@/types/asset";
import { Smartphone, Wifi, AlertTriangle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/utils/toast";

interface AssetRowProps {
  asset: Asset;
  statusRecords: StatusRecord[];
  onEdit: (asset: Asset) => void;
  onViewDetails: (asset: Asset) => void;
  updateAsset: (id: string, assetData: Partial<Asset>) => Promise<Asset | null>;
  deleteAsset: (id: string) => Promise<boolean>;
}

const AssetRow = ({
  asset,
  statusRecords,
  onEdit,
  onViewDetails,
  updateAsset,
  deleteAsset,
}: AssetRowProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<{ id: number, name: string, status: AssetStatus } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const getStatusBadgeStyle = (status: AssetStatus) => {
    switch (status) {
      case "DISPONÍVEL":
        return "bg-green-500";
      case "ALUGADO":
      case "ASSINATURA":
        return "bg-telecom-500";
      case "SEM DADOS":
        return "bg-amber-500";
      case "BLOQUEADO":
        return "bg-red-500";
      case "MANUTENÇÃO":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteAsset(asset.id);
      if (success) {
        toast({
          title: "Ativo excluído",
          description: `O ativo foi excluído com sucesso.`,
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o ativo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao excluir ativo:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o ativo.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleStatusUpdate = async (status: AssetStatus, statusId: number) => {
    const statusName = statusRecords.find(s => s.id === statusId)?.nome || status;
    
    // Find the status record that matches this status
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
        toast({
          title: "Status atualizado",
          description: `O ativo agora está marcado como ${selectedStatus.name}.`,
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o status do ativo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status do ativo.",
        variant: "destructive"
      });
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
          {asset.type === "CHIP" ? (
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span>Chip</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span>Roteador</span>
            </div>
          )}
        </TableCell>
        
        <TableCell className="font-medium">
          {asset.type === "CHIP"
            ? (asset as ChipAsset).iccid
            : (asset as RouterAsset).uniqueId
          }
        </TableCell>
        
        <TableCell>
          {asset.type === "CHIP" ? (
            <div>
              <div>{(asset as ChipAsset).phoneNumber}</div>
              <div className="text-xs text-gray-500">
                {(asset as ChipAsset).carrier}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                {(asset as RouterAsset).brand} {(asset as RouterAsset).model}
                {(asset as RouterAsset).hasWeakPassword && (
                  <div className="flex items-center text-orange-500 text-xs">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="ml-1">Senha fraca</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-500">
                SSID: {(asset as RouterAsset).ssid}
              </div>
            </div>
          )}
        </TableCell>
        
        <TableCell>
          {new Date(asset.registrationDate).toLocaleDateString("pt-BR")}
        </TableCell>
        
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Badge className={getStatusBadgeStyle(asset.status)}>
            {asset.status}
          </Badge>
        </TableCell>
        
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
                onClick={() => handleStatusUpdate("DISPONIVEL", 1)}
              >
                Marcar como Disponível
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("ALUGADO", 2)}
              >
                Marcar como Alugado
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleStatusUpdate("ASSINATURA", 3)}
              >
                Marcar como Assinatura
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
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-500 focus:text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este ativo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar mudança de status</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedStatus?.status === "BLOQUEADO" ? (
                <div className="flex flex-col gap-2">
                  <p>Tem certeza que deseja marcar este ativo como <strong className="text-red-500">Bloqueado</strong>?</p>
                  <p className="text-amber-500 font-semibold">Atenção: Este status indica um problema sério com o ativo.</p>
                </div>
              ) : (
                <p>Tem certeza que deseja alterar o status deste ativo para <strong>{selectedStatus?.name}</strong>?</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AssetRow;
