
import React, { useState, useEffect } from "react";
import { useWizard } from "../WizardContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const AssetDetailsForm: React.FC = () => {
  const { assetType, assetData, updateAssetData } = useWizard();
  const [plans, setPlans] = useState<any[]>([]);
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch required data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch plans for chips
        if (assetType === "CHIP") {
          const { data: plansData, error: plansError } = await supabase
            .from('plans')
            .select('id, nome, tamanho_gb');
            
          if (plansError) throw plansError;
          setPlans(plansData || []);
        }
        
        // Fetch manufacturers for both types
        const { data: manufacturersData, error: manufacturersError } = await supabase
          .from('manufacturers')
          .select('id, name');
          
        if (manufacturersError) throw manufacturersError;
        setManufacturers(manufacturersData || []);
        
        // Fetch solutions for routers
        if (assetType === "ROTEADOR") {
          const { data: solutionsData, error: solutionsError } = await supabase
            .from('asset_solutions')
            .select('id, solution');
            
          if (solutionsError) throw solutionsError;
          setSolutions(solutionsData || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Erro ao carregar dados. Por favor, tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (assetType) {
      fetchData();
    }
  }, [assetType]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric strings to numbers for specific fields
    if (name === "line_number" || name === "rented_days") {
      const numValue = value === "" ? null : Number(value);
      updateAssetData({ [name]: numValue });
    } else {
      updateAssetData({ [name]: value });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    updateAssetData({ [name]: value === "" ? null : Number(value) });
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Carregando dados...</div>;
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (assetType === "CHIP") {
    // Chip asset form
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="line_number">Número da Linha*</Label>
          <Input
            id="line_number"
            name="line_number"
            type="number"
            placeholder="Ex: 11987654321"
            value={assetData.line_number || ""}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="iccid">ICCID*</Label>
          <Input
            id="iccid"
            name="iccid"
            placeholder="Ex: 89550421180216543847"
            value={assetData.iccid || ""}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="plan_id">Plano*</Label>
          <Select
            value={assetData.plan_id?.toString() || ""}
            onValueChange={(value) => handleSelectChange("plan_id", value)}
          >
            <SelectTrigger id="plan_id">
              <SelectValue placeholder="Selecione o plano" />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id.toString()}>
                  {plan.nome} {plan.tamanho_gb > 0 ? `(${plan.tamanho_gb} GB)` : plan.tamanho_gb === -1 ? "(Ilimitado)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="manufacturer_id">Operadora*</Label>
          <Select
            value={assetData.manufacturer_id?.toString() || ""}
            onValueChange={(value) => handleSelectChange("manufacturer_id", value)}
          >
            <SelectTrigger id="manufacturer_id">
              <SelectValue placeholder="Selecione a operadora" />
            </SelectTrigger>
            <SelectContent>
              {manufacturers
                .filter(m => ["VIVO", "TIM", "CLARO"].includes(m.name.toUpperCase()))
                .map((manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                    {manufacturer.name.toUpperCase()}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 col-span-full">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Informações adicionais sobre o chip..."
            value={assetData.notes || ""}
            onChange={handleInputChange}
            rows={3}
          />
        </div>
      </div>
    );
  } else if (assetType === "ROTEADOR") {
    // Router asset form
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="serial_number">Número de Série*</Label>
          <Input
            id="serial_number"
            name="serial_number"
            placeholder="Ex: RTR123456789"
            value={assetData.serial_number || ""}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="model">Modelo*</Label>
          <Input
            id="model"
            name="model"
            placeholder="Ex: MikroTik hAP ac²"
            value={assetData.model || ""}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="manufacturer_id">Fabricante*</Label>
          <Select
            value={assetData.manufacturer_id?.toString() || ""}
            onValueChange={(value) => handleSelectChange("manufacturer_id", value)}
          >
            <SelectTrigger id="manufacturer_id">
              <SelectValue placeholder="Selecione o fabricante" />
            </SelectTrigger>
            <SelectContent>
              {manufacturers
                .filter(m => !["VIVO", "TIM", "CLARO"].includes(m.name.toUpperCase()))
                .map((manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                    {manufacturer.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="solution_id">Solução*</Label>
          <Select
            value={assetData.solution_id?.toString() || ""}
            onValueChange={(value) => handleSelectChange("solution_id", value)}
          >
            <SelectTrigger id="solution_id">
              <SelectValue placeholder="Selecione a solução" />
            </SelectTrigger>
            <SelectContent>
              {solutions.map((solution) => (
                <SelectItem key={solution.id} value={solution.id.toString()}>
                  {solution.solution}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="text"
            placeholder="Senha do equipamento"
            value={assetData.password || ""}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="radio">Rádio</Label>
          <Input
            id="radio"
            name="radio"
            placeholder="Informações de rádio"
            value={assetData.radio || ""}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rented_days">Dias de Aluguel</Label>
          <Input
            id="rented_days"
            name="rented_days"
            type="number"
            placeholder="Ex: 3"
            value={assetData.rented_days || ""}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="space-y-2 col-span-full">
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Informações adicionais sobre o roteador..."
            value={assetData.notes || ""}
            onChange={handleInputChange}
            rows={3}
          />
        </div>
      </div>
    );
  }
  
  return null;
};
