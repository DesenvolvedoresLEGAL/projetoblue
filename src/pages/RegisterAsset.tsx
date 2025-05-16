
import { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/utils/toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Hook para buscar todos os dados de referência de uma vez
function useReferenceData() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["manufacturers"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("manufacturers")
            .select("id, name")
            .order("name");
          if (error) throw error;
          return data || [];
        },
        placeholderData: [],
      },
      {
        queryKey: ["plans"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("plans")
            .select("id, nome, tamanho_gb")
            .order("nome");
          if (error) throw error;
          return data || [];
        },
        placeholderData: [],
      },
      {
        queryKey: ["asset_status"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("asset_status")
            .select("id, status")
            .order("status");
          if (error) throw error;
          return data || [];
        },
        placeholderData: [],
      },
      {
        queryKey: ["asset_solutions"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("asset_solutions")
            .select("id, solution")
            .order("solution");
          if (error) throw error;
          return data || [];
        },
        placeholderData: [],
      },
    ],
  });

  return {
    manufacturers: results[0].data || [],
    plans: results[1].data || [],
    assetStatus: results[2].data || [],
    assetSolutions: results[3].data || [],
    isLoading: results.some(result => result.isLoading),
  };
}

// Componente reutilizável para campos de select
interface SelectFieldProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  options: Array<{ id: number; name: string }>;
  disabled?: boolean;
  required?: boolean;
}

const SelectField = ({
  control,
  name,
  label,
  placeholder = "Selecione uma opção",
  description,
  options,
  disabled = false,
  required = false,
}: SelectFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{required && " *"}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value?.toString() || ""}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id.toString()}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

// Schema comum para transformação de dados
const transformStringToNumber = (val: string | null | undefined) => {
  if (val === null || val === undefined || val === "") return null;
  const num = parseInt(val);
  return isNaN(num) ? null : num;
};

// Schemas de validação refinados
const chipSchema = z.object({
  type_id: z.literal(1),
  line_number: z.string()
    .optional()
    .transform(val => val ? parseInt(val) : null)
    .refine(val => val === null || !isNaN(Number(val)), "Número da linha deve ser um número válido"),
  iccid: z.string()
    .min(19, "ICCID deve ter entre 19 e 20 dígitos")
    .max(20, "ICCID deve ter entre 19 e 20 dígitos")
    .regex(/^\d{19,20}$/, "ICCID deve conter apenas números"),
  model: z.string().default("NANOSIM"),
  plan_id: z.string()
    .optional()
    .transform(transformStringToNumber),
  manufacturer_id: z.string()
    .transform(transformStringToNumber)
    .refine(val => val !== null, "Fabricante é obrigatório"),
  status_id: z.string()
    .transform(transformStringToNumber)
    .refine(val => val !== null, "Status é obrigatório"),
  notes: z.string().optional(),
});

const speedySchema = z.object({
  type_id: z.literal(2),
  serial_number: z.string().optional(),
  model: z.string().min(1, "Modelo é obrigatório"),
  rented_days: z.string()
    .transform(val => val && val.trim() !== "" ? parseInt(val) : 0)
    .refine(val => !isNaN(val) && val >= 0, "Dias alugados deve ser maior ou igual a 0"),
  radio: z.string().optional(),
  password: z.string().optional(),
  manufacturer_id: z.string()
    .transform(transformStringToNumber)
    .refine(val => val !== null, "Fabricante é obrigatório"),
  status_id: z.string()
    .transform(transformStringToNumber)
    .refine(val => val !== null, "Status é obrigatório"),
  solution_id: z.string()
    .optional()
    .transform(transformStringToNumber),
  notes: z.string().optional(),
});

// Schema discriminado usando type_id como discriminator
const assetSchema = z.discriminatedUnion("type_id", [chipSchema, speedySchema]);

type AssetFormData = z.infer<typeof assetSchema>;

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

  const { watch, reset } = form;
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
      if (firstErrorField && form.getFieldState(firstErrorField).invalid) {
        form.setFocus(firstErrorField as never);
      }
    },
  });

  // Verificar se está carregando dados ou enviando formulário
  const isLoading = loadingReferenceData || createAssetMutation.isPending;

  // Handle submit para qualquer tipo de ativo usando o schema discriminado
  const onSubmit: SubmitHandler<AssetFormData> = (data) => {
    createAssetMutation.mutate(data);
  };

  // Componente para campos do Chip
  const ChipFields = () => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="iccid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ICCID *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: 89550421180216543847"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Número de 19 ou 20 dígitos do chip
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="line_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da Linha</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 11999999999"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Número da linha associada ao chip (opcional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input value="NANOSIM" disabled {...field} />
                </FormControl>
                <FormDescription>Modelo fixo para chips</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {loadingReferenceData ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <SelectField
              control={form.control}
              name="manufacturer_id"
              label="Fabricante"
              placeholder="Selecione o fabricante"
              options={manufacturers.map(m => ({ id: m.id, name: m.name }))}
              disabled={createAssetMutation.isPending}
              required
            />
          )}

          {loadingReferenceData ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <SelectField
              control={form.control}
              name="plan_id"
              label="Plano"
              placeholder="Selecione o plano"
              options={plans.map(p => ({ id: p.id, name: `${p.nome} ${p.tamanho_gb ? `(${p.tamanho_gb}GB)` : ''}` }))}
              disabled={createAssetMutation.isPending}
            />
          )}

          {loadingReferenceData ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <SelectField
              control={form.control}
              name="status_id"
              label="Status"
              placeholder="Selecione o status"
              options={assetStatus.map(s => ({ id: s.id, name: s.status }))}
              disabled={createAssetMutation.isPending}
              required
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Informações adicionais sobre o chip"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );
  };

  // Componente para campos do Speedy 5G (Roteador)
  const SpeedyFields = () => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Archer C6"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Modelo do roteador</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serial_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Série</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: SN123456789"
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Número de série do roteador (opcional)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rented_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dias Alugados</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Ex: 0"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Total de dias alugados (mínimo 0)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="radio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rádio</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Configuração de rádio"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Senha do roteador"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {loadingReferenceData ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <SelectField
              control={form.control}
              name="manufacturer_id"
              label="Fabricante"
              placeholder="Selecione o fabricante"
              options={manufacturers.map(m => ({ id: m.id, name: m.name }))}
              disabled={createAssetMutation.isPending}
              required
            />
          )}

          {loadingReferenceData ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <SelectField
              control={form.control}
              name="solution_id"
              label="Solução"
              placeholder="Selecione a solução"
              options={assetSolutions.map(s => ({ id: s.id, name: s.solution }))}
              disabled={createAssetMutation.isPending}
            />
          )}

          {loadingReferenceData ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <SelectField
              control={form.control}
              name="status_id"
              label="Status"
              placeholder="Selecione o status"
              options={assetStatus.map(s => ({ id: s.id, name: s.status }))}
              disabled={createAssetMutation.isPending}
              required
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Informações adicionais sobre o roteador"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );
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
              {typeId === 1 ? <ChipFields /> : <SpeedyFields />}
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
