import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { checkPasswordStrength } from "@/utils/passwordStrength";
import { assetSchema, AssetFormValues } from "@/schemas/assetSchemas";
import { 
  useCreateAsset,
  useManufacturers,
  useAssetSolutions,
  useStatusRecords,
  usePlans
} from "@/hooks/useAssetManagement";

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
              onValueChange={(value) => field.onChange(Number(value))}
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
                    {option.label}
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

// Main component
export default function RegisterAsset() {
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [allowWeakPassword, setAllowWeakPassword] = useState(false);
  
  // Fetch reference data using custom hooks
  const { data: manufacturers = [], isLoading: isManufacturersLoading } = useManufacturers();
  const { data: solutions = [], isLoading: isSolutionsLoading } = useAssetSolutions();
  const { data: statuses = [], isLoading: isStatusesLoading } = useStatusRecords();
  const { data: plans = [], isLoading: isPlansLoading } = usePlans();
  
  const isReferenceDataLoading = isManufacturersLoading || isSolutionsLoading || 
                                isStatusesLoading || isPlansLoading;
  
  // Filter operators (carriers) from manufacturers - IDs 13, 14, 15
  const operators = manufacturers.filter(m => [13, 14, 15].includes(m.id)) || [];
  
  // Set up the form with zod resolver
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      solution_id: 1,
      status_id: 1,
      manufacturer_id: undefined,
      iccid: "",
      line_number: undefined,
      plan_id: undefined,
      serial_number: "",
      model: "",
      radio: "",
      admin_user: "admin",
      admin_pass: ""
    }
  });
  
  const createAssetMutation = useCreateAsset();
  const solutionId = form.watch("solution_id");
  const password = form.watch("admin_pass");
  
  // Handle password strength checking
  const handlePasswordChange = (value: string) => {
    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);
    form.setValue("admin_pass", value);
  };
  
  // Handle form submission
  const onSubmit = (formData: AssetFormValues) => {
    // Check password strength for routers
    if (formData.solution_id === 2 && formData.admin_pass && 
        passwordStrength === 'weak' && !allowWeakPassword) {
      form.setError("admin_pass", {
        type: "manual",
        message: "Please use a stronger password or confirm the use of a weak password."
      });
      return;
    }
    
    // Prepare data with correct types for database
    const createData = {
      ...formData,
      type: formData.solution_id === 11 ? 'CHIP' as const : 'ROTEADOR' as const,
      // Ensure line_number is number or undefined
      line_number: formData.line_number ? Number(formData.line_number) : undefined
    };
    
    createAssetMutation.mutate(createData);
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
    label: item.nome // Use 'nome' instead of 'status'
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
                value={solutionId === 11 ? "CHIP" : "EQUIPAMENTO"}
                onValueChange={(value) => {
                  // When changing tab, reset the form for the new type
                  const newSolutionId = value === "CHIP" ? 11 : 2;
                  form.setValue("solution_id", newSolutionId);
                  
                  // Reset form values that are specific to the other type
                  if (value === "CHIP") {
                    form.setValue("serial_number", "");
                    form.setValue("model", "");
                    form.setValue("admin_pass", "");
                    form.setValue("radio", "");
                    setPasswordStrength(null);
                  } else {
                    form.setValue("iccid", "");
                    form.setValue("line_number", undefined);
                    form.setValue("plan_id", undefined);
                  }
                  
                  // Reset manufacturer_id in both cases
                  form.setValue("manufacturer_id", undefined);
                }}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-8">
                  <TabsTrigger value="CHIP">Chip</TabsTrigger>
                  <TabsTrigger value="EQUIPAMENTO">Equipamento</TabsTrigger>
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
                                // Convert to number or undefined
                                field.onChange(value === "" ? undefined : Number(value));
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
                <TabsContent value="EQUIPAMENTO" className="space-y-6">
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
                      name="admin_pass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <PasswordInput
                              id="admin_pass"
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
