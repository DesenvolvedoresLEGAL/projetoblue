
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Smartphone } from "lucide-react";
import ChipForm from "@/components/inventory/forms/ChipForm";
import RouterForm from "@/components/inventory/forms/RouterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const RegisterAsset = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chip");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chip form state
  const [chipData, setChipData] = useState({
    iccid: '',
    phoneNumber: '',
    carrier: ''
  });

  // Router form state
  const [routerData, setRouterData] = useState({
    uniqueId: '',
    brand: '',
    model: '',
    ssid: '',
    password: '',
    ipAddress: '',
    adminUser: '',
    adminPassword: '',
    imei: '',
    serialNumber: ''
  });

  // Error states
  const [chipErrors, setChipErrors] = useState<Record<string, string>>({});
  const [routerErrors, setRouterErrors] = useState<Record<string, string>>({});

  const validateChipForm = () => {
    const errors: Record<string, string> = {};
    
    if (!chipData.iccid.trim()) {
      errors.iccid = 'ICCID é obrigatório';
    }
    if (!chipData.phoneNumber.trim()) {
      errors.phoneNumber = 'Número de telefone é obrigatório';
    }
    if (!chipData.carrier.trim()) {
      errors.carrier = 'Operadora é obrigatória';
    }

    setChipErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRouterForm = () => {
    const errors: Record<string, string> = {};
    
    if (!routerData.uniqueId.trim()) {
      errors.uniqueId = 'ID Único é obrigatório';
    }
    if (!routerData.brand.trim()) {
      errors.brand = 'Marca é obrigatória';
    }
    if (!routerData.model.trim()) {
      errors.model = 'Modelo é obrigatório';
    }

    setRouterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const isValid = activeTab === 'chip' ? validateChipForm() : validateRouterForm();
      
      if (!isValid) {
        toast.error('Por favor, corrija os erros no formulário');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assetType = activeTab === 'chip' ? 'Chip' : 'Equipamento';
      toast.success(`${assetType} registrado com sucesso!`);
      
      // Reset form
      if (activeTab === 'chip') {
        setChipData({ iccid: '', phoneNumber: '', carrier: '' });
        setChipErrors({});
      } else {
        setRouterData({
          uniqueId: '',
          brand: '',
          model: '',
          ssid: '',
          password: '',
          ipAddress: '',
          adminUser: '',
          adminPassword: '',
          imei: '',
          serialNumber: ''
        });
        setRouterErrors({});
      }
      
    } catch (error) {
      toast.error('Erro ao registrar ativo. Tente novamente.');
      console.error('Error registering asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Registrar Novo Ativo
          </h1>
          <p className="text-gray-700">
            Adicione novos chips ou equipamentos ao inventário
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tipo de Ativo</CardTitle>
          <CardDescription>
            Selecione o tipo de ativo que deseja registrar no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chip" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Chip (SIM Card)
              </TabsTrigger>
              <TabsTrigger value="equipment" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Equipamento
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chip" className="mt-6">
              <ChipForm 
                chipData={chipData}
                setChipData={setChipData}
                errors={chipErrors}
              />
            </TabsContent>
            
            <TabsContent value="equipment" className="mt-6">
              <RouterForm 
                routerData={routerData}
                setRouterData={setRouterData}
                errors={routerErrors}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Ativo'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterAsset;
