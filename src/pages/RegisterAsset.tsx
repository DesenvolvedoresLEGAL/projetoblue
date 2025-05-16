
import { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

// Schemas de validação
const chipSchema = z.object({
  type_id: z.number().default(1),
  line_number: z.string().optional().transform(val => val ? parseInt(val) : null),
  iccid: z.string()
    .min(19, "ICCID deve ter entre 19 e 20 dígitos")
    .max(20, "ICCID deve ter entre 19 e 20 dígitos")
    .regex(/^\d{19,20}$/, "ICCID deve conter apenas números"),
  model: z.string().default("NANOSIM"),
  plan_id: z.string().transform(val => val ? parseInt(val) : null),
  manufacturer_id: z.string().transform(val => val ? parseInt(val) : null),
  status_id: z.string().transform(val => parseInt(val)),
  notes: z.string().optional(),
});

const speedySchema = z.object({
  type_id: z.number().default(2),
  serial_number: z.string().optional(),
  model: z.string(),
  rented_days: z.string()
    .transform(val => val ? parseInt(val) : 0)
    .refine(val => val >= 0, "Dias alugados deve ser maior ou igual a 0"),
  radio: z.string().optional(),
  password: z.string().optional(),
  manufacturer_id: z.string().transform(val => val ? parseInt(val) : null),
  status_id: z.string().transform(val => parseInt(val)),
  solution_id: z.string().transform(val => val ? parseInt(val) : null),
  notes: z.string().optional(),
});

type AssetFormDataChip = z.infer<typeof chipSchema>;
type AssetFormDataSpeedy = z.infer<typeof speedySchema>;

export default function RegisterAsset() {
  const [assetType, setAssetType] = useState<"CHIP" | "SPEEDY">("CHIP");
  const queryClient = useQueryClient();

  // Formulários
  const chipForm = useForm<AssetFormDataChip>({
    resolver: zodResolver(chipSchema),
    defaultValues: {
      type_id: 1,
      model: "NANOSIM",
    },
  });

  const speedyForm = useForm<AssetFormDataSpeedy>({
    resolver: zodResolver(speedySchema),
    defaultValues: {
      type_id: 2,
      rented_days: 0,
    },
  });

  // Fetch dados de referência
  const { data: manufacturers, isLoading: loadingManufacturers } = useQuery({
    queryKey: ["manufacturers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("manufacturers").select("id, name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("id, nome, tamanho_gb");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: assetStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ["asset_status"],
    queryFn: async () => {
      const { data, error } = await supabase.from("asset_status").select("id, status");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: assetSolutions, isLoading: loadingSolutions } = useQuery({
    queryKey: ["asset_solutions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("asset_solutions").select("id, solution");
      if (error) throw error;
      return data || [];
    },
  });

  // Mutation para criar ativo
  const createAssetMutation = useMutation({
    mutationFn: async (data: AssetFormDataChip | AssetFormDataSpeedy) => {
      // Verificar unicidade antes de inserir
      if ("iccid" in data && data.iccid) {
        const { data: existingIccid } = await supabase
          .from("assets")
          .select("uuid")
          .eq("iccid", data.iccid)
          .single();
          
        if (existingIccid) {
          throw new Error("ICCID já cadastrado no sistema");
        }
      }

      if ("serial_number" in data && data.serial_number) {
        const { data: existingSerial } = await supabase
          .from("assets")
          .select("uuid")
          .eq("serial_number", data.serial_number)
          .single();
          
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
    onSuccess: () => {
      // Invalidar queries existentes para forçar atualização
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success(
        assetType === "CHIP"
          ? "Chip cadastrado com sucesso!"
          : "Speedy 5G cadastrado com sucesso!"
      );
      
      // Resetar o formulário
      if (assetType === "CHIP") {
        chipForm.reset({
          type_id: 1,
          model: "NANOSIM",
        });
      } else {
        speedyForm.reset({
          type_id: 2,
          rented_days: 0,
        });
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar: ${error.message}`);
    },
  });

  // Verificar se está carregando dados ou enviando formulário
  const isLoading = 
    loadingManufacturers || 
    loadingPlans || 
    loadingStatus || 
    loadingSolutions ||
    createAssetMutation.isPending;

  // Handle submit
  const onChipSubmit: SubmitHandler<AssetFormDataChip> = (data) => {
    createAssetMutation.mutate(data);
  };

  const onSpeedySubmit: SubmitHandler<AssetFormDataSpeedy> = (data) => {
    createAssetMutation.mutate(data);
  };

  // Componente para campos do Chip
  const ChipFields = () => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={chipForm.control}
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
            control={chipForm.control}
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
            control={chipForm.control}
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

          <FormField
            control={chipForm.control}
            name="manufacturer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fabricante *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fabricante" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {manufacturers?.map((manufacturer) => (
                      <SelectItem
                        key={manufacturer.id}
                        value={manufacturer.id.toString()}
                      >
                        {manufacturer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={chipForm.control}
            name="plan_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plano</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {plans?.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id.toString()}>
                        {plan.nome} {plan.tamanho_gb && `(${plan.tamanho_gb}GB)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={chipForm.control}
            name="status_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assetStatus?.map((status) => (
                      <SelectItem key={status.id} value={status.id.toString()}>
                        {status.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={chipForm.control}
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
            control={speedyForm.control}
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
            control={speedyForm.control}
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
            control={speedyForm.control}
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
            control={speedyForm.control}
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
            control={speedyForm.control}
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

          <FormField
            control={speedyForm.control}
            name="manufacturer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fabricante *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o fabricante" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {manufacturers?.map((manufacturer) => (
                      <SelectItem
                        key={manufacturer.id}
                        value={manufacturer.id.toString()}
                      >
                        {manufacturer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={speedyForm.control}
            name="solution_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Solução</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a solução" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assetSolutions?.map((solution) => (
                      <SelectItem key={solution.id} value={solution.id.toString()}>
                        {solution.solution}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={speedyForm.control}
            name="status_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assetStatus?.map((status) => (
                      <SelectItem key={status.id} value={status.id.toString()}>
                        {status.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={speedyForm.control}
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
          {assetType === "CHIP" ? (
            <Form {...chipForm}>
              <form
                onSubmit={chipForm.handleSubmit(onChipSubmit)}
                className="space-y-8"
              >
                <ChipFields />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      "Cadastrar Chip"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <Form {...speedyForm}>
              <form
                onSubmit={speedyForm.handleSubmit(onSpeedySubmit)}
                className="space-y-8"
              >
                <SpeedyFields />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      "Cadastrar Speedy 5G"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
