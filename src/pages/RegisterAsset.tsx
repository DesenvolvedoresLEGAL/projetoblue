import React, { useState, useEffect } from "react";
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
  Loader2,
  PackagePlus,
  Wifi,
  Copy
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
import { NetworkFields } from "@/components/ui/network-fields";
import { checkPasswordStrength } from "@/utils/passwordStrength";
import {
  useCreateAsset,
  useManufacturers,
  useAssetSolutions,
  useStatusRecords
} from "@/hooks/useAssetManagement";
import { useNavigate } from "react-router-dom";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { useAssetRegistrationState } from "@/hooks/useAssetRegistrationState";
import { useIsMobile } from "@/hooks/useIsMobile";
import { toast } from "@/utils/toast";

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
  // Campos de rede de fábrica - obrigatórios
  ssid_fabrica: z.string().min(1, "SSID de fábrica é obrigatório"),
  pass_fabrica: z.string().min(1, "Senha WiFi de fábrica é obrigatória"),
  admin_user_fabrica: z.string().min(1, "Usuário admin de fábrica é obrigatório"),
  admin_pass_fabrica: z.string().min(1, "Senha admin de fábrica é obrigatória"),
  // Campos de rede atuais - opcionais
  ssid_atual: z.string().optional(),
  pass_atual: z.string().optional(),
});

type ChipFormValues = z.infer<typeof chipSchema>;
type EquipmentFormValues = z.infer<typeof equipmentSchema>;

const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export default function RegisterAsset() {
  const [showSuccess, setShowSuccess] = useState(false);
  const isMobile = useIsMobile();

  const navigate = useNavigate();

  // Use persistent state hook
  const {
    assetType,
    passwordStrength,
    allowWeakPassword,
    basicInfoOpen,
    technicalInfoOpen,
    securityInfoOpen,
    networkInfoOpen,
    setAssetType,
    setPasswordStrength,
    setAllowWeakPassword,
    setBasicInfoOpen,
    setTechnicalInfoOpen,
    setSecurityInfoOpen,
    setNetworkInfoOpen,
    syncWithForm,
    updateFormData,
    resetFormData,
    clearState
  } = useAssetRegistrationState();

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
      admin_pass: "",
      ssid_fabrica: "",
      pass_fabrica: "",
      admin_user_fabrica: "admin",
      admin_pass_fabrica: "",
      ssid_atual: "",
      pass_atual: ""
    }
  });

  const createAssetMutation = useCreateAsset();
  const equipmentPassword = equipmentForm.watch("admin_pass");

  // Sync persisted data with forms on mount and asset type change
  useEffect(() => {
    console.log('Sincronizando dados salvos com o formulário...');
    if (assetType === 'CHIP') {
      syncWithForm(chipForm, 'chip');
    } else {
      syncWithForm(equipmentForm, 'equipment');
    }
  }, [assetType]);

  // Watch form changes and persist them - SALVAR EM TEMPO REAL
  useEffect(() => {
    const subscription = chipForm.watch((data) => {
      console.log('Salvando dados do formulário de chip:', data);
      updateFormData(data, 'chip');
    });
    return () => subscription.unsubscribe();
  }, [chipForm.watch, updateFormData]);

  useEffect(() => {
    const subscription = equipmentForm.watch((data) => {
      console.log('Salvando dados do formulário de equipamento:', data);
      updateFormData(data, 'equipment');
    });
    return () => subscription.unsubscribe();
  }, [equipmentForm.watch, updateFormData]);

  // Clear state when component unmounts (navigating away) - apenas se não houve sucesso
  useEffect(() => {
    return () => {
      if (!showSuccess) {
        console.log('Componente desmontado sem sucesso - mantendo dados salvos');
      }
    };
  }, [showSuccess]);

  const handlePasswordChange = (value: string) => {
    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);
    equipmentForm.setValue("admin_pass", value);
  };

  // Função para copiar dados de fábrica para campos atuais
  const copyFactoryToCurrentFields = () => {
    const factoryData = {
      ssid_atual: equipmentForm.getValues("ssid_fabrica"),
      pass_atual: equipmentForm.getValues("pass_fabrica"),
    };

    Object.entries(factoryData).forEach(([key, value]) => {
      if (value) {
        equipmentForm.setValue(key as keyof EquipmentFormValues, value);
      }
    });

    toast.success("Dados de fábrica copiados para os campos atuais");
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
        console.log('Chip cadastrado com sucesso - limpando sessionStorage');
        setShowSuccess(true);
        clearState();
        chipForm.reset();
        equipmentForm.reset();
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
      // Incluir dados de rede de fábrica
      ssid_fabrica: formData.ssid_fabrica,
      pass_fabrica: formData.pass_fabrica,
      admin_user_fabrica: formData.admin_user_fabrica,
      admin_pass_fabrica: formData.admin_pass_fabrica,
      // Incluir dados de rede atuais
      ssid_atual: formData.ssid_atual,
      pass_atual: formData.pass_atual,
    };

    console.log('Cadastrando EQUIPAMENTO:', createData);
    
    createAssetMutation.mutate(createData, {
      onSuccess: () => {
        console.log('Equipamento cadastrado com sucesso - limpando sessionStorage');
        setShowSuccess(true);
        clearState();
        chipForm.reset();
        equipmentForm.reset();
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

  // Success Alert - Mobile Optimized
  if (showSuccess) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[60vh] px-4">
        <Card className={`${isMobile ? 'w-full max-w-sm' : 'max-w-md w-full'} legal-card border-green-200`}>
          <CardContent className={`${isMobile ? 'p-6' : 'p-8'} text-center`}>
            <div className={`p-4 bg-green-100 rounded-full ${isMobile ? 'w-16 h-16' : 'w-20 h-20'} mx-auto mb-4 flex items-center justify-center`}>
              <CheckCircle2 className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-green-600`} />
            </div>
            <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-green-700 mb-2 legal-title`}>
              Ativo Cadastrado!
            </h2>
            <p className={`text-green-600 mb-4 ${isMobile ? 'text-sm' : ''}`}>
              {assetType === 'CHIP' ? 'Chip registrado' : 'Equipamento registrado'} com sucesso no sistema.
            </p>
            <p className="text-xs text-muted-foreground">
              Redirecionando para o painel de gestão...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={`container mx-auto space-y-4 md:space-y-8 ${isMobile ? 'px-4' : ''}`}>
        {/* Header com identidade Legal - Mobile Responsive */}
        <StandardPageHeader
          icon={PackagePlus}
          title="Cadastrar Novo Ativo"
          description="Adicione CHIPs ou equipamentos ao inventário da empresa"
        >
          <Button
            variant="ghost"
            size={isMobile ? "sm" : "sm"}
            onClick={() => {
              console.log('Usuário saindo da página - limpando dados salvos');
              clearState();
              navigate(-1);
            }}
            className="flex items-center gap-2 text-[#4D2BFB] hover:bg-[#4D2BFB]/10 font-neue-haas"
          >
            <ArrowLeft className="h-4 w-4" />
            {!isMobile && "Voltar"}
          </Button>
        </StandardPageHeader>

        <Card className="legal-card border-2">
          <CardHeader className="bg-gradient-to-r from-legal-primary/5 to-legal-secondary/5">
            <CardTitle className={`legal-subtitle flex items-center gap-2 ${isMobile ? 'text-lg' : ''}`}>
              <Zap className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-legal-primary`} />
              Detalhes do Ativo
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <Tabs
              value={assetType}
              onValueChange={(value) => {
                const newAssetType = value as 'CHIP' | 'EQUIPAMENTO';
                console.log('Trocando tipo de ativo para:', newAssetType);
                setAssetType(newAssetType);
                
                if (newAssetType === 'CHIP') {
                  equipmentForm.reset();
                } else {
                  chipForm.reset();
                }
                
                setPasswordStrength(null);
                setAllowWeakPassword(false);
                setBasicInfoOpen(true);
                setTechnicalInfoOpen(false);
                setSecurityInfoOpen(false);
                setNetworkInfoOpen(false);
              }}
              className="w-full"
            >
              <TabsList className={`grid grid-cols-2 mb-6 md:mb-8 ${isMobile ? 'h-12' : 'h-14'} bg-muted/50`}>
                <TabsTrigger 
                  value="CHIP" 
                  className={`flex items-center gap-2 ${isMobile ? 'text-sm px-2' : 'text-base px-4'} font-semibold data-[state=active]:bg-legal-primary data-[state=active]:text-white`}
                >
                  <Smartphone className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  {isMobile ? 'CHIP' : 'Chip / SIM Card'}
                </TabsTrigger>
                <TabsTrigger 
                  value="EQUIPAMENTO"
                  className={`flex items-center gap-2 ${isMobile ? 'text-sm px-2' : 'text-base px-4'} font-semibold data-[state=active]:bg-legal-primary data-[state=active]:text-white`}
                >
                  <Router className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  {isMobile ? 'EQUIPAMENTO' : 'Equipamento'}
                </TabsTrigger>
              </TabsList>

              {/* FORMULÁRIO DE CHIP - Mobile Optimized */}
              <TabsContent value="CHIP" className="space-y-4 md:space-y-6">
                <Alert className="bg-blue-50 border-legal-primary/30">
                  <Smartphone className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-legal-primary`} />
                  <AlertDescription className={`text-legal-dark ${isMobile ? 'text-sm' : ''}`}>
                    <strong>Chips/SIM Cards:</strong> Cadastre cartões SIM para conectividade móvel. 
                    {!isMobile && " Inclua informações da operadora e dados técnicos."}
                  </AlertDescription>
                </Alert>

                <Form {...chipForm}>
                  <form onSubmit={chipForm.handleSubmit(onSubmitChip)} className="space-y-4 md:space-y-6">
                    
                    {/* Seção Informações Básicas - Mobile Responsive */}
                    <Collapsible open={basicInfoOpen} onOpenChange={setBasicInfoOpen}>
                      <CollapsibleTrigger className="w-full">
                        <Card className={`cursor-pointer hover:bg-muted/30 transition-colors border-legal-primary/20 ${isMobile ? 'touch-manipulation' : ''}`}>
                          <CardHeader className={`${isMobile ? 'pb-2' : 'pb-3'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`${isMobile ? 'p-1.5' : 'p-2'} bg-legal-primary/10 rounded-lg`}>
                                  <Info className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-legal-primary`} />
                                </div>
                                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold legal-subtitle`}>
                                  Informações Básicas
                                </h3>
                              </div>
                              {basicInfoOpen ? 
                                <ChevronDown className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-legal-primary`} /> : 
                                <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-legal-primary`} />
                              }
                            </div>
                          </CardHeader>
                        </Card>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-6'} bg-muted/20 ${isMobile ? 'p-4' : 'p-6'} rounded-lg`}>
                          <FormField
                            control={chipForm.control}
                            name="line_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>
                                  <Tooltip>
                                    <TooltipTrigger className="flex items-center gap-1 cursor-help">
                                      Número da linha *
                                      <Info className="h-3 w-3" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Número de telefone da linha móvel</p>
                                    </TooltipContent>
                                  </Tooltip>
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
                                    className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}
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
                                <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>
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
                                    className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                  {isMobile ? 'Código do SIM (19-20 dígitos)' : 'Código impresso no cartão SIM (19-20 dígitos)'}
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
                                <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>Operadora *</FormLabel>
                                {isReferenceDataLoading ? (
                                  <Skeleton className={`${isMobile ? 'h-11' : 'h-10'} w-full`} />
                                ) : (
                                  <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    disabled={createAssetMutation.isPending}
                                  >
                                    <FormControl>
                                      <SelectTrigger className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}>
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
                                <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>Status Inicial *</FormLabel>
                                {isReferenceDataLoading ? (
                                  <Skeleton className={`${isMobile ? 'h-11' : 'h-10'} w-full`} />
                                ) : (
                                  <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    disabled={createAssetMutation.isPending}
                                  >
                                    <FormControl>
                                      <SelectTrigger className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}>
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

                    <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'} pt-4`}>
                      <Button
                        type="submit"
                        disabled={createAssetMutation.isPending}
                        className={`legal-button text-white font-bold ${isMobile ? 'w-full py-3 text-base' : 'px-8 py-3 text-base'} shadow-lg hover:shadow-xl transition-all duration-200`}
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

              {/* FORMULÁRIO DE EQUIPAMENTO - Mobile Optimized */}
              <TabsContent value="EQUIPAMENTO" className="space-y-4 md:space-y-6">
                <Alert className="bg-blue-50 border-legal-primary/30">
                  <Router className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-legal-primary`} />
                  <AlertDescription className={`text-legal-dark ${isMobile ? 'text-sm' : ''}`}>
                    <strong>Equipamentos:</strong> Cadastre roteadores, switches e outros dispositivos de rede.
                    {!isMobile && " Complete todas as seções para um registro completo."}
                  </AlertDescription>
                </Alert>

                <Form {...equipmentForm}>
                  <form onSubmit={equipmentForm.handleSubmit(onSubmitEquipment)} className="space-y-4 md:space-y-6">

                    {/* Seção Informações Básicas - Mobile Responsive */}
                    <Collapsible open={basicInfoOpen} onOpenChange={setBasicInfoOpen}>
                      <CollapsibleTrigger className="w-full">
                        <Card className={`cursor-pointer hover:bg-muted/30 transition-colors border-legal-primary/20 ${isMobile ? 'touch-manipulation' : ''}`}>
                          <CardHeader className={`${isMobile ? 'pb-2' : 'pb-3'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`${isMobile ? 'p-1.5' : 'p-2'} bg-legal-primary/10 rounded-lg`}>
                                  <Info className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-legal-primary`} />
                                </div>
                                <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold legal-subtitle`}>
                                  Informações Básicas
                                </h3>
                              </div>
                              {basicInfoOpen ? 
                                <ChevronDown className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-legal-primary`} /> : 
                                <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-legal-primary`} />
                              }
                            </div>
                          </CardHeader>
                        </Card>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-6'} bg-muted/20 ${isMobile ? 'p-4' : 'p-6'} rounded-lg`}>
                        
                        <FormField
                          control={equipmentForm.control}
                          name="radio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>
                                Rádio *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ex: SPEEDY01, 4BLACK69"
                                  disabled={createAssetMutation.isPending}
                                  {...field}
                                  className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground">
                                {isMobile ? 'ID único (etiqueta LEGAL)' : 'Identificador único do equipamento (etiqueta da LEGAL)'}
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
                                <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>Número de Série *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: SN123456789"
                                    disabled={createAssetMutation.isPending}
                                    {...field}
                                    className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                  {isMobile ? 'Número único do equipamento' : 'Número único do equipamento (etiqueta do fabricante)'}
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
                                <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>Modelo *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: Archer C6, WRT54G"
                                    disabled={createAssetMutation.isPending}
                                    {...field}
                                    className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}
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
                                <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>Fabricante *</FormLabel>
                                {isReferenceDataLoading ? (
                                  <Skeleton className={`${isMobile ? 'h-11' : 'h-10'} w-full`} />
                                ) : (
                                  <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    disabled={createAssetMutation.isPending}
                                  >
                                    <FormControl>
                                      <SelectTrigger className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}>
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
                                <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>Status Inicial *</FormLabel>
                                {isReferenceDataLoading ? (
                                  <Skeleton className={`${isMobile ? 'h-11' : 'h-10'} w-full`} />
                                ) : (
                                  <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    disabled={createAssetMutation.isPending}
                                  >
                                    <FormControl>
                                      <SelectTrigger className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}>
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
                                <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>Tipo de Solução *</FormLabel>
                                {isReferenceDataLoading ? (
                                  <Skeleton className={`${isMobile ? 'h-11' : 'h-10'} w-full`} />
                                ) : (
                                  <Select
                                    value={field.value?.toString() || ""}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    disabled={createAssetMutation.isPending}
                                  >
                                    <FormControl>
                                      <SelectTrigger className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}>
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
                                <FormLabel className={`text-legal-dark font-semibold ${isMobile ? 'text-sm' : ''}`}>Dias de Locação</FormLabel>
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
                                    className={`form-input ${isMobile ? 'h-11 text-base' : 'h-10'}`}
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                  {isMobile ? '0 = equipamento próprio' : 'Tempo de locação (0 = equipamento próprio)'}
                                </p>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Security Section - Mobile Optimized */}
                        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 md:grid-cols-2 gap-6'} bg-red-50/50 ${isMobile ? 'p-4' : 'p-6'} rounded-lg border border-red-200 mt-4`}>
                          <FormField
                            control={equipmentForm.control}
                            name="admin_user"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className={`text-red-700 font-semibold ${isMobile ? 'text-sm' : ''}`}>Usuário Administrador *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="admin"
                                    disabled={createAssetMutation.isPending}
                                    {...field}
                                    className={`form-input border-red-200 focus:border-red-500 ${isMobile ? 'h-11 text-base' : 'h-10'}`}
                                  />
                                </FormControl>
                                <p className="text-xs text-red-600">
                                  {isMobile ? 'Nome de usuário admin' : 'Nome de usuário para acesso administrativo'}
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
                                <FormLabel className={`text-red-700 font-semibold ${isMobile ? 'text-sm' : ''}`}>Senha Administrador *</FormLabel>
                                <FormControl>
                                  <PasswordInput
                                    id="admin_pass"
                                    value={field.value || ""}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    placeholder="Digite uma senha segura"
                                    disabled={createAssetMutation.isPending}
                                    className={`form-input border-red-200 focus:border-red-500 ${isMobile ? 'h-11 text-base' : 'h-10'}`}
                                  />
                                </FormControl>
                                <p className="text-xs text-red-600">
                                  Senha para acesso ao equipamento
                                </p>
                                {passwordStrength && (
                                  <div className="space-y-2 mt-2">
                                    {passwordStrength === 'strong' ? (
                                      <div className="flex items-center gap-2 text-green-600 text-sm">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="font-medium">
                                          {isMobile ? 'Senha forte!' : 'Senha forte - Excelente segurança!'}
                                        </span>
                                      </div>
                                    ) : passwordStrength === 'medium' ? (
                                      <div className="flex items-center gap-2 text-amber-600 text-sm">
                                        <Info className="h-4 w-4" />
                                        <span className="font-medium">
                                          {isMobile ? 'Senha média' : 'Senha média - Considerável melhorar'}
                                        </span>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-2 text-orange-500 text-sm">
                                          <AlertTriangle className="h-4 w-4" />
                                          <span className="font-medium">
                                            {isMobile ? 'Senha fraca' : 'Senha fraca - Não recomendada'}
                                          </span>
                                        </div>
                                        <div className={`${isMobile ? 'ml-0' : 'ml-6'}`}>
                                          <label className="flex items-center text-sm cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={allowWeakPassword}
                                              onChange={(e) => setAllowWeakPassword(e.target.checked)}
                                              className="mr-2 accent-legal-primary"
                                            />
                                            <span className="text-muted-foreground">
                                              {isMobile ? 'Permitir senha fraca' : 'Permitir senha fraca (não recomendado)'}
                                            </span>
                                          </label>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                      </CollapsibleContent>
                    </Collapsible>
                        {/* Nova Seção: Configurações de Rede */}
                        <Collapsible open={networkInfoOpen} onOpenChange={setNetworkInfoOpen}>
                          <CollapsibleTrigger className="w-full">
                            <Card className={`cursor-pointer hover:bg-muted/30 transition-colors border-blue-200 ${isMobile ? 'touch-manipulation' : ''}`}>
                              <CardHeader className={`${isMobile ? 'pb-2' : 'pb-3'}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`${isMobile ? 'p-1.5' : 'p-2'} bg-blue-100 rounded-lg`}>
                                      <Wifi className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} />
                                    </div>
                                    <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-blue-700`}>
                                      Configurações de Rede
                                    </h3>
                                  </div>
                                  {networkInfoOpen ? 
                                    <ChevronDown className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} /> : 
                                    <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-600`} />
                                  }
                                </div>
                              </CardHeader>
                            </Card>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-4 space-y-4">
                            {/* Configurações de Fábrica */}
                            <NetworkFields
                              form={equipmentForm}
                              isLoading={createAssetMutation.isPending}
                              isMobile={isMobile}
                              fieldPrefix="fabrica"
                              title="Configurações Originais de Fábrica"
                              description="Dados originais do equipamento (não alteráveis após cadastro)"
                            />

                            {/* Configurações Atuais */}
                            <NetworkFields
                              form={equipmentForm}
                              isLoading={createAssetMutation.isPending}
                              isMobile={isMobile}
                              fieldPrefix="atual"
                              title="Configurações Atuais"
                              description="Configurações aplicadas atualmente no equipamento"
                              showCopyButton={true}
                              onCopyFromFactory={copyFactoryToCurrentFields}
                            />
                          </CollapsibleContent>
                        </Collapsible>

                    <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'} pt-6`}>
                      <Button
                        type="submit"
                        disabled={createAssetMutation.isPending}
                        className={`legal-button text-white font-bold ${isMobile ? 'w-full py-3 text-base' : 'px-8 py-3 text-base'} shadow-lg hover:shadow-xl transition-all duration-200`}
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
