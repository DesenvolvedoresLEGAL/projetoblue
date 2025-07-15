
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Smartphone, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { SelectedAsset } from '@modules/associations/types';
import { useAvailableChips } from '@modules/associations/hooks/useAvailableChips';

interface ChipSelectorProps {
  selectedAssets: SelectedAsset[];
  onChipSelected: (chip: SelectedAsset, isPrincipal: boolean) => void;
  onChipRemoved: () => void;
  currentAssociatedChip?: SelectedAsset | null;
  excludeAssociatedToClient?: string;
}

export const ChipSelector: React.FC<ChipSelectorProps> = ({
  selectedAssets,
  onChipSelected,
  onChipRemoved,
  currentAssociatedChip,
  excludeAssociatedToClient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrincipal, setIsPrincipal] = useState(true);
  const [selectedChip, setSelectedChip] = useState<SelectedAsset | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { chips, isLoading } = useAvailableChips({
    selectedAssets,
    excludeAssociatedToClient
  });

  // Sincronização com chip associado atual
  useEffect(() => {
    console.log('=== SINCRONIZAÇÃO COM CHIP ATUAL ===');
    console.log('Chip atual recebido:', currentAssociatedChip?.uuid, currentAssociatedChip?.line_number || currentAssociatedChip?.iccid);
    
    if (currentAssociatedChip) {
      setSelectedChip(currentAssociatedChip);
      setIsPrincipal(currentAssociatedChip.isPrincipalChip || true);
      setIsConfirmed(true);
      console.log('ChipSelector sincronizado com chip atual:', currentAssociatedChip.uuid);
    } else {
      setSelectedChip(null);
      setIsPrincipal(true);
      setIsConfirmed(false);
      console.log('ChipSelector resetado - nenhum chip associado');
    }
    
    console.log('=== SINCRONIZAÇÃO OTIMIZADA CONCLUÍDA ===');
  }, [currentAssociatedChip]);

  const filteredChips = chips.filter(chip => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      chip.iccid?.toLowerCase().includes(term) ||
      chip.line_number?.toLowerCase().includes(term) ||
      chip.uuid.toLowerCase().includes(term)
    );
  });

  const getChipIdentifier = (chip: SelectedAsset) => {
    return chip.line_number || chip.iccid || chip.uuid;
  };

  const handleChipSelect = (chip: SelectedAsset) => {
    console.log('CHIP selecionado localmente:', chip.uuid);
    setSelectedChip(chip);
    setIsConfirmed(false);
  };

  const handleConfirmSelection = () => {
    if (selectedChip) {
      console.log('=== CONFIRMAÇÃO DE CHIP ===');
      console.log('Confirmando seleção de CHIP:', selectedChip.uuid, 'isPrincipal:', isPrincipal);
      
      // Criar objeto completo com todas as propriedades necessárias
      const chipToAssociate: SelectedAsset = {
        ...selectedChip,
        isPrincipalChip: isPrincipal,
        // Garantir que todas as propriedades estão presentes
        uuid: selectedChip.uuid,
        type: selectedChip.type || 'CHIP',
        marca: selectedChip.marca || '',
        modelo: selectedChip.modelo || '',
        serial_number: selectedChip.serial_number || '',
        iccid: selectedChip.iccid || '',
        line_number: selectedChip.line_number || '',
        // Adicionar timestamp para controle
        associatedAt: new Date().toISOString()
      };
      
      console.log('Dados completos do chip a ser propagado:', chipToAssociate);
      
      // Aplicar feedback visual imediato
      setIsConfirmed(true);
      
      // Propagar seleção com dados completos
      try {
        onChipSelected(chipToAssociate, isPrincipal);
        console.log('CHIP confirmado e propagado com sucesso');
      } catch (error) {
        console.error('Erro ao propagar seleção de chip:', error);
        // Reverter estado em caso de erro
        setIsConfirmed(false);
      }
    } else {
      console.warn('Tentativa de confirmação sem chip selecionado');
    }
  };

  const handleRemoveChip = () => {
    console.log('=== REMOÇÃO DE CHIP ===');
    console.log('Removendo CHIP associado:', selectedChip?.uuid);
    
    // Reset completo do estado
    setSelectedChip(null);
    setIsPrincipal(true);
    setIsConfirmed(false);
    setSearchTerm('');
    
    // Propagar remoção
    try {
      onChipRemoved();
      console.log('CHIP removido e estado resetado completamente');
    } catch (error) {
      console.error('Erro ao propagar remoção de chip:', error);
    }
  };

  // Função para verificar se o chip está realmente confirmado
  const isChipConfirmed = () => {
    return isConfirmed && currentAssociatedChip && selectedChip?.uuid === currentAssociatedChip.uuid;
  };

  return (
    <Card className="border-[#4D2BFB]/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Smartphone className="h-4 w-4 text-[#03F9FF]" />
          Associar CHIP
          {isChipConfirmed() && (
            <Badge variant="outline" className="bg-green-100 text-green-800 ml-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              Confirmado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isChipConfirmed() ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium text-sm">
                    {getChipIdentifier(currentAssociatedChip!)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      CHIP Associado
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {currentAssociatedChip!.isPrincipalChip ? 'Principal' : 'Backup'}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveChip}
                className="text-red-600 hover:bg-red-50"
              >
                Remover
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chip-search">Buscar CHIP</Label>
              <div className="relative">
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="principal-chip"
                checked={isPrincipal}
                onCheckedChange={(checked) => setIsPrincipal(checked === true)}
              />
              <Label htmlFor="principal-chip" className="text-sm">
                Este CHIP será principal
              </Label>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">
                  Carregando CHIPs disponíveis...
                </div>
              ) : filteredChips.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p>Nenhum CHIP disponível encontrado</p>
                  <p className="text-xs">Verifique se existem CHIPs livres</p>
                </div>
              ) : (
                filteredChips.map((chip) => (
                  <Card
                    key={chip.uuid}
                    className={`cursor-pointer transition-all ${
                      selectedChip?.uuid === chip.uuid
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                    onClick={() => handleChipSelect(chip)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm">
                              {getChipIdentifier(chip)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
                                CHIP
                              </Badge>
                              <span className="text-xs text-gray-600">
                                {chip.marca}
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedChip?.uuid === chip.uuid && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {selectedChip && !isConfirmed && (
              <Button
                onClick={handleConfirmSelection}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!selectedChip}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmar Associação do CHIP
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
