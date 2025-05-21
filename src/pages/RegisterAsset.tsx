
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { checkPasswordStrength } from "@/utils/passwordStrength";
import { AssetFormValues, assetSchema } from "@/schemas/assetSchemas";
import { 
  useAssetStatuses,
  useManufacturers,
  useAssetSolutions,
  usePlans,
  useCreateAsset,
  useCheckAssetExists
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

// Main component
export default function RegisterAsset() {
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [allowWeakPassword, setAllowWeakPassword] = useState(false);
  
  // Fetch reference data using React Query hooks
  const { data: statuses = [], isLoading: statusesLoading } = useAssetStatuses();
  const { data: manufacturers = [], isLoading: manufacturersLoading } = useManufacturers();
  const { data: solutions = [], isLoading: solutionsLoading } = useAssetSolutions();
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  
  // Create asset mutation
  const createAssetMutation = useCreateAsset();

  // Set up the form with zod resolver using our updated schema
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      solution_id: 1,
      status_id: 1, // Default to Available
      manufacturer_id: null,
      notes: "",
      // Chip specific fields with empty defaults
      iccid: "",
      line_number: null,
      plan_id: null,
      // Equipment specific fields with empty defaults
      serial_number: "",
      model: "",
      admin_user: "admin",
      admin_pass: "",
      ssid: "",
      password: ""
    }
  });
  
  const solutionId = form.watch("solution_id");
  const password = form.watch("password");
  const iccid = form.watch("iccid");
  const serialNumber = form.watch("serial_number");
  
  // Check if asset already exists
  const isChip = solutionId === 1 || solutionId === 11;
  const { data: iccidExists } = useCheckAssetExists('iccid', iccid || "");
  const { data: serialExists } = useCheckAssetExists('serial_number', serialNumber || "");
  
  // Handle password strength checking
  const handlePasswordChange = (value: string) => {
    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);
    form.setValue("password", value);
  };
  
  // Handle form submission
  const onSubmit = (formData: AssetFormValues) => {
    // Check for existing assets first
    if (isChip && iccidExists?.exists) {
      form.setError("iccid", { message: "Este ICCID já está cadastrado no sistema" });
      return;
    }
    
    if (!isChip && serialExists?.exists) {
      form.setError("serial_number", { message: "Este número de série já está cadastrado no sistema" });
      return;
    }
    
    // Validate password strength if it's equipment and password is provided
    if (!isChip && password && passwordStrength === 'weak' && !allowWeakPassword) {
      form.setError("password", { 
        message: "Por favor, use uma senha mais forte ou confirme o uso de senha fraca." 
      });
      return;
    }
    
    createAssetMutation.mutate(formData);
  };

  // Filter manufacturers - only show operators for chips
  const filteredManufacturers = isChip
    ? manufacturers.filter(m => ['CLARO', 'VIVO', 'TIM', 'OI'].includes(m.name?.toUpperCase()))
    : manufacturers;
  
  // Map options for select fields
  const solutionOptions = solutions.map(item => ({
    value: item.id,
    label: item.solution
  }));
  
  const manufacturerOptions = filteredManufacturers.map(item => ({
    value: item.id,
    label: item.name
  }));
  
  const statusOptions = statuses.map(item => ({
    value: item.id,
    label: item.status
  }));
  
  const planOptions = plans.map(item => ({
    value: item.id,
    label: item.nome
  }));

  // Render the password strength indicator
  const renderPasswordStrength = () => {
    if (!passwordStrength || !password) return null;

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
          Adicione chips e equipamentos ao inventário
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
                value={isChip ? "CHIP" : "EQUIPAMENTO"}
                onValueChange={(value) => {
                  const chipSolutionId = solutions.find(s => s.solution?.toUpperCase() === "CHIP")?.id || 1;
                  const equipmentSolutionId = solutions.find(s => 
                    s.solution?.toUpperCase() !== "CHIP" && s.id !== chipSolutionId
                  )?.id || 2;
                  
                  // When changing tab, reset the form for the new type
                  const newSolutionId = value === "CHIP" ? chipSolutionId : equipmentSolutionId;
                  
                  // Update the solution ID first
                  form.setValue("solution_id", newSolutionId);
                  
                  // Reset form values that are specific to the new type
                  if (value === "CHIP") {
                    // Clear equipment specific fields
                    form.setValue("serial_number", "");
                    form.setValue("model", "");
                    form.setValue("radio", "");
                    form.setValue("admin_user", "admin");
                    form.setValue("admin_pass", "");
                    form.setValue("ssid", "");
                    form.setValue("password", "");
                    
                    // Set required fields for chip
                    form.setValue("iccid", "");
                    form.setValue("line_number", null);
                    form.setValue("plan_id", null);
                  } else {
                    // Clear chip specific fields
                    form.setValue("iccid", "");
                    form.setValue("line_number", null);
                    form.setValue("plan_id", null);
                    
                    // Set required fields for equipment
                    form.setValue("serial_number", "");
                    form.setValue("model", "");
                  }
                  
                  // Reset manufacturer_id in both cases
                  form.setValue("manufacturer_id", null);
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
                      options={manufacturerOptions}
                      isLoading={manufacturersLoading}
                      isRequired={true}
                      disabled={createAssetMutation.isPending}
                    />

                    <SelectField
                      control={form.control}
                      name="plan_id"
                      label="Plano"
                      placeholder="Selecione o plano"
                      options={planOptions}
                      isLoading={plansLoading}
                      isRequired={true}
                      disabled={createAssetMutation.isPending}
                    />

                    <SelectField
                      control={form.control}
                      name="status_id"
                      label="Status"
                      placeholder="Selecione o status"
                      options={statusOptions}
                      isLoading={statusesLoading}
                      disabled={createAssetMutation.isPending}
                    />
                    
                    {/* New notes field for CHIP */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea
                              id="notes"
                              placeholder="Observações adicionais sobre o chip"
                              disabled={createAssetMutation.isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* EQUIPMENT FORM (previously ROUTER) */}
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
                      label="Fabricante"
                      placeholder="Selecione o fabricante"
                      options={manufacturerOptions}
                      isLoading={manufacturersLoading}
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
                      isLoading={statusesLoading}
                      disabled={createAssetMutation.isPending}
                    />
                    
                    {/* New fields for EQUIPMENT */}
                    <FormField
                      control={form.control}
                      name="admin_user"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuário Admin</FormLabel>
                          <FormControl>
                            <Input
                              id="admin_user"
                              placeholder="Ex: admin"
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
                          <FormLabel>Senha Admin</FormLabel>
                          <FormControl>
                            <PasswordInput
                              id="admin_pass"
                              placeholder="Senha de administrador"
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
                      name="ssid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SSID</FormLabel>
                          <FormControl>
                            <Input
                              id="ssid"
                              placeholder="Nome da rede Wi-Fi"
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
                          <FormLabel>Senha da Rede</FormLabel>
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
                    
                    {/* Notes field for EQUIPMENT */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea
                              id="notes"
                              placeholder="Observações adicionais sobre o equipamento"
                              disabled={createAssetMutation.isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
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
