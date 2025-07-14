
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Search, Check, AlertTriangle } from 'lucide-react';
import { SelectedAsset } from '@modules/associations/types';
import { useAssetSearch } from '@modules/associations/hooks/useAssetSearch';

interface ChipAssociationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: SelectedAsset;
  selectedAssets: SelectedAsset[];
  onChipSelected: (chip: SelectedAsset, equipmentId: string) => void;
  onCancel?: () => void;
}

export const ChipAssociationModal: React.FC<ChipAssociationModalProps> = ({
  open,
  onOpenChange,
  equipment,
  selectedAssets,
  onChipSelected,
  onCancel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChip, setSelectedChip] = useState<SelectedAsset | null>(null);

  const { assets: availableChips, isLoading } = useAssetSearch({
    filters: {
      solutionId: 11, // Apenas CHIPs
      statusId: 1, // Disponível
      searchTerm: searchTerm
    },
    selectedAssets,
    excludeAssociatedToClient: undefined
  });

  const handleConfirm = () => {
    if (selectedChip) {
      onChipSelected(selectedChip, equipment.uuid);
      onOpenChange(false);
      setSelectedChip(null);
      setSearchTerm('');
    }
  };

  const handleCancel = () => {
    setSelectedChip(null);
    setSearchTerm('');
    onCancel?.();
    onOpenChange(false);
  };

  const getChipIdentifier = (chip: SelectedAsset) => {
    return chip.line_number || chip.iccid || chip.uuid;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Associar CHIP ao Equipamento
          </DialogTitle>
          <DialogDescription>
            Selecione um CHIP para associar ao equipamento: {equipment.radio || equipment.model}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Informações do Equipamento */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-orange-100 text-orange-800">
                  {equipment.solucao}
                </Badge>
                <span className="font-medium">
                  {equipment.radio || equipment.model}
                </span>
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  Precisa CHIP
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Busca de CHIPs */}
          <div className="flex-shrink-0">
            <Label htmlFor="chip-search">Buscar CHIP</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="chip-search"
                placeholder="Digite ICCID ou número da linha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de CHIPs */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Carregando CHIPs disponíveis...
              </div>
            ) : availableChips.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p>Nenhum CHIP disponível encontrado</p>
                <p className="text-sm">Verifique se existem CHIPs livres no sistema</p>
              </div>
            ) : (
              availableChips.map((chip) => (
                <Card
                  key={chip.uuid}
                  className={`cursor-pointer transition-all ${
                    selectedChip?.uuid === chip.uuid
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                  onClick={() => setSelectedChip(chip)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">
                            {getChipIdentifier(chip)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              CHIP
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {chip.marca}
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedChip?.uuid === chip.uuid && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedChip}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Associar CHIP
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
