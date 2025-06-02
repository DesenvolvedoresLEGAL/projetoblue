
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Client } from '@/types/asset';
import { SelectedAsset } from '@/pages/AssetAssociation';
import { CheckCircle, User, Package, Calendar, AlertCircle } from "lucide-react";
import { useCreateAssociation } from '@/hooks/useCreateAssociation';
import { toast } from 'sonner';
import { formatPhoneNumber, parsePhoneFromScientific } from '@/utils/phoneFormatter';

interface AssociationSummaryProps {
  client: Client;
  assets: SelectedAsset[];
  onComplete: () => void;
  onBack: () => void;
}

export const AssociationSummary: React.FC<AssociationSummaryProps> = ({
  client,
  assets,
  onComplete,
  onBack
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const createAssociation = useCreateAssociation();

  const handleConfirm = async () => {
    setIsCreating(true);
    
    try {
      // Criar associações para cada ativo
      for (const asset of assets) {
        await createAssociation.mutateAsync({
          clientId: client.id,
          assetId: asset.uuid,
          associationType: asset.associationType || 'ALUGUEL',
          startDate: asset.startDate || new Date().toISOString(),
          rentedDays: asset.rented_days || 30,
          notes: asset.notes || ''
        });
      }

      toast.success('Associações criadas com sucesso!');
      onComplete();
    } catch (error) {
      console.error('Erro ao criar associações:', error);
      toast.error('Erro ao criar associações');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTotalValue = () => {
    // Exemplo de cálculo de valor total
    return assets.length * 50; // R$ 50 por ativo
  };

  return (
    <div className="space-y-6">
      {/* Informações do Cliente */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#020CBC]">
            <User className="h-5 w-5 text-[#03F9FF]" />
            Cliente Selecionado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Nome</div>
              <div className="font-medium">{client.nome}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Contato</div>
              <div className="font-medium">{formatPhoneNumber(parsePhoneFromScientific(client.contato))}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos Ativos */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#020CBC]">
            <Package className="h-5 w-5 text-[#03F9FF]" />
            Ativos Selecionados ({assets.length})
          </CardTitle>
          <CardDescription>
            Revise os ativos e configurações antes de confirmar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <>
            {assets.map((asset, index) => (
              <div key={asset.uuid}>
                <div className="flex items-start justify-between p-4 bg-[#F0F3FF] rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      {asset.type === 'CHIP' ? '📱' : '📡'}
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium text-[#020CBC]">
                        {asset.type === 'CHIP' ? 'CHIP' : 'EQUIPAMENTO'} - {asset.solucao}
                      </div>
                      <div className="text-sm space-y-1">
                        {asset.type === 'CHIP' ? (
                          <>
                            <div>ICCID: {asset.iccid}</div>
                            <div>Linha: {asset.line_number}</div>
                          </>
                        ) : (
                          <>
                            <div>Rádio: {asset.radio}</div>
                            <div>Modelo: {asset.modelo}</div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">
                          {asset.associationType || 'ALUGUEL'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(asset.startDate || new Date().toISOString())}
                        </div>
                        {asset.rented_days && (
                          <div>{asset.rented_days} dias</div>
                        )}
                      </div>
                      {asset.notes && (
                        <div className="text-sm text-muted-foreground italic">
                          "{asset.notes}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {index < assets.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </>
          <>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <div className="font-medium">Confirmação Final</div>
                <div>
                  Ao confirmar, os ativos selecionados serão associados ao cliente 
                  e não estarão mais disponíveis para outras associações.
                </div>
              </div>
            </div>
          </div>
          </>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isCreating}
          className="flex-1 border-[#4D2BFB] text-[#4D2BFB] hover:bg-[#4D2BFB]/10"
        >
          Voltar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isCreating}
          className="flex-1 bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white font-neue-haas"
        >
          {isCreating ? 'Criando Associações...' : 'Confirmar Associações'}
        </Button>
      </div>
    </div>
  );
};
