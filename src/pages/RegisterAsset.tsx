
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { checkPasswordStrength } from "@/utils/passwordStrength";
import {
  useCreateAsset,
  useManufacturers,
  useAssetSolutions,
  useStatusRecords
} from "@/hooks/useAssetManagement";
import { useNavigate } from "react-router-dom";

// Esquemas de validação separados para CHIPS e EQUIPAMENTOS
const chipSchema = z.object({
  line_number: z.number().min(1, "Número da linha é obrigatório"),
  iccid: z.string().min(1, "ICCID é obrigatório"),
  manufacturer_id: z.number().min(1, "Operadora é obrigatória"),
  status_id: z.number().min(1, "Status é obrigatório"),
});

const equipmentSchema = z.object({
  serial_number: z.string().min(1, "Número de série é obrigatório"),
  model: z.string().min(1, "Modelo é obrigatório"),
  rented_days: z.number().min(0, "Dias alugada deve ser 0 ou maior"),
  radio: z.string().min(1, "Rádio é obrigatório"),
  status_id: z.number().min(1, "Status é obrigatório"),
  manufacturer_id: z.number().min(1, "Fabricante é obrigatório"),
  solution_id: z.number().min(1, "Solução é obrigatória"),
  admin_user: z.string().min(1, "Usuário admin é obrigatório"),
  admin_pass: z.string().min(1, "Senha admin é obrigatória"),
});

type ChipFormValues = z.infer<typeof chipSchema>;
type EquipmentFormValues = z.infer<typeof equipmentSchema>;

// Função para capitalizar texto
const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export default function RegisterAsset() {
  const [assetType, setAssetType] = useState<'CHIP' | 'EQUIPAMENTO'>('CHIP');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [allowWeakPassword, setAllowWeakPassword] = useState(false);

  const navigate = useNavigate();

  // Hooks para buscar dados de referência
  const { data: manufacturers = [], isLoading: isManufacturersLoading } = useManufacturers();
  const { data: solutions = [], isLoading: isSolutionsLoading } = useAssetSolutions();
  const { data: statuses = [], isLoading: isStatusesLoading } = useStatusRecords();

  const isReferenceDataLoading = isManufacturersLoading || isSolutionsLoading || isStatusesLoading;

  // Separar operadoras (para chips) e fabricantes (para equipamentos)
  const operators = manufacturers.filter(m =>
    m.description && m.description.toLowerCase().includes('operadora')
  );
  const equipmentManufacturers = manufacturers.filter(m =>
    !m.description || !m.description.toLowerCase().includes('operadora')
  );

  // Filtrar soluções excluindo CHIP (id = 11) para equipamentos
  const equipmentSolutions = solutions.filter(s => s.id !== 11);

  // Forms separados para cada tipo
  const chipForm = useForm<ChipFormValues>({
    resolver: zodResolver(chipSchema),
    defaultValues: {
      line_number: undefined,
      iccid: "",
      manufacturer_id: undefined,
      status_id: 1, // Default para "Disponível"
    }
  });

  const equipmentForm = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      serial_number: "",
      model: "",
      rented_days: 0,
      radio: "",
      status_id: 1, // Default para "Disponível"
      manufacturer_id: undefined,
      solution_id: undefined,
      admin_user: "admin",
      admin_pass: ""
    }
  });

  const createAssetMutation = useCreateAsset();
  const equipmentPassword = equipmentForm.watch("admin_pass");

  // Função para verificar força da senha
  const handlePasswordChange = (value: string) => {
    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);
    equipmentForm.setValue("admin_pass", value);
  };

  // Submissão do formulário de CHIP
  const onSubmitChip = (formData: ChipFormValues) => {
    const createData = {
      type: 'CHIP' as const,
      solution_id: 11, // Fixo para CHIP
      model: "NANOSIM", // Fixo para CHIP
      line_number: formData.line_number,
      iccid: formData.iccid,
      manufacturer_id: formData.manufacturer_id,
      status_id: formData.status_id,
    };

    console.log('Cadastrando CHIP:', createData);
    createAssetMutation.mutate(createData);
  };

  // Submissão do formulário de EQUIPAMENTO
  const onSubmitEquipment = (formData: EquipmentFormValues) => {
    // Verificar força da senha
    if (passwordStrength === 'weak' && !allowWeakPassword) {
      equipmentForm.setError("admin_pass", {
        type: "manual",
        message: "Use uma senha mais forte ou marque para permitir senha fraca."
      });
      return;
    }

    const createData = {
      type: 'ROTEADOR' as const,
      solution_id: formData.solution_id,
      serial_number: formData.serial_number,
      model: formData.model,
      rented_days: formData.rented_days,
      radio: formData.radio,
      status_id: formData.status_id,
      manufacturer_id: formData.manufacturer_id,
      admin_user: formData.admin_user,
      admin_pass: formData.admin_pass,
    };

    console.log('Cadastrando EQUIPAMENTO:', createData);
    createAssetMutation.mutate(createData);
  };

  // Renderizar indicador de força da senha
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
              Permitir senha fraca
            </label>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className='flex flex-row gap-4 items-center'>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/assets`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Registrar Novo Ativo
          </h1>
          <p className="text-muted-foreground">
            Cadastre chips ou equipamentos no inventário
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Ativo</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={assetType}
            onValueChange={(value) => {
              setAssetType(value as 'CHIP' | 'EQUIPAMENTO');
              // Resetar forms ao trocar de tab
              chipForm.reset();
              equipmentForm.reset();
              setPasswordStrength(null);
              setAllowWeakPassword(false);
            }}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="CHIP">Chip</TabsTrigger>
              <TabsTrigger value="EQUIPAMENTO">Equipamento</TabsTrigger>
            </TabsList>

            {/* FORMULÁRIO DE CHIP */}
            <TabsContent value="CHIP" className="space-y-6">
              <Form {...chipForm}>
                <form onSubmit={chipForm.handleSubmit(onSubmitChip)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <FormField
                      control={chipForm.control}
                      name="line_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número da Linha *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ex: 11987654321"
                              disabled={createAssetMutation.isPending}
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === "" ? undefined : Number(value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={chipForm.control}
                      name="iccid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ICCID *</FormLabel>
                          <FormControl>
                            <Input
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
                      control={chipForm.control}
                      name="manufacturer_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Operadora *</FormLabel>
                          {isReferenceDataLoading ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <Select
                              value={field.value?.toString() || ""}
                              onValueChange={(value) => field.onChange(Number(value))}
                              disabled={createAssetMutation.isPending}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a operadora" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {operators.map((operator) => (
                                  <SelectItem
                                    key={operator.id}
                                    value={operator.id.toString()}
                                  >
                                    {capitalize(operator.name)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
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
                          {isReferenceDataLoading ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <Select
                              value={field.value?.toString() || ""}
                              onValueChange={(value) => field.onChange(Number(value))}
                              disabled={createAssetMutation.isPending}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statuses.map((status) => (
                                  <SelectItem
                                    key={status.id}
                                    value={status.id.toString()}
                                  >
                                    {capitalize(status.status)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={createAssetMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {createAssetMutation.isPending ? "Cadastrando..." : "Cadastrar Chip"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* FORMULÁRIO DE EQUIPAMENTO */}
            <TabsContent value="EQUIPAMENTO" className="space-y-6">
              <Form {...equipmentForm}>
                <form onSubmit={equipmentForm.handleSubmit(onSubmitEquipment)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <FormField
                      control={equipmentForm.control}
                      name="serial_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Série *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: SN123456789"
                              disabled={createAssetMutation.isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={equipmentForm.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo *</FormLabel>
                          <FormControl>
                            <Input
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
                      control={equipmentForm.control}
                      name="manufacturer_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fabricante *</FormLabel>
                          {isReferenceDataLoading ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <Select
                              value={field.value?.toString() || ""}
                              onValueChange={(value) => field.onChange(Number(value))}
                              disabled={createAssetMutation.isPending}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o fabricante" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {equipmentManufacturers.map((manufacturer) => (
                                  <SelectItem
                                    key={manufacturer.id}
                                    value={manufacturer.id.toString()}
                                  >
                                    {capitalize(manufacturer.name)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={equipmentForm.control}
                      name="solution_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Solução *</FormLabel>
                          {isReferenceDataLoading ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <Select
                              value={field.value?.toString() || ""}
                              onValueChange={(value) => field.onChange(Number(value))}
                              disabled={createAssetMutation.isPending}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a solução" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {equipmentSolutions.map((solution) => (
                                  <SelectItem
                                    key={solution.id}
                                    value={solution.id.toString()}
                                  >
                                    {solution.solution.toUpperCase()}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={equipmentForm.control}
                      name="rented_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dias Alugada *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              disabled={createAssetMutation.isPending}
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(value === "" ? 0 : Number(value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={equipmentForm.control}
                      name="radio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rádio *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Configuração de rádio"
                              disabled={createAssetMutation.isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={equipmentForm.control}
                      name="status_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status *</FormLabel>
                          {isReferenceDataLoading ? (
                            <Skeleton className="h-10 w-full" />
                          ) : (
                            <Select
                              value={field.value?.toString() || ""}
                              onValueChange={(value) => field.onChange(Number(value))}
                              disabled={createAssetMutation.isPending}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statuses.map((status) => (
                                  <SelectItem
                                    key={status.id}
                                    value={status.id.toString()}
                                  >
                                    {capitalize(status.status)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={equipmentForm.control}
                      name="admin_user"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuário Admin *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="admin"
                              disabled={createAssetMutation.isPending}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={equipmentForm.control}
                      name="admin_pass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha Admin *</FormLabel>
                          <FormControl>
                            <PasswordInput
                              id="admin_pass"
                              value={field.value || ""}
                              onChange={(e) => handlePasswordChange(e.target.value)}
                              placeholder="Senha de administração"
                              disabled={createAssetMutation.isPending}
                            />
                          </FormControl>
                          {renderPasswordStrength()}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={createAssetMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {createAssetMutation.isPending ? "Cadastrando..." : "Cadastrar Equipamento"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
