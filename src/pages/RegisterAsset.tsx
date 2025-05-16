
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";

// Import custom hooks and components
import { useReferenceData } from "@/hooks/useReferenceData";
import { AssetFormData, assetSchema } from "@/components/assets/AssetSchemas";
import { AssetTypeSelector } from "@/components/assets/AssetTypeSelector";
import { AssetFormCard } from "@/components/assets/AssetFormCard";

export default function RegisterAsset() {
  const [assetType, setAssetType] = useState<"CHIP" | "SPEEDY">("CHIP");
  const queryClient = useQueryClient();
  
  // Carregar dados de referência com o hook personalizado
  const { manufacturers, plans, assetStatus, assetSolutions, isLoading: loadingReferenceData } = useReferenceData();

  // Formulário unificado com discriminated union schema
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      type_id: 1, // This is a number type, not a string
      model: "NANOSIM",
    },
  });

  const { watch, reset, setFocus } = form;
  const typeId = watch("type_id");

  // Efeito para redefinir o formulário quando o tipo de ativo muda
  useEffect(() => {
    if (assetType === "CHIP") {
      reset({
        type_id: 1, // Using number instead of string
        model: "NANOSIM",
      });
    } else {
      reset({
        type_id: 2, // Using number instead of string
        rented_days: 0 // This is a string that gets transformed by zod schema
      });
    }
  }, [assetType, reset]);

  // Mutation para criar ativo
  const createAssetMutation = useMutation({
    mutationFn: async (data: AssetFormData) => {
      // Verificar unicidade antes de inserir
      if ("iccid" in data && data.iccid) {
        const { data: existingIccid, error } = await supabase
          .from("assets")
          .select("uuid")
          .eq("iccid", data.iccid)
          .maybeSingle();
          
        if (existingIccid) {
          throw new Error("ICCID já cadastrado no sistema");
        }
      }

      if ("serial_number" in data && data.serial_number) {
        const { data: existingSerial, error } = await supabase
          .from("assets")
          .select("uuid")
          .eq("serial_number", data.serial_number)
          .maybeSingle();
          
        if (existingSerial) {
          throw new Error("Número de série já cadastrado no sistema");
        }
      }

      // Inserir novo ativo
      const { data: newAsset, error } = await supabase
        .from("assets")
        .insert(data)
        .select()
        .single();
        
      if (error) throw error;
      return newAsset;
    },
    onSuccess: (newAsset) => {
      // Atualizar cache para evitar refetch
      queryClient.setQueryData(["assets"], (oldData: any[] = []) => {
        return [...oldData, newAsset];
      });
      
      // Invalidar queries existentes para forçar atualização
      queryClient.invalidateQueries({ queryKey: ["assets"], exact: false });
      
      toast.success(
        assetType === "CHIP"
          ? "Chip cadastrado com sucesso!"
          : "Speedy 5G cadastrado com sucesso!"
      );
      
      // Resetar o formulário
      if (assetType === "CHIP") {
        reset({
          type_id: 1, // Using number instead of string
          model: "NANOSIM",
        });
      } else {
        reset({
          type_id: 2, // Using number instead of string
          rented_days: 0 // This is a string in the form but transformed by zod
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar: ${error.message}`);
      
      // Focar no primeiro campo com erro
      const firstErrorField = Object.keys(form.formState.errors)[0];
      if (firstErrorField && form.getFieldState(firstErrorField as any).invalid) {
        setFocus(firstErrorField as any);
      }
    },
  });

  // Handle submit para qualquer tipo de ativo usando o schema discriminado
  const onSubmit: SubmitHandler<AssetFormData> = (data) => {
    createAssetMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Cadastrar Novo Ativo
        </h1>
        <p className="text-muted-foreground">
          Adicione chips e roteadores ao inventário
        </p>
      </div>

      <AssetTypeSelector 
        value={assetType} 
        onChange={setAssetType} 
      />

      <AssetFormCard
        assetType={assetType}
        form={form}
        onSubmit={onSubmit}
        isPending={createAssetMutation.isPending}
        typeId={typeId}
        manufacturers={manufacturers}
        plans={plans}
        assetStatus={assetStatus}
        assetSolutions={assetSolutions}
        loadingReferenceData={loadingReferenceData}
      />
    </div>
  );
}
