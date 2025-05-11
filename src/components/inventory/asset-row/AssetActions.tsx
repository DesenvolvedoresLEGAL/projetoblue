
import React from "react";
import { Asset, AssetStatus, StatusRecord } from "@/types/asset";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AssetActionsProps {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  onDelete: () => void;
  onStatusUpdate: (status: AssetStatus, statusId: number) => void;
}

export const AssetActions: React.FC<AssetActionsProps> = ({
  asset,
  onEdit,
  onDelete,
  onStatusUpdate,
}) => {
  return (
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
          onClick={() => onStatusUpdate("DISPONÍVEL", 1)}
        >
          Marcar como Disponível
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusUpdate("SEM DADOS", 4)}
        >
          Marcar como Sem Dados
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusUpdate("BLOQUEADO", 5)}
        >
          Marcar como Bloqueado
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusUpdate("MANUTENÇÃO", 6)}
        >
          Marcar como Em Manutenção
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-500 focus:text-red-500"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
