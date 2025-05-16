
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader } from "lucide-react";

// Import custom hooks and components
import { useReferenceData } from "@/hooks/useReferenceData";
import { ChipFields } from "@/components/assets/ChipFields";
import { SpeedyFields } from "@/components/assets/SpeedyFields";
import { AssetFormData, assetSchema } from "@/components/assets/AssetSchemas";

export default function RegisterAsset() {
  const [assetType, setAssetType] = useState<"CHIP" | "SPEEDY">("CHIP");
  const queryClient = useQueryClient();
  
  // Carregar dados de referência com o hook personalizado
  const { manufacturers, plans, assetStatus, assetSolutions, isLoading: loadingReferenceData } = useReferenceData();

  // Formulário unificado com discriminated union schema
  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      type_id: 1,
      model: "NANOSIM",
    },
  });

  const { watch, reset, setFocus } = form;
  const typeId = watch("type_id");

  // Efeito para redefinir o formulário quando o tipo de ativo muda
  useEffect(() => {
    if (assetType === "CHIP") {
      reset({
        type_id: 1,
        model: "NANOSIM",
      });
    } else {
      reset({
        type_id: 2,
        rented_days: "0",
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
          type_id: 1,
          model: "NANOSIM",
        });
      } else {
        reset({
          type_id: 2,
          rented_days: "0",
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar: ${error.message}`);
      
      // Focar no primeiro campo com erro
      const firstErrorField = Object.keys(form.formState.errors)[0];
      if (firstErrorField && form.getFieldState(firstErrorField as keyof AssetFormData).invalid) {
        setFocus(firstErrorField as keyof AssetFormData);
      }
    },
  });

  // Verificar se está carregando dados ou enviando formulário
  const isLoading = loadingReferenceData || createAssetMutation.isPending;

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

      <Card>
        <CardHeader>
          <CardTitle>Tipo de Ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            className="flex flex-col md:flex-row gap-4 mb-8"
            value={assetType}
            onValueChange={(v) => setAssetType(v as "CHIP" | "SPEEDY")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CHIP" id="chip" />
              <Label htmlFor="chip">Chip</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SPEEDY" id="speedy" />
              <Label htmlFor="speedy">Speedy 5G (Roteador)</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {assetType === "CHIP" ? "Detalhes do Chip" : "Detalhes do Speedy 5G"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              {typeId === 1 ? (
                <ChipFields 
                  control={form.control}
                  loadingReferenceData={loadingReferenceData}
                  manufacturers={manufacturers}
                  plans={plans}
                  assetStatus={assetStatus}
                  isPending={createAssetMutation.isPending}
                />
              ) : (
                <SpeedyFields 
                  control={form.control}
                  loadingReferenceData={loadingReferenceData}
                  manufacturers={manufacturers}
                  assetSolutions={assetSolutions}
                  assetStatus={assetStatus}
                  isPending={createAssetMutation.isPending}
                />
              )}
              <div className="flex justify-end">
                <Button type="submit" disabled={createAssetMutation.isPending}>
                  {createAssetMutation.isPending ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    `Cadastrar ${assetType === "CHIP" ? "Chip" : "Speedy 5G"}`
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
