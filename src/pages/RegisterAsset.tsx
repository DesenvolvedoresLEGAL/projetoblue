
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  AlertTriangle, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight,
  Info,
  Zap,
  Shield,
  Smartphone,
  Router,
  Loader2
} from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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

const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export default function RegisterAsset() {
  const [assetType, setAssetType] = useState<'CHIP' | 'EQUIPAMENTO'>('CHIP');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [allowWeakPassword, setAllowWeakPassword] = useState(false);
  const [basicInfoOpen, setBasicInfoOpen] = useState(true);
  const [technicalInfoOpen, setTechnicalInfoOpen] = useState(false);
  const [securityInfoOpen, setSecurityInfoOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  // Hooks para buscar dados de referência
  const { data: manufacturers = [], isLoading: isManufacturersLoading } = useManufacturers();
  const { data: solutions = [], isLoading: isSolutionsLoading } = useAssetSolutions();
  const { data: statuses = [], isLoading: isStatusesLoading } = useStatusRecords();

  const isReferenceDataLoading = isManufacturersLoading || isSolutionsLoading || isStatusesLoading;

  const operators = manufacturers.filter(m =>
    m.description && m.description.toLowerCase().includes('operadora')
  );
  const equipmentManufacturers = manufacturers.filter(m =>
    !m.description || !m.description.toLowerCase().includes('operadora')
  );

  const equipmentSolutions = solutions.filter(s => s.id !== 11);

  // Forms separados para cada tipo
  const chipForm = useForm<ChipFormValues>({
    resolver: zodResolver(chipSchema),
    defaultValues: {
      line_number: undefined,
      iccid: "",
      manufacturer_id: undefined,
      status_id: 1,
    }
  });

  const equipmentForm = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      serial_number: "",
      model: "",
      rented_days: 0,
      radio: "",
      status_id: 1,
      manufacturer_id: undefined,
      solution_id: undefined,
      admin_user: "admin",
      admin_pass: ""
    }
  });

  const createAssetMutation = useCreateAsset();
  const equipmentPassword = equipmentForm.watch("admin_pass");

  const handlePasswordChange = (value: string) => {
    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);
    equipmentForm.setValue("admin_pass", value);
  };

  const onSubmitChip = (formData: ChipFormValues) => {
    const createData = {
      type: 'CHIP' as const,
      solution_id: 11,
      model: "NANOSIM",
      line_number: formData.line_number,
      iccid: formData.iccid,
      manufacturer_id: formData.manufacturer_id,
      status_id: formData.status_id,
    };

    console.log('Cadastrando CHIP:', createData);
    
    createAssetMutation.mutate(createData, {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/assets/management');
        }, 2000);
      }
    });
  };

  const onSubmitEquipment = (formData: EquipmentFormValues) => {
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
    
    createAssetMutation.mutate(createData, {
      onSuccess: () => {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/assets/management');
        }, 2000);
      }
    });
  };

  const renderPasswordStrength = () => {
    if (!passwordStrength) return null;

    if (passwordStrength === 'strong') {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium">Senha forte - Excelente segurança!</span>
        </div>
      );
    } else if (passwordStrength === 'medium') {
      return (
        <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
          <Info className="h-4 w-4" />
          <span className="font-medium">Senha média - Considerável melhorar</span>
        </div>
      );
    } else {
      return (
        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2 text-orange-500 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Senha fraca - Não recomendada</span>
          </div>
          <div className="ml-6">
            <label className="flex items-center text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={allowWeakPassword}
                onChange={(e) => setAllowWeakPassword(e.target.checked)}
                className="mr-2 accent-legal-primary"
              />
              <span className="text-muted-foreground">Permitir senha fraca (não recomendado)</span>
            </label>
          </div>
        </div>
      );
    }
  };

  // Success Alert
  if (showSuccess) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full legal-card border-green-200">
          <CardContent className="p-8 text-center">
            <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2 legal-title">
              Ativo Cadastrado!
            </h2>
            <p className="text-green-600 mb-4">
              {assetType === 'CHIP' ? 'Chip registrado' : 'Equipamento registrado'} com sucesso no sistema.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecionando para o painel de gestão...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto space-y-8">
        {/* Header com identidade Legal */}
        <div className="flex flex-row gap-4 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-legal-primary/10 hover:text-legal-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex-1">
            <div className="bg-gradient-to-r from-legal-primary to-legal-dark rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-legal-secondary" />
                <div>
                  <h1 className="text-2xl font-black legal-title text-white mb-1">
                    Cadastrar Novo Ativo
                  </h1>
                  <p className="text-legal-secondary/90 font-medium">
                    Registre chips e equipamentos de forma simples e segura
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="legal-card border-2">
          <CardHeader className="bg-gradient-to-r from-legal-primary/5 to-legal-secondary/5">
            <CardTitle className="legal-subtitle flex items-center gap-2">
              <Zap className="h-6 w-6 text-legal-primary" />
              Detalhes do Ativo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs
              value={assetType}
              onValueChange={(value) => {
                setAssetType(value as 'CHIP' | 'EQUIPAMENTO');
                chipForm.reset();
                equipmentForm.reset();
                setPasswordStrength(null);
                setAllowWeakPassword(false);
                setBasicInfoOpen(true);
                setTechnicalInfoOpen(false);
                setSecurityInfoOpen(false);
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-8 h-14 bg-muted/50">
                <TabsTrigger 
                  value="CHIP" 
                  className="flex items-center gap-2 text-base font-semibold data-[state=active]:bg-legal-primary data-[state=active]:text-white"
                >
                  <Smartphone className="h-5 w-5" />
                  Chip / SIM Card
                </TabsTrigger>
                <TabsTrigger 
                  value="EQUIPAMENTO"
                  className="flex items-center gap-2 text-base font-semibold data-[state=active]:bg-legal-primary data-[state=active]:text-white"
                >
                  <Router className="h-5 w-5" />
                  Equipamento
                </TabsTrigger>
              </TabsList>

              {/* FORMULÁRIO DE CHIP */}
              <TabsContent value="CHIP" className="space-y-6">
                <Alert className="bg-blue-50 border-legal-primary/30">
                  <Smartphone className="h-5 w-5 text-legal-primary" />
                  <AlertDescription className="text-legal-dark">
                    <strong>Chips/SIM Cards:</strong> Cadastre cartões SIM para conectividade móvel. 
                    Inclua informações da operadora e dados técnicos.
                  </AlertDescription>
                </Alert>

                <Form {...chipForm}>
                  <form onSubmit={chipForm.handleSubmit(onSubmitChip)} className="space-y-6">
                    
                    {/* Seção Informações Básicas */}
                    <Collapsible open={basicInfoOpen} onOpenChange={setBasicInfoOpen}>
                      <CollapsibleTrigger className="w-full">
                        <Card className="cursor-pointer hover:bg-muted/30 transition-colors border-legal-primary/20">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-legal-primary/10 rounded-lg">
                                  <Info className="h-5 w-5 text-legal-primary" />
                                </div>
                                <h3 className="text-lg font-bold legal-subtitle">Informações Básicas</h3>
                              </div>
                              {basicInfoOpen ? 
                                <ChevronDown className="h-5 w-5 text-legal-primary" /> : 
                                <ChevronRight className="h-5 w-5 text-legal-primary" />
                              }
                            </div>
                          </CardHeader>
                        </Card>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-lg">
                          <FormField
                            control={chipForm.control}
                            name="line_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-legal-dark font-semibold">
                                  Número da Linha *
                                </FormLabel>
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
                                    className="form-input"
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                  Número de telefone da linha móvel
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={chipForm.control}
                            name="iccid"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-legal-dark font-semibold">
                                  <Tooltip>
                                    <TooltipTrigger className="flex items-center gap-1 cursor-help">
                                      ICCID *
                                      <Info className="h-3 w-3" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Número único de identificação do chip SIM</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: 89550421180216543847"
                                    disabled={createAssetMutation.isPending}
                                    {...field}
                                    className="form-input"
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                  Código impresso no cartão SIM (19-20 dígitos)
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={chipForm.control}
                            name="manufacturer_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-legal-dark font-semibold">Operadora *</FormLabel>
                                {isReferenceDataLoading ? (
                                  <Skeleton className="h-10 w-full" />
                                ) : (
                                  <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    disabled={createAssetMutation.isPending}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="form-input">
                                        <SelectValue placeholder="Escolha a operadora de telefonia" />
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
                                <p className="text-xs text-muted-foreground">
                                  Ex: Vivo, Claro, TIM, Oi
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={chipForm.control}
                            name="status_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-legal-dark font-semibold">Status Inicial *</FormLabel>
                                {isReferenceDataLoading ? (
                                  <Skeleton className="h-10 w-full" />
                                ) : (
                                  <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    disabled={createAssetMutation.isPending}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="form-input">
                                        <SelectValue placeholder="Escolha o status do chip" />
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
                                <p className="text-xs text-muted-foreground">
                                  Estado atual do chip no inventário
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={createAssetMutation.isPending}
                        className="legal-button text-white font-bold px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {createAssetMutation.isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Cadastrando Chip...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Cadastrar Chip
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              {/* FORMULÁRIO DE EQUIPAMENTO */}
              <TabsContent value="EQUIPAMENTO" className="space-y-6">
                <Alert className="bg-blue-50 border-legal-primary/30">
                  <Router className="h-5 w-5 text-legal-primary" />
                  <AlertDescription className="text-legal-dark">
                    <strong>Equipamentos:</strong> Cadastre roteadores, switches e outros dispositivos de rede. 
                    Complete todas as seções para um registro completo.
                  </AlertDescription>
                </Alert>

                <Form {...equipmentForm}>
                  <form onSubmit={equipmentForm.handleSubmit(onSubmitEquipment)} className="space-y-6">

                    {/* Seção Informações Básicas */}
                    <Collapsible open={basicInfoOpen} onOpenChange={setBasicInfoOpen}>
                      <CollapsibleTrigger className="w-full">
                        <Card className="cursor-pointer hover:bg-muted/30 transition-colors border-legal-primary/20">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-legal-primary/10 rounded-lg">
                                  <Info className="h-5 w-5 text-legal-primary" />
                                </div>
                                <h3 className="text-lg font-bold legal-subtitle">Informações Básicas</h3>
                              </div>
                              {basicInfoOpen ? 
                                <ChevronDown className="h-5 w-5 text-legal-primary" /> : 
                                <ChevronRight className="h-5 w-5 text-legal-primary" />
                              }
                            </div>
                          </CardHeader>
                        </Card>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-lg">
                        
                        <FormField
                          control={equipmentForm.control}
                          name="radio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-legal-dark font-semibold">
                                Rádio *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: SPEEDY01, 4BLACK69"
                                  disabled={createAssetMutation.isPending}
                                  {...field}
                                  className="form-input"
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">
                                Identificador único do equipamento (etiqueta da LEGAL)
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                          <FormField
                            control={equipmentForm.control}
                            name="serial_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-legal-dark font-semibold">Número de Série *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: SN123456789"
                                    disabled={createAssetMutation.isPending}
                                    {...field}
                                    className="form-input"
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                  Número único do equipamento (etiqueta do fabricante)
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          

                          <FormField
                            control={equipmentForm.control}
                            name="model"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-legal-dark font-semibold">Modelo *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: Archer C6, WRT54G"
                                    disabled={createAssetMutation.isPending}
                                    {...field}
                                    className="form-input"
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                  Modelo específico do equipamento
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={equipmentForm.control}
                            name="manufacturer_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-legal-dark font-semibold">Fabricante *</FormLabel>
                                {isReferenceDataLoading ? (
                                  <Skeleton className="h-10 w-full" />
                                ) : (
                                  <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    disabled={createAssetMutation.isPending}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="form-input">
                                        <SelectValue placeholder="Escolha o fabricante" />
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
                                <p className="text-xs text-muted-foreground">
                                  Ex: TP-Link, D-Link, Cisco
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={equipmentForm.control}
                            name="status_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-legal-dark font-semibold">Status Inicial *</FormLabel>
                                {isReferenceDataLoading ? (
                                  <Skeleton className="h-10 w-full" />
                                ) : (
                                  <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    disabled={createAssetMutation.isPending}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="form-input">
                                        <SelectValue placeholder="Escolha o status" />
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
                                <p className="text-xs text-muted-foreground">
                                  Estado atual no inventário
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={equipmentForm.control}
                            name="solution_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-legal-dark font-semibold">Tipo de Solução *</FormLabel>
                                {isReferenceDataLoading ? (
                                  <Skeleton className="h-10 w-full" />
                                ) : (
                                  <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    disabled={createAssetMutation.isPending}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="form-input">
                                        <SelectValue placeholder="Escolha o tipo de solução" />
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
                                <p className="text-xs text-muted-foreground">
                                  Categoria do serviço prestado
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />


                          <FormField
                            control={equipmentForm.control}
                            name="rented_days"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-legal-dark font-semibold">Dias de Locação</FormLabel>
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
                                    className="form-input"
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                  Tempo de locação (0 = equipamento próprio)
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>                    
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-red-50/50 p-6 rounded-lg border border-red-200">
                          <FormField
                            control={equipmentForm.control}
                            name="admin_user"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-red-700 font-semibold">Usuário Administrador *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="admin"
                                    disabled={createAssetMutation.isPending}
                                    {...field}
                                    className="form-input border-red-200 focus:border-red-500"
                                  />
                                </FormControl>
                                <p className="text-xs text-red-600">
                                  Nome de usuário para acesso administrativo
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={equipmentForm.control}
                            name="admin_pass"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-red-700 font-semibold">Senha Administrador *</FormLabel>
                                <FormControl>
                                  <PasswordInput
                                    id="admin_pass"
                                    value={field.value || ""}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    placeholder="Digite uma senha segura"
                                    disabled={createAssetMutation.isPending}
                                    className="form-input border-red-200 focus:border-red-500"
                                  />
                                </FormControl>
                                <p className="text-xs text-red-600">
                                  Senha para acesso ao equipamento
                                </p>
                                {renderPasswordStrength()}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <div className="flex justify-end pt-6">
                      <Button
                        type="submit"
                        disabled={createAssetMutation.isPending}
                        className="legal-button text-white font-bold px-8 py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {createAssetMutation.isPending ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Cadastrando Equipamento...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Cadastrar Equipamento
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
