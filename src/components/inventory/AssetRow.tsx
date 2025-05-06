
import React from "react";
import { Asset, AssetStatus, ChipAsset, RouterAsset } from "@/types/asset";
import { Smartphone, Wifi, AlertTriangle, MoreHorizontal, Pencil } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AssetStatusDropdown from "@/components/inventory/AssetStatusDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusRecord } from "@/types/asset";

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

  return (
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
        {/* Status dropdown */}
        <div className="mt-1">
          <AssetStatusDropdown 
            asset={asset} 
            statusRecords={statusRecords} 
          />
        </div>
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
              onClick={() => updateAsset(asset.id, { status: "DISPONÍVEL", statusId: 1 })}
            >
              Marcar como Disponível
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateAsset(asset.id, { status: "SEM DADOS", statusId: 4 })}
            >
              Marcar como Sem Dados
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateAsset(asset.id, { status: "BLOQUEADO", statusId: 5 })}
            >
              Marcar como Bloqueado
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => updateAsset(asset.id, { status: "MANUTENÇÃO", statusId: 6 })}
            >
              Marcar como Em Manutenção
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem
              onClick={() => deleteAsset(asset.id)}
              className="text-red-500 focus:text-red-500"
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default AssetRow;
