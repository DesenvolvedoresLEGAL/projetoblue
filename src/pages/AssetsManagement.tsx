
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
  FileUser
} from "lucide-react";
import { useDashboardAssets } from '@/hooks/useDashboardAssets';

const AssetsManagement = () => {

  const navigate = useNavigate();
  const dashboard = useDashboardAssets();

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
      <div className="space-y-6 p-6 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-16 w-16 text-legal-primary animate-spin" />
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold legal-title">Carregando Gestão</p>
          <p className="text-muted-foreground legal-text">Sincronizando dados do sistema...</p>
        </div>
      </div>
    );
  }

  const hasProblems = (dashboard.problemAssets.data.length > 0); // Demo: set to true to show problem cards

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header com identidade Legal */}
        <div className="bg-gradient-to-r from-legal-primary to-legal-dark rounded-2xl p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-legal-secondary" />
            <div>
              <h1 className="text-3xl font-black legal-title text-white mb-1">
                Gestão de Ativos
              </h1>
              <p className="text-legal-secondary/90 text-lg font-medium">
                Central de controle para equipamentos e chips
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Problemas - Apenas se houver */}
        {hasProblems ? (
          <Alert className="bg-red-50 border-red-200 border-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-bold text-red-700 legal-text">
                Atenção necessária
              </h3>
              <AlertDescription className="text-red-600">
                Existem ativos que precisam de verificação. Acesse o inventário para detalhes.
              </AlertDescription>
            </div>
          </Alert>
        ) : null}

        {/* Cards de Ações Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Card Registrar Ativo */}
          <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-primary/40 cursor-pointer flex flex-col h-full"
            onClick={() => navigate('/assets/register')}>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-legal-primary/10 rounded-lg group-hover:bg-legal-primary/20 transition-colors">
                  <PlusCircle className="h-6 w-6 text-legal-primary" />
                </div>
                <CardTitle className="legal-subtitle text-xl">
                  Novo Ativo
                </CardTitle>
              </div>
              <CardDescription className="legal-text">
                Cadastre equipamentos e chips no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col flex-1'>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Adicione roteadores, switches, cartões SIM e outros equipamentos 
                com todas as informações técnicas necessárias.
              </p>
              <div className="mt-auto">
                <Button 
                  variant='outline'
                  className="w-full border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white font-bold transition-all duration-200" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/assets/register');
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Cadastrar Novo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Gerenciar Associações */}
          <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-secondary/40 cursor-pointer flex flex-col h-full"
            onClick={() => navigate('/assets/associations')}>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-legal-secondary/10 rounded-lg group-hover:bg-legal-secondary/20 transition-colors">
                  <LinkIcon className="h-6 w-6 text-legal-secondary" />
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <CardTitle className="legal-subtitle text-xl cursor-help text-left">
                      Associar Ativos
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Vincule ativos disponíveis aos clientes</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription className="legal-text">
                Conecte ativos aos seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Faça a associação entre equipamentos disponíveis e clientes,
                controlando alocações e devoluções de forma organizada.
              </p>           
              <div className="mt-auto">
                <Button 
                  variant="outline"
                  className="w-full border-legal-secondary text-legal-secondary hover:bg-legal-secondary hover:text-white font-bold transition-all duration-200" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/assets/associations');
                  }}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Associar Ativos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Listar Associações */}
          <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-primary/40 cursor-pointer flex flex-col h-full"
            onClick={() => navigate('/assets/associations-list')}>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-legal-primary/10 rounded-lg group-hover:bg-legal-primary/20 transition-colors">
                  <List className="h-6 w-6 text-legal-primary" />
                </div>
                <CardTitle className="legal-subtitle text-xl">
                  Histórico de Associações
                </CardTitle>
              </div>
              <CardDescription className="legal-text">
                Visualize todas as associações ativas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Acesse a lista completa de equipamentos associados, 
                com status detalhado e opções de gerenciamento.
              </p>           
              <div className="mt-auto">
                <Button 
                  variant="outline"
                  className="w-full border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white font-bold transition-all duration-200" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/assets/associations-list');
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Ver Lista Completa
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Histórico */}
          <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-secondary/40 cursor-pointer flex flex-col h-full"
            onClick={() => navigate('/assets/history')}>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-legal-secondary/10 rounded-lg group-hover:bg-legal-secondary/20 transition-colors">
                  <History className="h-6 w-6 text-legal-secondary" />
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <CardTitle className="legal-subtitle text-xl cursor-help text-left">
                      Histórico de Movimentações
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rastreie todas as alterações e movimentações dos ativos</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription className="legal-text">
                Acompanhe todas as alterações realizadas
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col flex-1'>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Visualize o histórico completo de movimentações, alterações de status
                e associações dos equipamentos registrados.
              </p>
              <div className="mt-auto">
                <Button 
                  variant="outline"
                  className="w-full border-legal-secondary text-legal-secondary hover:bg-legal-secondary hover:text-white font-bold transition-all duration-200" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/assets/history');
                  }}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Ver Histórico
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card Registrar Ativo */}
          <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-primary/40 cursor-pointer flex flex-col h-full"
            onClick={() => navigate('/clients')}>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-legal-primary/10 rounded-lg group-hover:bg-legal-primary/20 transition-colors">
                  <FileUser className="h-6 w-6 text-legal-primary" />
                </div>
                <CardTitle className="legal-subtitle text-xl">
                  Gerenciar clientes
                </CardTitle>
              </div>
              <CardDescription className="legal-text">
                Gerencie os clientes cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col flex-1'>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Vizualise e/ou atualize informações dos clientes de forma prática.
              </p>
              <div className="mt-auto">
                <Button 
                  variant='outline'
                  className="w-full border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white font-bold transition-all duration-200" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/clients');
                  }}
                >
                  <FileUser className="h-4 w-4 mr-2" />
                  Cadastrar Novo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações de Ajuda */}
        <Card className="bg-gradient-to-r from-legal-primary/5 to-legal-secondary/5 border-legal-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-legal-primary/10 rounded-lg">
                <Info className="h-6 w-6 text-legal-primary" />
              </div>
              <div>
                <h3 className="font-bold legal-subtitle mb-2">Fluxo Recomendado</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-legal-primary text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <h4 className="font-medium text-legal-dark mb-1">Cadastrar</h4>
                      <p>Registre novos equipamentos e chips com todas as informações técnicas.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-legal-secondary text-legal-dark rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <div>
                      <h4 className="font-medium text-legal-dark mb-1">Associar</h4>
                      <p>Vincule os ativos cadastrados aos clientes conforme necessário.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-legal-primary text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <div>
                      <h4 className="font-medium text-legal-dark mb-1">Monitorar</h4>
                      <p>Acompanhe o histórico e status através do painel de controle.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default AssetsManagement;
