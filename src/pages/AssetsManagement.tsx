
import React, { useState, useRef, useEffect } from 'react';
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
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useDashboardAssets } from '@/hooks/useDashboardAssets';

const AssetsManagement = () => {
  const navigate = useNavigate();
  const dashboard = useDashboardAssets();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const isLoading = dashboard.problemAssets.isLoading;

  const [lastSync] = useState(new Date(Date.now() - 5 * 60 * 1000)); // 5 minutes ago
  
  // Check scroll position to enable/disable arrows
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    setIsAtStart(scrollLeft <= 0);
    setIsAtEnd(scrollLeft >= maxScroll - 1); // -1 for floating point precision
  };

  // Handle scroll left
  const handleScrollLeft = () => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  };

  // Handle scroll right
  const handleScrollRight = () => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  // Set up scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial check
    checkScrollPosition();

    // Add scroll listener
    container.addEventListener('scroll', checkScrollPosition);
    
    // Add resize listener to recheck when window resizes
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

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
        <div className="bg-gradient-to-r from-legal-primary to-legal-dark rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-legal-secondary" />
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black legal-title text-white mb-1">
                Gestão de Ativos
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-legal-secondary/90 font-medium">
                Central de controle para equipamentos e chips
              </p>
            </div>
          </div>
        </div>

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

        {/* Cards de Ações Principais - Agora em carrossel */}
        <div className="relative w-full">
          <div
            ref={scrollContainerRef}
            className="flex space-x-4 sm:space-x-6 overflow-x-auto px-2 sm:px-4"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
            }}
          >
            {/* Card Registrar Ativo */}
            <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-primary/40 cursor-pointer flex flex-col h-full flex-shrink-0 min-w-[85vw] sm:min-w-[45vw] md:min-w-[30vw] lg:min-w-[18rem] xl:min-w-[20rem]"
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
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  Adicione roteadores, switches, cartões SIM e outros equipamentos 
                  com todas as informações técnicas necessárias.
                </p>
                <div className="mt-auto">
                  <Button 
                    variant='outline'
                    className="w-full h-10 sm:h-9 border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white font-bold transition-all duration-200 text-sm" 
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
            <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-secondary/40 cursor-pointer flex flex-col h-full flex-shrink-0 min-w-[85vw] sm:min-w-[45vw] md:min-w-[30vw] lg:min-w-[18rem] xl:min-w-[20rem]"
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
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  Faça a associação entre equipamentos disponíveis e clientes,
                  controlando alocações e devoluções de forma organizada.
                </p>           
                <div className="mt-auto">
                  <Button 
                    variant="outline"
                    className="w-full h-10 sm:h-9 border-legal-secondary text-legal-secondary hover:bg-legal-secondary hover:text-white font-bold transition-all duration-200 text-sm" 
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
            <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-primary/40 cursor-pointer flex flex-col h-full flex-shrink-0 min-w-[85vw] sm:min-w-[45vw] md:min-w-[30vw] lg:min-w-[18rem] xl:min-w-[20rem]"
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
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  Acesse a lista completa de equipamentos associados, 
                  com status detalhado e opções de gerenciamento.
                </p>           
                <div className="mt-auto">
                  <Button 
                    variant="outline"
                    className="w-full h-10 sm:h-9 border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white font-bold transition-all duration-200 text-sm" 
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
            <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-secondary/40 cursor-pointer flex flex-col h-full flex-shrink-0 min-w-[85vw] sm:min-w-[45vw] md:min-w-[30vw] lg:min-w-[18rem] xl:min-w-[20rem]"
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
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  Visualize o histórico completo de movimentações, alterações de status
                  e associações dos equipamentos registrados.
                </p>
                <div className="mt-auto">
                  <Button 
                    variant="outline"
                    className="w-full h-10 sm:h-9 border-legal-secondary text-legal-secondary hover:bg-legal-secondary hover:text-white font-bold transition-all duration-200 text-sm" 
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

            {/* Card Gerenciar Clientes */}
            <Card className="legal-card group hover:shadow-xl transition-all duration-300 border-2 hover:border-legal-primary/40 cursor-pointer flex flex-col h-full flex-shrink-0 min-w-[85vw] sm:min-w-[45vw] md:min-w-[30vw] lg:min-w-[18rem] xl:min-w-[20rem]"
              onClick={() => navigate('/clients')}>
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-legal-primary/10 rounded-lg group-hover:bg-legal-primary/20 transition-colors">
                    <FileUser className="h-5 w-5 sm:h-6 sm:w-6 text-legal-primary" />
                  </div>
                  <CardTitle className="legal-subtitle text-lg sm:text-xl">
                    Gerenciar clientes
                  </CardTitle>
                </div>
                <CardDescription className="legal-text text-sm">
                  Gerencie os clientes cadastrados
                </CardDescription>
              </CardHeader>
              <CardContent className='flex flex-col flex-1'>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  Vizualise e/ou atualize informações dos clientes de forma prática.
                </p>
                <div className="mt-auto">
                  <Button 
                    variant='outline'
                    className="w-full h-10 sm:h-9 border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white font-bold transition-all duration-200 text-sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/clients');
                    }}
                  >
                    <FileUser className="h-4 w-4 mr-2" />
                    Ver Clientes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seta Esquerda */}
          <button
            onClick={handleScrollLeft}
            disabled={isAtStart}
            className={`
              absolute top-1/2 left-0 transform -translate-y-1/2 z-10
              bg-white/90 border border-[#4D2BFB] text-[#4D2BFB]
              hover:bg-white hover:shadow-lg
              rounded-full p-2 sm:p-3
              transition-all duration-200
              ${isAtStart ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
            `}
            aria-label="Scroll para esquerda"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Seta Direita */}
          <button
            onClick={handleScrollRight}
            disabled={isAtEnd}
            className={`
              absolute top-1/2 right-0 transform -translate-y-1/2 z-10
              bg-white/90 border border-[#4D2BFB] text-[#4D2BFB]
              hover:bg-white hover:shadow-lg
              rounded-full p-2 sm:p-3
              transition-all duration-200
              ${isAtEnd ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'}
            `}
            aria-label="Scroll para direita"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default AssetsManagement;
