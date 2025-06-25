
import React, { useState } from 'react';
import { Eye, FileText, Pencil, Trash2, MoreHorizontal, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssetWithRelations } from '@/types/assetWithRelations';
import AssetDetailsDialog from './AssetDetailsDialog';
import AssetFullDataDialog from './AssetFullDataDialog';
import EditAssetDialog from './EditAssetDialog';
import DeleteAssetDialog from './DeleteAssetDialog';

interface AssetActionsProps {
  asset: AssetWithRelations;
  onAssetUpdated: () => void;
  onAssetDeleted: () => void;
}

const AssetActions = ({ asset, onAssetUpdated, onAssetDeleted }: AssetActionsProps) => {
  const [activeDialog, setActiveDialog] = useState<'fullData' | 'edit' | 'delete' | null>(null);

  const handleOpenDialog = (dialog: 'fullData' | 'edit' | 'delete') => {
    setActiveDialog(dialog);
  };

  const handleCloseDialog = () => {
    setActiveDialog(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 w-10 p-0 hover:bg-legal-primary/10 transition-colors duration-200"
          >
            <span className="sr-only">Abrir menu de ações</span>
            <MoreHorizontal className="h-4 w-4 text-legal-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          side="left"
          className="bg-white shadow-lg border border-legal-primary/20 rounded-lg min-w-[200px] w-64 sm:w-auto z-50"
        >
          <DropdownMenuLabel className="font-black text-legal-dark font-neue-haas">
            Ações do Ativo
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-legal-primary/20" />
          
          <DropdownMenuItem 
            onClick={() => handleOpenDialog('fullData')} 
            className="cursor-pointer flex items-center gap-3 py-3 px-3 hover:bg-legal-primary/10 transition-colors duration-200 focus:bg-legal-primary/10"
          >
            <Eye className="h-4 w-4 text-legal-primary" />
            <div className="flex flex-col">
              <span className="font-bold text-legal-dark font-neue-haas">Ver Detalhes</span>
              <span className="text-xs text-gray-500 hidden sm:block">Visualizar informações completas</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-legal-primary/10" />
          
          <DropdownMenuItem 
            onClick={() => handleOpenDialog('edit')} 
            className="cursor-pointer flex items-center gap-3 py-3 px-3 hover:bg-legal-secondary/10 transition-colors duration-200 focus:bg-legal-secondary/10"
          >
            <Pencil className="h-4 w-4 text-legal-secondary" />
            <div className="flex flex-col">
              <span className="font-bold text-legal-dark font-neue-haas">Editar Ativo</span>
              <span className="text-xs text-gray-500 hidden sm:block">Modificar dados cadastrais</span>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-legal-primary/10" />
          
          <DropdownMenuItem 
            onClick={() => handleOpenDialog('delete')} 
            className="cursor-pointer text-red-600 focus:text-red-700 flex items-center gap-3 py-3 px-3 hover:bg-red-50 transition-colors duration-200 focus:bg-red-50"
          >
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              <Trash2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold font-neue-haas">Excluir Ativo</span>
              <span className="text-xs text-red-400 hidden sm:block">Ação irreversível - use com cuidado</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AssetFullDataDialog 
        isOpen={activeDialog === 'fullData'} 
        onClose={handleCloseDialog} 
        asset={asset} 
      />
      
      <EditAssetDialog 
        isOpen={activeDialog === 'edit'} 
        onClose={handleCloseDialog} 
        asset={asset} 
        onAssetUpdated={onAssetUpdated} 
      />
      
      <DeleteAssetDialog 
        isOpen={activeDialog === 'delete'} 
        onClose={handleCloseDialog} 
        asset={asset} 
        onAssetDeleted={onAssetDeleted} 
      />
    </>
  );
};

export default AssetActions;
