
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wifi, Cpu, Package, Smartphone } from "lucide-react";
import { useAssetRegistrationState } from '../../../hooks/useAssetRegistrationState';
import { ChipForm } from '../../../components/assets/ChipForm';
import { EquipmentForm } from '../../../components/assets/EquipmentForm';
import { AssetType } from '@/types/asset';

interface RegisterAssetFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialType?: AssetType;
}

export const RegisterAssetForm: React.FC<RegisterAssetFormProps> = ({
  onSuccess,
  onCancel,
  initialType = 'CHIP'
}) => {
  const {
    currentFormType,
    setCurrentFormType,
    setAssetType,
    isInitialized,
    setIsInitialized,
    clearState
  } = useAssetRegistrationState();

  // Initialize form type based on initialType
  useEffect(() => {
    if (!isInitialized) {
      if (initialType === 'CHIP') {
        setCurrentFormType('chip');
        setAssetType('CHIP');
      } else if (initialType === 'ROTEADOR' || initialType === 'EQUIPAMENTO' || initialType === 'EQUIPMENT') {
        setCurrentFormType('equipment');
        setAssetType('ROTEADOR'); // Mapear EQUIPAMENTO para ROTEADOR internamente
      }
      setIsInitialized(true);
    }
  }, [initialType, isInitialized, setCurrentFormType, setAssetType, setIsInitialized]);

  const handleFormTypeChange = (value: string) => {
    if (value === 'chip' || value === 'equipment') {
      setCurrentFormType(value);
      // Mapear para tipos corretos do AssetType
      if (value === 'chip') {
        setAssetType('CHIP');
      } else {
        setAssetType('ROTEADOR'); // Equipment sempre mapeia para ROTEADOR
      }
    }
  };

  const handleSuccess = () => {
    clearState();
    onSuccess?.();
  };

  const handleCancel = () => {
    clearState();
    onCancel?.();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="border-2 border-[#4D2BFB]/20">
        <CardHeader className="text-center bg-gradient-to-r from-[#4D2BFB]/5 to-[#03F9FF]/5">
          <CardTitle className="text-2xl font-bold text-[#020CBC] flex items-center justify-center gap-2">
            <Package className="h-6 w-6" />
            Cadastrar Novo Ativo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={currentFormType} onValueChange={handleFormTypeChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="chip" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                SIM Card
              </TabsTrigger>
              <TabsTrigger value="equipment" className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                Equipamento
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chip" className="space-y-4">
              <ChipForm onSuccess={handleSuccess} onCancel={handleCancel} />
            </TabsContent>

            <TabsContent value="equipment" className="space-y-4">
              <EquipmentForm onSuccess={handleSuccess} onCancel={handleCancel} />
            </TabsContent>
          </Tabs>

          {onCancel && (
            <div className="flex justify-end mt-6">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
