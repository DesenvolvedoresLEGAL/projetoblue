import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  Zap,
  Shield,
  Smartphone,
  Router,
  Loader2,
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
import { useIsMobile } from "@/hooks/useIsMobile";
import { useRegisterAsset } from "./useRegisterAsset";

const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export function RegisterAssetForm() {
  const {
    showSuccess,
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
    chipForm,
    equipmentForm,
    createAssetMutation,
    isReferenceDataLoading,
    operators,
    equipmentManufacturers,
    equipmentSolutions,
    statuses,
    handlePasswordChange,
    copyFactoryToCurrentFields,
    onSubmitChip,
    onSubmitEquipment,
  } = useRegisterAsset();
  const isMobile = useIsMobile();

  // Success Alert - Mobile Optimized
  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
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
                const newAssetType = value as 'CHIP' | 'EQUIPMENT';
                if (import.meta.env.DEV) console.log('Trocando tipo de ativo para:', newAssetType);
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
                  value="EQUIPMENT"
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
              <TabsContent value="EQUIPMENT" className="space-y-4 md:space-y-6">
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
    </TooltipProvider>
  );
}
