
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  PlusCircle,
  LinkIcon,
  History,
  List,
  CheckCircle2,
  Clock,
  RefreshCw,
  Shield,
  TrendingUp,
  Activity,
  AlertTriangle,
  Info,
  Loader2,
  FileUser,
  UserPlus
} from "lucide-react";
import { useDashboardAssets } from '@modules/dashboard/hooks/useDashboardAssets';
import { StandardPageHeader } from '@/components/ui/standard-page-header';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionButton } from '@/components/auth/PermissionButton';
import { RoleGuard } from '@/components/auth/RoleGuard';

const AssetsManagement = () => {
  const navigate = useNavigate();
  const dashboard = useDashboardAssets();
  const permissions = usePermissions();
  const isLoading = dashboard.problemAssets.isLoading;

  const [lastSync] = useState(new Date(Date.now() - 5 * 60 * 1000)); // 5 minutes ago

  const getSyncStatus = () => {
    const minutesAgo = Math.floor((Date.now() - lastSync.getTime()) / (1000 * 60));
    
    if (minutesAgo < 10) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
        text: 'Sistema atualizado',
        detail: `Última sincronização há ${minutesAgo} minutos`
      };
    } else if (minutesAgo < 30) {
      return {
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-200',
        icon: <Clock className="h-5 w-5 text-amber-600" />,
        text: 'Sincronização moderada',
        detail: `Última sincronização há ${minutesAgo} minutos`
      };
    } else {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: <RefreshCw className="h-5 w-5 text-red-600" />,
        text: 'Sincronização atrasada',
        detail: `Última sincronização há ${minutesAgo} minutos`
      };
    }
  };

  const syncStatus = getSyncStatus();

  
  // Loading state for the entire dashboard
  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-legal-primary animate-spin" />
        <div className="text-center space-y-2">
          <p className="text-lg sm:text-xl font-semibold legal-title">Carregando Gestão</p>
          <p className="text-sm sm:text-base text-muted-foreground legal-text">Sincronizando dados do sistema...</p>
        </div>
      </div>
    );
  }

  const hasProblems = (dashboard.problemAssets.data.length > 0); // Demo: set to true to show problem cards

  return (
    
    <TooltipProvider>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Header com identidade Legal */}
        <StandardPageHeader
          icon={Shield}
          title='Gestão de Ativos'
          description='Central de controle para equipamentos e chips'
        >
        </StandardPageHeader>

        {/* Cards de Problemas - Apenas se houver */}
        {hasProblems ? (
          <Alert className="bg-red-50 border-red-200 border-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            <div>
              <h3 className="font-bold text-red-700 legal-text text-sm sm:text-base">
                Atenção necessária
              </h3>
              <AlertDescription className="text-red-600 text-sm">
                Existem ativos que precisam de verificação. Acesse o inventário para detalhes.
              </AlertDescription>
            </div>
          </Alert>
        ) : null}

        {/* Cards de Ações Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Card Registrar Ativo - Requer suporte ou superior */}
            <RoleGuard requiredRole="suporte">
              <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-primary/40 cursor-pointer flex flex-col"
                onClick={() => navigate('/assets/register')}>
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                    <div className="p-1.5 sm:p-2 bg-legal-primary/10 rounded-lg group-hover:bg-legal-primary/20 transition-colors">
                      <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6 text-legal-primary" />
                    </div>
                    <CardTitle className="legal-subtitle text-lg sm:text-xl">
                      Novo Ativo
                    </CardTitle>
                  </div>
                  <CardDescription className="legal-text text-sm">
                    Cadastre equipamentos e chips no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col flex-1'>
                  <p className="mt-auto text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    Adicione roteadores, switches, cartões SIM e outros equipamentos com todas as informações técnicas necessárias.
                  </p>
                  <div>
                    <PermissionButton 
                      requiredRole="suporte"
                      variant='outline'
                      className="w-full h-10 sm:h-9 border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white font-bold transition-all duration-200 text-sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/assets/register');
                      }}
                      tooltip="Você precisa ser suporte ou superior para cadastrar ativos"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Cadastrar Novo
                    </PermissionButton>
                  </div>
                </CardContent>
              </Card>
            </RoleGuard>

            {/* Card Gerenciar Associações - Requer suporte ou superior */}
            <RoleGuard requiredRole="suporte">
              <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-secondary/40 cursor-pointer flex flex-col"
                onClick={() => navigate('/assets/associations')}>
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                    <div className="p-1.5 sm:p-2 bg-legal-secondary/10 rounded-lg group-hover:bg-legal-secondary/20 transition-colors">
                      <LinkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-legal-secondary" />
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        <CardTitle className="legal-subtitle text-lg sm:text-xl cursor-help text-left">
                          Associar Ativos
                        </CardTitle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Vincule ativos disponíveis aos clientes</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CardDescription className="legal-text text-sm">
                    Conecte ativos aos seus clientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="mt-auto text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    Faça a associação entre equipamentos disponíveis e clientes, de forma organizada.
                  </p>           
                  <div>
                    <PermissionButton
                      requiredRole="suporte"
                      variant="outline"
                      className="w-full h-10 sm:h-9 border-legal-secondary text-legal-secondary hover:bg-legal-secondary hover:text-white font-bold transition-all duration-200 text-sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/assets/associations');
                      }}
                      tooltip="Você precisa ser suporte ou superior para associar ativos"
                    >
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Associar Ativos
                    </PermissionButton>
                  </div>
                </CardContent>
              </Card>
            </RoleGuard>

            {/* Card Listar Associações - Requer suporte ou superior */}
            <RoleGuard requiredRole="suporte">
              <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-primary/40 cursor-pointer flex flex-col"
                onClick={() => navigate('/assets/associations-list')}>
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                    <div className="p-1.5 sm:p-2 bg-legal-primary/10 rounded-lg group-hover:bg-legal-primary/20 transition-colors">
                      <List className="h-5 w-5 sm:h-6 sm:w-6 text-legal-primary" />
                    </div>
                    <CardTitle className="legal-subtitle text-lg sm:text-xl">
                      Histórico de Associações
                    </CardTitle>
                  </div>
                  <CardDescription className="legal-text text-sm">
                    Visualize todas as associações ativas
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <p className="mt-auto text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    Acesse a lista completa de equipamentos associados, 
                    com status detalhado e opções de gerenciamento.
                  </p>           
                  <div>
                    <PermissionButton
                      requiredRole="suporte"
                      variant="outline"
                      className="w-full h-10 sm:h-9 border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white font-bold transition-all duration-200 text-sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/assets/associations-list');
                      }}
                      tooltip="Você precisa ser suporte ou superior para ver associações"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Ver Lista Completa
                    </PermissionButton>
                  </div>
                </CardContent>
              </Card>
            </RoleGuard>

          {/* Card Ranking de Locação - Requer suporte ou superior */}
          <RoleGuard requiredRole="suporte">
            <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-secondary/40 cursor-pointer flex flex-col"
              onClick={() => navigate('/assets/ranking')}>
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-legal-secondary/10 rounded-lg group-hover:bg-legal-secondary/20 transition-colors">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-legal-secondary" />
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <CardTitle className="legal-subtitle text-lg sm:text-xl cursor-help text-left">
                        Ranking de Locação
                      </CardTitle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Veja quais ativos possuem maior tempo de locação.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription className="legal-text text-sm">
                  Descubra os equipamentos e speedys mais alugados da plataforma.
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1'>
                <p className="mt-auto text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  Visualize o ranking dos ativos por <b>dias alugados</b> (<code>rented_days</code>). Os itens com 30 dias ou mais de locação ganham destaque automático.
                </p>
                <div>
                  <PermissionButton
                    requiredRole="suporte"
                    variant="outline"
                    className="w-full h-10 sm:h-9 border-legal-secondary text-legal-secondary hover:bg-legal-secondary hover:text-white font-bold transition-all duration-200 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/assets/ranking');
                    }}
                    tooltip="Você precisa ser suporte ou superior para ver o ranking de locação"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Ver Ranking
                  </PermissionButton>
                </div>
              </CardContent>
            </Card>
          </RoleGuard>
            
            {/* Card Histórico - Requer suporte ou superior */}
            <RoleGuard requiredRole="suporte">
              <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-secondary/40 cursor-pointer flex flex-col"
                onClick={() => navigate('/assets/history')}>
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                    <div className="p-1.5 sm:p-2 bg-legal-secondary/10 rounded-lg group-hover:bg-legal-secondary/20 transition-colors">
                      <History className="h-5 w-5 sm:h-6 sm:w-6 text-legal-secondary" />
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        <CardTitle className="legal-subtitle text-lg sm:text-xl cursor-help text-left">
                          Histórico de Movimentações
                        </CardTitle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rastreie todas as alterações e movimentações dos ativos</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CardDescription className="legal-text text-sm">
                    Acompanhe todas as alterações realizadas
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex flex-col flex-1'>
                  <p className="mt-auto text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    Visualize o histórico completo de movimentações, status e associações dos equipamentos registrados.
                  </p>
                  <div>
                    <PermissionButton
                      requiredRole="suporte"
                      variant="outline"
                      className="w-full h-10 sm:h-9 border-legal-secondary text-legal-secondary hover:bg-legal-secondary hover:text-white font-bold transition-all duration-200 text-sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/assets/history');
                      }}
                      tooltip="Você precisa ser suporte ou superior para ver o histórico"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Ver Histórico
                    </PermissionButton>
                  </div>
                </CardContent>
              </Card>
            </RoleGuard>
        </div>

        {/* Informações de Ajuda */}
        <Card className="bg-gradient-to-r from-legal-primary/5 to-legal-secondary/5 border-legal-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="p-1.5 sm:p-2 bg-legal-primary/10 rounded-lg">
                <Info className="h-5 w-5 sm:h-6 sm:w-6 text-legal-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold legal-subtitle mb-2 text-base sm:text-lg">Fluxo Recomendado</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-legal-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <h4 className="font-medium text-legal-dark mb-1 text-sm sm:text-base">Cadastrar</h4>
                      <p className="text-xs sm:text-sm">Registre novos equipamentos e chips com todas as informações técnicas.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-legal-secondary text-legal-dark rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <div>
                      <h4 className="font-medium text-legal-dark mb-1 text-sm sm:text-base">Associar</h4>
                      <p className="text-xs sm:text-sm">Vincule os ativos cadastrados aos clientes conforme necessário.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-legal-primary text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <div>
                      <h4 className="font-medium text-legal-dark mb-1 text-sm sm:text-base">Monitorar</h4>
                      <p className="text-xs sm:text-sm">Acompanhe o histórico e status através do painel de controle.</p>
                    </div>
                  </div>
                </div>

                {/* Alerta de permissões para usuários com role insuficiente */}
                <RoleGuard 
                  requiredRole="suporte" 
                  inverse={true} 
                  fallback={null}
                >
                  <Alert className="mt-4 bg-amber-50 border-amber-200">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      <strong>Acesso Limitado:</strong> Algumas funcionalidades requerem permissões de suporte ou superior. 
                      Entre em contato com um administrador para solicitar acesso.
                    </AlertDescription>
                  </Alert>
                </RoleGuard>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default AssetsManagement;
