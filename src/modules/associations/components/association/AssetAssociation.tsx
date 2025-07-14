
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AssetSelectionStep } from './AssetSelectionStep';
import { SelectedAsset } from '@modules/associations/types';

interface AssetAssociationProps {
  onComplete?: () => void;
  excludeAssociatedToClient?: string;
}

export const AssetAssociation: React.FC<AssetAssociationProps> = ({
  onComplete,
  excludeAssociatedToClient
}) => {
  const [currentStep, setCurrentStep] = useState<'assets' | 'summary'>('assets');
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);

  const handleAssetSelectionComplete = () => {
    setCurrentStep('summary');
  };

  const handleBack = () => {
    setCurrentStep('assets');
  };

  const handleConfirmAssociation = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Associação de Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 'assets' && (
            <AssetSelectionStep
              selectedAssets={selectedAssets}
              onAssetsChange={setSelectedAssets}
              onComplete={handleAssetSelectionComplete}
              excludeAssociatedToClient={excludeAssociatedToClient}
            />
          )}

          {currentStep === 'summary' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resumo da Associação</h3>
              <p>Ativos selecionados: {selectedAssets.length}</p>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <Button onClick={handleConfirmAssociation}>
                  Confirmar Associação
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
