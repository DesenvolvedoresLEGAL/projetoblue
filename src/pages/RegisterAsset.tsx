
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/utils/toast";
import { WizardProvider, useWizard } from "@/components/wizard/WizardContext";
import { WizardStepIndicator } from "@/components/wizard/WizardStepIndicator";
import { WizardNavigation } from "@/components/wizard/WizardNavigation";
import { AssetTypeSelection } from "@/components/wizard/steps/AssetTypeSelection";
import { AssetDetailsForm } from "@/components/wizard/steps/AssetDetailsForm";
import { AssetAssociationForm } from "@/components/wizard/steps/AssetAssociationForm";
import { AssetStatusForm } from "@/components/wizard/steps/AssetStatusForm";

const AssetWizard: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep, assetType, assetData, resetWizard } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateCurrentStep = () => {
    if (currentStep === "assetDetails") {
      if (!assetType) return false;
      
      if (assetType === "CHIP") {
        return !!(assetData.line_number && assetData.manufacturer_id && assetData.plan_id);
      } else if (assetType === "ROTEADOR") {
        return !!(assetData.serial_number && assetData.model && assetData.manufacturer_id);
      }
    }
    
    if (currentStep === "association" && assetData.client_id) {
      return !!(assetData.entry_date && assetData.association_id);
    }
    
    return true;
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      console.log("Submitting asset data:", assetData);
      
      // Prepare the asset data according to the selected type
      const assetPayload: any = {
        type_id: assetData.type_id,
        manufacturer_id: assetData.manufacturer_id,
        status_id: assetData.status_id || 1 // Default to available (id=1) if not set
      };
      
      // Add type-specific fields
      if (assetType === "CHIP") {
        assetPayload.line_number = assetData.line_number;
        assetPayload.iccid = assetData.iccid;
        assetPayload.plan_id = assetData.plan_id;
      } else if (assetType === "ROTEADOR") {
        assetPayload.serial_number = assetData.serial_number;
        assetPayload.model = assetData.model;
        assetPayload.password = assetData.password;
        assetPayload.radio = assetData.radio;
        assetPayload.rented_days = assetData.rented_days || 0;
        assetPayload.solution_id = assetData.solution_id;
      }
      
      // Step 1: Insert asset
      const { data: assetData, error: assetError } = await supabase
        .from('assets')
        .insert(assetPayload)
        .select('uuid')
        .single();
      
      if (assetError) {
        throw new Error(`Erro ao cadastrar ativo: ${assetError.message}`);
      }
      
      // Step 2: If client association is requested, create the association
      if (assetData.uuid && assetData.client_id && assetData.entry_date && assetData.association_id) {
        const associationPayload = {
          asset_id: assetData.uuid,
          client_id: assetData.client_id,
          entry_date: assetData.entry_date,
          association_id: assetData.association_id
        };
        
        const { error: associationError } = await supabase
          .from('asset_client_assoc')
          .insert(associationPayload);
        
        if (associationError) {
          // Log error but don't throw (asset was already created)
          console.error("Error creating association:", associationError);
          toast.error(`Ativo criado, mas houve um erro na vinculação: ${associationError.message}`);
        }
      }
      
      toast.success("Ativo cadastrado com sucesso!");
      resetWizard();
      navigate("/inventory");
    } catch (error: any) {
      console.error("Error submitting asset:", error);
      toast.error(error.message || "Erro ao cadastrar ativo");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStepContent = () => {
    if (!assetType && currentStep === "assetDetails") {
      return <AssetTypeSelection />;
    }
    
    switch (currentStep) {
      case "assetDetails":
        return <AssetDetailsForm />;
        
      case "association":
        return <AssetAssociationForm />;
        
      case "status":
        return <AssetStatusForm />;
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Cadastrar Novo Ativo
        </h1>
        <p className="text-muted-foreground">
          Preencha as informações para adicionar um novo ativo ao inventário
        </p>
      </div>
      
      <WizardStepIndicator />
      
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === "assetDetails" && !assetType 
              ? "Selecionar Tipo de Ativo" 
              : currentStep === "assetDetails" 
                ? `Detalhes do ${assetType === "CHIP" ? "Chip" : "Roteador"}` 
                : currentStep === "association" 
                  ? "Vinculação (Opcional)" 
                  : "Status Inicial"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
          
          <WizardNavigation 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            disableNext={!validateCurrentStep()}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default function RegisterAsset() {
  return (
    <WizardProvider>
      <AssetWizard />
    </WizardProvider>
  );
}
