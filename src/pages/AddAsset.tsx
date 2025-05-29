
import React, { useState } from 'react';
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { StandardFiltersCard } from "@/components/ui/standard-filters-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PackagePlus, Smartphone, Wifi, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ChipForm from '@/components/assets/ChipForm';
import EquipmentForm from '@/components/assets/EquipmentForm';

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
      />

      {!selectedType ? (
        <StandardFiltersCard title="Selecionar Tipo de Ativo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="cursor-pointer border-[#4D2BFB]/20 hover:border-[#4D2BFB] hover:shadow-md transition-all duration-200 hover:bg-[#4D2BFB]/5"
              onClick={() => handleTypeSelection('chip')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-full bg-[#03F9FF]/20 w-fit">
                  <Smartphone className="h-8 w-8 text-[#4D2BFB]" />
                </div>
                <CardTitle className="text-[#020CBC] font-neue-haas">CHIP</CardTitle>
                <CardDescription className="font-neue-haas">
                  Cadastrar linha telefônica ou chip de dados
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white font-neue-haas font-bold"
                  onClick={() => handleTypeSelection('chip')}
                >
                  Cadastrar CHIP
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer border-[#4D2BFB]/20 hover:border-[#4D2BFB] hover:shadow-md transition-all duration-200 hover:bg-[#4D2BFB]/5"
              onClick={() => handleTypeSelection('equipment')}
            >
              <CardHeader className="text-center">
                <div className="mx-auto p-3 rounded-full bg-[#03F9FF]/20 w-fit">
                  <Wifi className="h-8 w-8 text-[#4D2BFB]" />
                </div>
                <CardTitle className="text-[#020CBC] font-neue-haas">EQUIPAMENTO</CardTitle>
                <CardDescription className="font-neue-haas">
                  Cadastrar roteador, modem ou equipamento de rede
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full bg-[#4D2BFB] hover:bg-[#3a1ecc] text-white font-neue-haas font-bold"
                  onClick={() => handleTypeSelection('equipment')}
                >
                  Cadastrar Equipamento
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </StandardFiltersCard>
      ) : (
        <Card className="border-[#4D2BFB]/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-[#4D2BFB] hover:bg-[#4D2BFB]/10 font-neue-haas"
              >
                ← Voltar
              </Button>
              <div>
                <CardTitle className="text-[#020CBC] font-neue-haas">
                  Cadastrar {selectedType === 'chip' ? 'CHIP' : 'Equipamento'}
                </CardTitle>
                <CardDescription className="font-neue-haas">
                  Preencha as informações do {selectedType === 'chip' ? 'chip' : 'equipamento'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
