
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, CheckSquare } from "lucide-react";
import { SelectedAsset } from '@modules/associations/types';
import { AssetSearchStep } from './steps/AssetSearchStep';
import { AssetSelectionStep } from './steps/AssetSelectionStep';

interface DesktopAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  selectedAssets: SelectedAsset[];
  onAssetSelected: (asset: SelectedAsset) => void;
  onAssetRemoved?: (assetId: string) => void;
  excludeAssociatedToClient?: string;
  multipleSelection?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export const DesktopAssetModal: React.FC<DesktopAssetModalProps> = ({
  open,
  onOpenChange,
  title,
  description,
  selectedAssets,
  onAssetSelected,
  onAssetRemoved,
  excludeAssociatedToClient,
  multipleSelection = true,
  onConfirm,
  onCancel,
  isLoading,
  confirmText = 'Confirmar',
  cancelText = 'Fechar'
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <Tabs defaultValue="search" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar Ativos
            </TabsTrigger>
            <TabsTrigger value="selected" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Selecionados ({selectedAssets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="flex-1 overflow-hidden mt-4">
            <AssetSearchStep
              selectedAssets={selectedAssets}
              onAssetSelected={onAssetSelected}
              excludeAssociatedToClient={excludeAssociatedToClient}
            />
          </TabsContent>

          <TabsContent value="selected" className="flex-1 overflow-hidden mt-4">
            <AssetSelectionStep
              selectedAssets={selectedAssets}
              onAssetRemoved={onAssetRemoved}
              multipleSelection={multipleSelection}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button
            variant="outline"
            onClick={onCancel || (() => onOpenChange(false))}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading || selectedAssets.length === 0}
            >
              {isLoading ? 'Processando...' : `${confirmText}`}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
