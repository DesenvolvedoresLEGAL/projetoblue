import { useState } from "react";
import { useQuery, useQueryClient, useMutation, useQueries } from "@tanstack/react-query";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { toast } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { checkPasswordStrength } from "@/utils/passwordStrength";
import referenceDataService from "@/services/api/referenceDataService";
import { SolutionType } from "@/types/asset";

// Custom hook for fetching reference data
const useReferenceData = () => {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['manufacturers'],
        queryFn: referenceDataService.getManufacturers,
        placeholderData: [],
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      {
        queryKey: ['assetSolutions'],
        queryFn: referenceDataService.getAssetSolutions,
        placeholderData: [],
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['assetStatus'],
        queryFn: referenceDataService.getStatusRecords,
        placeholderData: [],
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['assetTypes'],
        queryFn: referenceDataService.getAssetTypes,
        placeholderData: [],
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: ['plans'],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('plans')
            .select('id, nome')
            .order('nome', { ascending: true });
            
          if (error) throw error;
          return data || [];
        },
        placeholderData: [],
        staleTime: 5 * 60 * 1000,
      }
    ]
  });

  const [manufacturersQuery, solutionsQuery, statusQuery, typesQuery, plansQuery] = queries;

  // Sort data alphabetically where applicable
  const manufacturers = manufacturersQuery.data?.sort((a, b) => a.name.localeCompare(b.name)) || [];
  // Filter operators (carriers) from manufacturers - IDs 13, 14, 15
  const operators = manufacturers.filter(m => [13, 14, 15].includes(m.id)) || [];
  const solutions = solutionsQuery.data?.sort((a, b) => a.solution.localeCompare(b.solution)) || [];
  const statuses = statusQuery.data?.sort((a, b) => a.nome.localeCompare(b.nome)) || [];
  const types = typesQuery.data || [];
  const plans = plansQuery.data || [];

  const isLoading = queries.some(query => query.isLoading);
  const isError = queries.some(query => query.isError);
  
  return {
    manufacturers,
    operators,
    solutions,
    statuses,
    types,
    plans,
    isLoading,
    isError
  };
};

// Reusable SelectField component
const SelectField = ({ 
  control, 
  name, 
  label, 
  placeholder, 
  options,
  isLoading = false,
  isRequired = false,
  disabled = false
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>{label}{isRequired && ' *'}</FormLabel>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={field.value?.toString() || ""}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {label != "Plano" && label != "Solução" ? option.label.capitalize() : option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

// Define Zod schemas with proper discriminated union
// Base schema with common fields
const baseSchema = z.object({
  status_id: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().nullable().default(1) // Default to first status (usually "Disponível")
  )
});

// Base schema for routers which includes solution_id
const routerBaseSchema = baseSchema.extend({
  solution_id: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().nullable()
  ),
});

// Chip type schema (does not include solution_id)
const chipSchema = baseSchema.extend({
  type_id: z.literal(11), // Chip type updated to 11
  iccid: z.string()
    .min(1, "ICCID é obrigatório")
    .regex(/^\d{19,20}$/, { message: "ICCID deve ter 19-20 dígitos" })
    .optional()
    .or(z.string().min(1, "ICCID é obrigatório")),
  line_number: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().nullable()
  ),
  manufacturer_id: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().min(1, "Operadora é obrigatória")
  ),
  plan_id: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().min(1, "Plano é obrigatório")
  ),
});

// Router type schema (includes solution_id)
const routerSchema = routerBaseSchema.extend({
  type_id: z.literal(2), // Router type
  serial_number: z.string().min(1, "Número de série é obrigatório"),
  manufacturer_id: z.preprocess(
    val => val === "" || isNaN(Number(val)) ? null : Number(val),
    z.number().min(1, "Marca é obrigatória")
  ),
  model: z.string().min(1, "Modelo é obrigatório"),
  password: z.string().optional(),
  radio: z.string().optional(),
});

// Combined discriminated union schema
const assetSchema = z.discriminatedUnion("type_id", [chipSchema, routerSchema]);

// Define TypeScript types from schemas
type ChipFormValues = z.infer<typeof chipSchema>;
type RouterFormValues = z.infer<typeof routerSchema>;
type AssetFormValues = z.infer<typeof assetSchema>;

// Main component
export default function RegisterAsset() {
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [allowWeakPassword, setAllowWeakPassword] = useState(false);
  
  // Use the custom hook to fetch reference data
  const { 
    manufacturers, 
    operators,
    solutions, 
    statuses, 
    types,
    plans,
    isLoading: isReferenceDataLoading
  } = useReferenceData();
  
  const queryClient = useQueryClient();

  // Set up the form with zod resolver
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      type_id: 11 as const, // Use literal type, updated to 11
      status_id: 1, // Default to Available
      iccid: "",
      line_number: null,
      manufacturer_id: null,
      plan_id: null,
    } as AssetFormValues
  };
  
  const assetType = form.watch("type_id");
  const password = form.watch("password");
  
  // Handle password strength checking
  const handlePasswordChange = (value: string) => {
    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);
    form.setValue("password", value);
  };
  
  // Mutation for creating an asset
  const createAssetMutation = useMutation({
    mutationFn: async (data: AssetFormValues) => {
      // Check if ICCID already exists for chip
      if (data.type_id === 1 && data.iccid) {
        const { data: existingChip, error: chipError } = await supabase
          .from('assets')
          .select('uuid')
          .eq('iccid', data.iccid)
          .maybeSingle();
          
        if (chipError && chipError.code !== 'PGRST116') {
          throw new Error(`Erro ao verificar ICCID: ${chipError.message}`);
        }
        
        if (existingChip) {
          throw new Error(`ICCID ${data.iccid} já está cadastrado no sistema.`);
        }
      }
      
      // Check if serial_number already exists for router
      if (data.type_id === 2 && "serial_number" in data) {
        const { data: existingRouter, error: routerError } = await supabase
          .from('assets')
          .select('uuid')
          .eq('serial_number', data.serial_number)
          .maybeSingle();
          
        if (routerError && routerError.code !== 'PGRST116') {
          throw new Error(`Erro ao verificar número de série: ${routerError.message}`);
        }
        
        if (existingRouter) {
          throw new Error(`Número de série ${data.serial_number} já está cadastrado no sistema.`);
        }
      }
      
      // Prepare data for insertion
      let insertData: Record<string, any> = {
        type_id: data.type_id,
        status_id: data.status_id
      };
      
      // Add type-specific fields based on asset type
      if (data.type_id === 1) {
        // Chip specific fields (no solution_id)
        insertData = {
          ...insertData,
          iccid: data.iccid,
          line_number: data.line_number,
          manufacturer_id: data.manufacturer_id, // This is the carrier/operator
          plan_id: data.plan_id,
        };
      } else if (data.type_id === 2 && "serial_number" in data) {
        // Router specific fields (including solution_id)
        insertData = {
          ...insertData,
          serial_number: data.serial_number,
          manufacturer_id: data.manufacturer_id,
          model: data.model,
          password: data.password,
          radio: data.radio,
          solution_id: data.solution_id,
        };
      }
      
      // Insert the asset
      const { data: newAsset, error } = await supabase
        .from('assets')
        .insert(insertData)
        .select();
        
      if (error) {
        throw new Error(`Erro ao cadastrar ativo: ${error.message}`);
      }
      
      return newAsset[0];
    },
    onSuccess: (newAsset) => {
      // Update the cache with the new asset
      queryClient.setQueryData(["assets"], (oldData: any[] | undefined) => [
        ...(oldData || []),
        newAsset
      ]);
      
      // Invalidate relevant queries for refetching
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      
      // Reset the form and show success message
      form.reset();
      setPasswordStrength(null);
      setAllowWeakPassword(false);
      
      toast.success("Ativo cadastrado com sucesso!");
    },
    onError: (error: Error) => {
      // Show error message
      toast.error(error.message);
      
      // Focus the first invalid field
      const fields = form.getFieldState(assetType === 1 ? "iccid" : "serial_number");
      if (fields.invalid) {
        document.getElementById(assetType === 1 ? "iccid" : "serial_number")?.focus();
      }
    }
  });
  
  // Handle form submission
  const onSubmit = (formData: AssetFormValues) => {
    // Ensure the type_id is the correct literal type
    if (formData.type_id !== 11 && formData.type_id !== 2) {
      toast.error("Tipo de ativo inválido");
      return;
    }

    // Validate password strength if it's a router and password is provided
    if (formData.type_id === 2 && "password" in formData && formData.password && passwordStrength === 'weak' && !allowWeakPassword) {
      toast.error("Por favor, use uma senha mais forte ou confirme o uso de senha fraca.");
      return;
    }
    
    createAssetMutation.mutate(formData);
  };

  // Map options for select fields
  const solutionOptions = solutions.map(item => ({
    value: item.id,
    label: item.solution
  }));
  
  const manufacturerOptions = manufacturers.map(item => ({
    value: item.id,
    label: item.name
  }));
  
  const operatorOptions = operators.map(item => ({
    value: item.id,
    label: item.name
  }));
  
  const statusOptions = statuses.map(item => ({
    value: item.id,
    label: item.nome
  }));
  
  const planOptions = plans.map(item => ({
    value: item.id,
    label: item.nome
  }));

  // Render the password strength indicator
  const renderPasswordStrength = () => {
    if (!passwordStrength) return null;

    if (passwordStrength === 'strong') {
      return <div className="text-green-600 text-sm mt-1">Senha forte</div>;
    } else if (passwordStrength === 'medium') {
      return <div className="text-amber-600 text-sm mt-1">Senha média</div>;
    } else {
      return (
        <div className="text-orange-500 text-sm mt-1 flex items-center">
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span>Senha fraca</span>
          <div className="ml-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={allowWeakPassword}
                onChange={(e) => setAllowWeakPassword(e.target.checked)}
                className="mr-2"
              />
              Permitir uso de senha fraca
            </label>
          </div>
        </div>
      );
    }
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
          <CardTitle>Detalhes do Ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs
                value={assetType === 11 ? "CHIP" : "ROTEADOR"}
                onValueChange={(value) => {
                  // When changing tab, reset the form for the new type
                  const newTypeId = value === "CHIP" ? 11 : 2;
                  
                  // Need to type cast as const to match the literal type
                  form.setValue("type_id", newTypeId as 11 | 2);
                  
                  // Reset form values that are specific to the other type
                  if (value === "CHIP") {
                    form.setValue("serial_number", "" as any);
                    form.setValue("model", "" as any);
                    form.setValue("password", "" as any);
                    form.setValue("radio", "" as any);
                    // Also reset solution_id when switching to CHIP since we don't want it there
                    form.setValue("solution_id", null as any);
                  } else {
                    form.setValue("iccid", "");
                    form.setValue("line_number", null);
                    form.setValue("plan_id", null);
                  }
                  
                  // Reset manufacturer_id in both cases
                  form.setValue("manufacturer_id", null);
                }}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-8">
                  <TabsTrigger value="CHIP">Chip</TabsTrigger>
                  <TabsTrigger value="ROTEADOR">Roteador</TabsTrigger>
                </TabsList>

                {/* CHIP FORM */}
                <TabsContent value="CHIP" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="iccid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ICCID *</FormLabel>
                          <FormControl>
                            <Input
                              id="iccid"
                              placeholder="Ex: 89550421180216543847"
                              disabled={createAssetMutation.isPending}
                              {...field}
                            />
                          </FormControl>
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
                              id="line_number"
                              type="number"
                              placeholder="Número da linha"
                              disabled={createAssetMutation.isPending}
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === "" ? null : parseInt(value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <SelectField
                      control={form.control}
                      name="manufacturer_id"
                      label="Operadora"
                      placeholder="Selecione a operadora"
                      options={operatorOptions}
                      isLoading={isReferenceDataLoading}
                      isRequired={true}
                      disabled={createAssetMutation.isPending}
                    />

                    <SelectField
                      control={form.control}
                      name="plan_id"
                      label="Plano"
                      placeholder="Selecione o plano"
                      options={planOptions}
                      isLoading={isReferenceDataLoading}
                      isRequired={true}
                      disabled={createAssetMutation.isPending}
                    />

                    {/* Removed Solution field from Chip form */}

                    <SelectField
                      control={form.control}
                      name="status_id"
                      label="Status"
                      placeholder="Selecione o status"
                      options={statusOptions}
                      isLoading={isReferenceDataLoading}
                      isRequired={true}
                      disabled={createAssetMutation.isPending}
                    />
                  </div>
                </TabsContent>

                {/* ROUTER FORM */}
                <TabsContent value="ROTEADOR" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="serial_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Série *</FormLabel>
                          <FormControl>
                            <Input
                              id="serial_number"
                              placeholder="Ex: SN123456789"
                              disabled={createAssetMutation.isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <SelectField
                      control={form.control}
                      name="manufacturer_id"
                      label="Marca"
                      placeholder="Selecione a marca"
                      options={manufacturerOptions}
                      isLoading={isReferenceDataLoading}
                      isRequired={true}
                      disabled={createAssetMutation.isPending}
                    />

                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo *</FormLabel>
                          <FormControl>
                            <Input
                              id="model"
                              placeholder="Ex: Archer C6"
                              disabled={createAssetMutation.isPending}
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
                            <PasswordInput
                              id="password"
                              value={field.value || ""}
                              onChange={(e) => handlePasswordChange(e.target.value)}
                              placeholder="Senha da rede Wi-Fi"
                              disabled={createAssetMutation.isPending}
                            />
                          </FormControl>
                          {renderPasswordStrength()}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="radio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Radio</FormLabel>
                          <FormControl>
                            <Input
                              id="radio"
                              placeholder="Configuração de rádio"
                              disabled={createAssetMutation.isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <SelectField
                      control={form.control}
                      name="solution_id"
                      label="Solução"
                      placeholder="Selecione a solução"
                      options={solutionOptions}
                      isLoading={isReferenceDataLoading}
                      disabled={createAssetMutation.isPending}
                    />

                    <SelectField
                      control={form.control}
                      name="status_id"
                      label="Status"
                      placeholder="Selecione o status"
                      options={statusOptions}
                      isLoading={isReferenceDataLoading}
                      isRequired={true}
                      disabled={createAssetMutation.isPending}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={createAssetMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {createAssetMutation.isPending ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
