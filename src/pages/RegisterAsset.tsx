
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Smartphone } from "lucide-react";
import ChipForm from "@/components/inventory/forms/ChipForm";
import RouterForm from "@/components/inventory/forms/RouterForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RegisterAsset = () => {
  const navigate = useNavigate();

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
          <p className="text-muted-foreground">
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
          <Tabs defaultValue="chip" className="w-full">
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
              <ChipForm />
            </TabsContent>
            
            <TabsContent value="equipment" className="mt-6">
              <RouterForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterAsset;
