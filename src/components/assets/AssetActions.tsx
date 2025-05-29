
import React, { useState } from 'react';
import { Eye, FileText, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssetWithRelations } from '@/hooks/useAssetsData';
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
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleOpenDialog('fullData')} className="cursor-pointer flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            <span>Ver detalhes</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleOpenDialog('edit')} className="cursor-pointer flex items-center">
            <Pencil className="mr-2 h-4 w-4" />
            <span>Editar</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => handleOpenDialog('delete')} 
            className="cursor-pointer text-red-500 focus:text-red-500 flex items-center"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Excluir</span>
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
