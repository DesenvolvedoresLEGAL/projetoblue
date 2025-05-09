
import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  PackageSearch,
  Users,
  Link as LinkIcon,
  Clock,
  ActivitySquare,
  History,
  Database,
  Wifi,
  Package,
  Building,
  ChevronDown,
  ChevronRight,
  Home,
  X
} from "lucide-react";
import { NamedLogo } from "@/components/ui/namedlogo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface ModularSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function ModularSidebar({ isMobile = false, onClose }: ModularSidebarProps) {
  const location = useLocation();
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    inventario: true, // Inventário module starts open by default
    gestao: false,
    monitoramento: false,
    outras: false
  });

  // Determine which module to open based on the current route
  useEffect(() => {
    if (location.pathname.startsWith("/inventario")) {
      setOpenModules(prev => ({ ...prev, inventario: true }));
    } else if (location.pathname.includes("/assinaturas")) {
      setOpenModules(prev => ({ ...prev, gestao: true }));
    } else if (location.pathname.includes("/historico") || location.pathname.includes("/monitoramento")) {
      setOpenModules(prev => ({ ...prev, monitoramento: true }));
    } else if (location.pathname.includes("/register-asset") || location.pathname.includes("/association") || 
               location.pathname.includes("/data-usage") || location.pathname.includes("/wifi-analyzer")) {
      setOpenModules(prev => ({ ...prev, outras: true }));
    }
  }, [location.pathname]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const isModuleActive = (paths: string[]) => {
    return paths.some(path => location.pathname.startsWith(path));
  };

  return (
    <div className={cn(
      "h-screen flex-shrink-0 bg-sidebar border-r flex flex-col",
      isMobile ? "w-full max-w-xs rounded-r-lg" : "w-64"
    )}>
      <div className="flex h-16 items-center border-b px-4 justify-between">
        <NamedLogo size="sm" />
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Fechar menu"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar menu</span>
          </Button>
        )}
      </div>
      
      <nav className="flex-1 overflow-auto py-4 px-3" role="navigation" aria-label="Menu de navegação principal">
        {/* Home link */}
        <div className="mb-6">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  aria-label="Home - Página inicial"
                  onClick={isMobile ? onClose : undefined}
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">Página inicial</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Módulo 1 - Inventário */}
        <div className="mb-4">
          <Collapsible
            open={openModules.inventario}
            onOpenChange={() => toggleModule('inventario')}
            className="w-full"
          >
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                isModuleActive(['/inventario']) 
                  ? "bg-sidebar-accent/25 text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              aria-label={`${openModules.inventario ? 'Recolher' : 'Expandir'} módulo de Inventário`}
              aria-expanded={openModules.inventario}
              aria-controls="inventario-menu"
            >
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-sidebar-foreground/70" />
                <span className="font-medium text-sidebar-foreground/90">Inventário</span>
              </div>
              {openModules.inventario ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pl-3 pt-1" id="inventario-menu">
              <p className="text-xs text-sidebar-foreground/60 px-3 mb-3">
                Gerencie e monitore seus ativos, clientes, fornecedores e assinaturas
              </p>
              
              <div className="flex flex-col gap-1">
                <NavLink
                  to="/inventario/dashboard"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  aria-label="Dashboard - Visão geral do inventário"
                  onClick={isMobile ? onClose : undefined}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/inventario/ativos"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  aria-label="Ativos - Gerenciamento de equipamentos e chips"
                  onClick={isMobile ? onClose : undefined}
                >
                  <PackageSearch className="h-4 w-4" />
                  <span>Ativos</span>
                </NavLink>

                <NavLink
                  to="/inventario/clientes"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  aria-label="Clientes - Gestão de dados dos clientes"
                  onClick={isMobile ? onClose : undefined}
                >
                  <Users className="h-4 w-4" />
                  <span>Clientes</span>
                </NavLink>

                <NavLink
                  to="/inventario/fornecedores"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  aria-label="Fornecedores - Gestão de fabricantes e parceiros"
                  onClick={isMobile ? onClose : undefined}
                >
                  <Building className="h-4 w-4" />
                  <span>Fornecedores</span>
                </NavLink>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Módulo 2 - Gestão de Assinaturas */}
        <div className="mb-4">
          <Collapsible
            open={openModules.gestao}
            onOpenChange={() => toggleModule('gestao')}
            className="w-full"
          >
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                isModuleActive(['/inventario/assinaturas']) 
                  ? "bg-sidebar-accent/25 text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              aria-label={`${openModules.gestao ? 'Recolher' : 'Expandir'} módulo de Gestão`}
              aria-expanded={openModules.gestao}
              aria-controls="gestao-menu"
            >
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-sidebar-foreground/70" />
                <span className="font-medium text-sidebar-foreground/90">Gestão de Assinaturas</span>
              </div>
              {openModules.gestao ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pl-3 pt-1" id="gestao-menu">
              <p className="text-xs text-sidebar-foreground/60 px-3 mb-3">
                Controle de planos e contratos
              </p>
              
              <div className="flex flex-col gap-1">
                <NavLink
                  to="/inventario/assinaturas"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  aria-label="Assinaturas - Controle de planos e contratos"
                  onClick={isMobile ? onClose : undefined}
                >
                  <Clock className="h-4 w-4" />
                  <span>Assinaturas</span>
                </NavLink>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Módulo 3 - Monitoramento */}
        <div className="mb-4">
          <Collapsible
            open={openModules.monitoramento}
            onOpenChange={() => toggleModule('monitoramento')}
            className="w-full"
          >
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                isModuleActive(['/inventario/historico', '/inventario/monitoramento']) 
                  ? "bg-sidebar-accent/25 text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              aria-label={`${openModules.monitoramento ? 'Recolher' : 'Expandir'} módulo de Monitoramento`}
              aria-expanded={openModules.monitoramento}
              aria-controls="monitoramento-menu"
            >
              <div className="flex items-center gap-2">
                <ActivitySquare className="h-5 w-5 text-sidebar-foreground/70" />
                <span className="font-medium text-sidebar-foreground/90">Monitoramento</span>
              </div>
              {openModules.monitoramento ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pl-3 pt-1" id="monitoramento-menu">
              <p className="text-xs text-sidebar-foreground/60 px-3 mb-3">
                Acompanhamento e registro de atividades
              </p>
              
              <div className="flex flex-col gap-1">
                <NavLink
                  to="/inventario/historico"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  aria-label="Histórico - Registro de atividades e eventos"
                  onClick={isMobile ? onClose : undefined}
                >
                  <History className="h-4 w-4" />
                  <span>Histórico</span>
                </NavLink>

                <NavLink
                  to="/inventario/monitoramento"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  aria-label="Monitoramento - Acompanhamento em tempo real"
                  onClick={isMobile ? onClose : undefined}
                >
                  <ActivitySquare className="h-4 w-4" />
                  <span>Monitoramento</span>
                </NavLink>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Módulo 4 - Outras Funcionalidades */}
        <div className="mb-4">
          <Collapsible
            open={openModules.outras}
            onOpenChange={() => toggleModule('outras')}
            className="w-full"
          >
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                isModuleActive(['/register-asset', '/association', '/data-usage', '/wifi-analyzer']) 
                  ? "bg-sidebar-accent/25 text-sidebar-accent-foreground font-medium" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              aria-label={`${openModules.outras ? 'Recolher' : 'Expandir'} outras funcionalidades`}
              aria-expanded={openModules.outras}
              aria-controls="outras-menu"
            >
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-sidebar-foreground/70" />
                <span className="font-medium text-sidebar-foreground/90">Outras Funcionalidades</span>
              </div>
              {openModules.outras ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pl-3 pt-1" id="outras-menu">
              <p className="text-xs text-sidebar-foreground/60 px-3 mb-3">
                Ferramentas e funcionalidades adicionais
              </p>
              
              <div className="flex flex-col gap-1">
                <NavLink
                  to="/register-asset"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  onClick={isMobile ? onClose : undefined}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Cadastrar Ativo</span>
                </NavLink>
                
                <NavLink
                  to="/association"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  onClick={isMobile ? onClose : undefined}
                >
                  <LinkIcon className="h-4 w-4" />
                  <span>Vincular Ativos</span>
                </NavLink>
                
                <NavLink
                  to="/data-usage"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  onClick={isMobile ? onClose : undefined}
                >
                  <Database className="h-4 w-4" />
                  <span>Consumo de Dados</span>
                </NavLink>
                
                <NavLink
                  to="/wifi-analyzer"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`
                  }
                  onClick={isMobile ? onClose : undefined}
                >
                  <Wifi className="h-4 w-4" />
                  <span>WiFi Analyzer</span>
                </NavLink>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </nav>
      
      <div className="border-t p-4 mt-auto">
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} - Telecom Asset Nexus
          <br />
          Ver. 2.0
        </div>
      </div>
    </div>
  );
}
