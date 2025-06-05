
import React, { useState } from 'react';
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { StandardFiltersCard } from "@/components/ui/standard-filters-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PackagePlus, Smartphone, Wifi, ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ChipForm from '@modules/assets/components/assets/ChipForm';
import EquipmentForm from '@modules/assets/components/assets/EquipmentForm';

const AddAsset = () => {
  const [selectedType, setSelectedType] = useState<'chip' | 'equipment' | null>(null);
  const navigate = useNavigate();

  const handleTypeSelection = (type: 'chip' | 'equipment') => {
    setSelectedType(type);
  };

  const handleSuccess = () => {
    // Reset form and show success
    setSelectedType(null);
    // Navigate back to assets list after short delay
    setTimeout(() => {
      navigate('/assets');
    }, 2000);
  };

  const handleCancel = () => {
    if (selectedType) {
      setSelectedType(null);
    } else {
      navigate('/assets');
    }
  };

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={PackagePlus}
        title="Cadastrar Novo Ativo"
        description="Adicione CHIPs ou equipamentos ao inventário da empresa"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/assets')}
          className="flex items-center gap-2 text-[#4D2BFB] hover:bg-[#4D2BFB]/10 font-neue-haas"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </StandardPageHeader>

      {!selectedType ? (
        <StandardFiltersCard title="Selecionar Tipo de Ativo">
          <div className="space-y-6">
            {/* Toggle Group para seleção de tipo */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-[#020CBC] font-neue-haas">
                Escolha o tipo de ativo que deseja cadastrar:
              </div>
              <ToggleGroup 
                value="" 
                onValueChange={(value) => handleTypeSelection(value as 'chip' | 'equipment')}
                className="w-full max-w-md"
              >
                <ToggleGroupItem value="chip" className="gap-2">
                  <Smartphone className="h-4 w-4" />
                  CHIP
                </ToggleGroupItem>
                <ToggleGroupItem value="equipment" className="gap-2">
                  <Wifi className="h-4 w-4" />
                  Equipamento
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Cards informativos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card 
                className="cursor-pointer border-[#4D2BFB]/20 hover:border-[#4D2BFB] hover:shadow-md transition-all duration-200 hover:bg-[#4D2BFB]/5"
                onClick={() => handleTypeSelection('chip')}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto p-3 rounded-full bg-[#03F9FF]/20 w-fit">
                    <Smartphone className="h-8 w-8 text-[#4D2BFB]" />
                  </div>
                  <CardTitle className="text-[#020CBC] font-neue-haas text-lg">CHIP</CardTitle>
                  <CardDescription className="font-neue-haas">
                    Cadastrar linha telefônica ou chip de dados
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      • ICCID e número da linha
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      • Operadora e plano de dados
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      • Observações adicionais
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer border-[#4D2BFB]/20 hover:border-[#4D2BFB] hover:shadow-md transition-all duration-200 hover:bg-[#4D2BFB]/5"
                onClick={() => handleTypeSelection('equipment')}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto p-3 rounded-full bg-[#03F9FF]/20 w-fit">
                    <Wifi className="h-8 w-8 text-[#4D2BFB]" />
                  </div>
                  <CardTitle className="text-[#020CBC] font-neue-haas text-lg">EQUIPAMENTO</CardTitle>
                  <CardDescription className="font-neue-haas">
                    Cadastrar roteador, modem ou equipamento de rede
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      • Número do rádio
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      • Modelo e fabricante
                    </div>
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      • Informações técnicas
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </StandardFiltersCard>
      ) : (
        <Card className="border-[#4D2BFB]/20 shadow-sm">
          <CardHeader className="border-b border-[#4D2BFB]/10 bg-[#F0F3FF]">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-[#4D2BFB] hover:bg-[#4D2BFB]/10 font-neue-haas"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#03F9FF]/20">
                  {selectedType === 'chip' ? 
                    <Smartphone className="h-5 w-5 text-[#4D2BFB]" /> : 
                    <Wifi className="h-5 w-5 text-[#4D2BFB]" />
                  }
                </div>
                <div>
                  <CardTitle className="text-[#020CBC] font-neue-haas">
                    Cadastrar {selectedType === 'chip' ? 'CHIP' : 'Equipamento'}
                  </CardTitle>
                  <CardDescription className="font-neue-haas">
                    Preencha as informações do {selectedType === 'chip' ? 'chip' : 'equipamento'}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {selectedType === 'chip' ? (
              <ChipForm onSuccess={handleSuccess} onCancel={handleCancel} />
            ) : (
              <EquipmentForm onSuccess={handleSuccess} onCancel={handleCancel} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddAsset;
