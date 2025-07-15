
import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SelectedAsset } from '@modules/associations/types';
import { AssetSearchStep } from './steps/AssetSearchStep';
import { AssetSelectionStep } from './steps/AssetSelectionStep';

interface MobileAssetModalProps {
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

type Step = 'search' | 'selection';

export const MobileAssetModal: React.FC<MobileAssetModalProps> = ({
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
  cancelText = 'Cancelar'
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('search');

  const handleBack = () => {
    if (currentStep === 'selection') {
      setCurrentStep('search');
    }
  };

  const handleNext = () => {
    if (currentStep === 'search' && selectedAssets.length > 0) {
      setCurrentStep('selection');
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'search': return 'Buscar Ativos';
      case 'selection': return `Selecionados (${selectedAssets.length})`;
      default: return title;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'search':
        return (
          <AssetSearchStep
            selectedAssets={selectedAssets}
            onAssetSelected={onAssetSelected}
            excludeAssociatedToClient={excludeAssociatedToClient}
          />
        );
      case 'selection':
        return (
          <AssetSelectionStep
            selectedAssets={selectedAssets}
            onAssetRemoved={onAssetRemoved}
            multipleSelection={multipleSelection}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[90vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            {currentStep !== 'search' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="p-2"
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex-1 text-center">
              <DrawerTitle className="text-lg">{getStepTitle()}</DrawerTitle>
              {description && currentStep === 'search' && (
                <DrawerDescription className="text-sm mt-1">
                  {description}
                </DrawerDescription>
              )}
            </div>
            {(currentStep === 'search' && selectedAssets.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className="p-2"
                disabled={isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden">
          {renderStepContent()}
        </div>

        {/* Bottom Actions */}
        <div className="flex-shrink-0 p-4 border-t bg-background">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel || (() => onOpenChange(false))}
              className="flex-1"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            {currentStep === 'selection' && onConfirm && (
              <Button
                onClick={onConfirm}
                className="flex-1"
                disabled={isLoading || selectedAssets.length === 0}
              >
                {isLoading ? 'Processando...' : confirmText}
              </Button>
            )}
            {currentStep === 'search' && selectedAssets.length > 0 && (
              <Button
                onClick={handleNext}
                className="flex-1"
                disabled={isLoading}
              >
                Ver Selecionados
              </Button>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
