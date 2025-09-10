
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  PackageSearch,
  Users,
  Link,
  Clock,
  ActivitySquare,
  History,
  Database,
  Wifi,
  Package,
  Building,
  Settings,
  QrCode,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NamedLogo } from "@/components/ui/namedlogo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const location = useLocation();
  const { hasMinimumRole, userRole, isAuthenticated, user, profile } = useAuth();

  // Temporary debug - REMOVER DEPOIS
  console.log('🔍 DEBUG SIDEBAR:', {
    isAuthenticated,
    userRole,
    hasSuporteRole: hasMinimumRole('suporte'),
    user: user?.email,
    profile: profile?.role,
    hasMinimumRoleFunction: !!hasMinimumRole
  });

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 h-screen flex-shrink-0 bg-sidebar border-r">
      <div className="flex h-16 items-center border-b px-4">
        <NamedLogo size="sm" />
      </div>
      
      {/* TEMPORARY DEBUG - REMOVER DEPOIS */}
      <div className="px-4 py-2 bg-red-100 text-red-800 text-xs">
        <div>🔍 DEBUG AUTH:</div>
        <div>Autenticado: {isAuthenticated ? 'SIM' : 'NÃO'}</div>
        <div>Role: {userRole || 'undefined'}</div>
        <div>hasMinimumRole(suporte): {hasMinimumRole('suporte') ? 'SIM' : 'NÃO'}</div>
        <div>User: {user?.email || 'não logado'}</div>
        <div>Profile: {profile?.role || 'sem perfil'}</div>
      </div>
      
      <nav className="flex-1 overflow-auto py-4 px-3">
        {/* Módulo 1 - Inventário */}
        <div className="mb-6">
          <div className="flex items-center gap-2 px-3 mb-2">
            <Package className="h-5 w-5 text-sidebar-foreground/70" />
            <span className="font-medium text-sidebar-foreground/90">Inventário</span>
          </div>
          <p className="text-xs text-sidebar-foreground/60 px-3 mb-3">
            Gerencie e monitore seus ativos, clientes, fornecedores e assinaturas
          </p>
          
          <div className="flex flex-col gap-1">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/"
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive("/")
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                    aria-label="Dashboard - Visão geral do inventário"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">Visão geral do inventário</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/inventory"
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive("/inventory")
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                    aria-label="Ativos - Gerenciamento de equipamentos e chips"
                  >
                    <PackageSearch className="h-4 w-4" />
                    <span>Ativos</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">Gerenciamento de equipamentos e chips</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/clients"
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive("/clients")
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                    aria-label="Clientes - Gestão de dados dos clientes"
                  >
                    <Users className="h-4 w-4" />
                    <span>Clientes</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">Gestão de dados dos clientes</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/suppliers"
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive("/suppliers")
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                    aria-label="Fornecedores - Gestão de fabricantes e parceiros"
                  >
                    <Building className="h-4 w-4" />
                    <span>Fornecedores</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">Gestão de fabricantes e parceiros</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/subscriptions"
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive("/subscriptions")
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                    aria-label="Assinaturas - Controle de planos e contratos"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Assinaturas</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">Controle de planos e contratos</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/history"
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive("/history")
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                    aria-label="Histórico - Registro de atividades e eventos"
                  >
                    <History className="h-4 w-4" />
                    <span>Histórico</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">Registro de atividades e eventos</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/monitoring"
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive("/monitoring")
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                    aria-label="Monitoramento - Acompanhamento em tempo real"
                  >
                    <ActivitySquare className="h-4 w-4" />
                    <span>Monitoramento</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">Acompanhamento em tempo real</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Módulo 2 - Setup (Instalações) - Apenas para suporte ou admin */}
        {isAuthenticated && hasMinimumRole && hasMinimumRole('suporte') && (
          <div className="mb-6">
            <div className="flex items-center gap-2 px-3 mb-2">
              <Settings className="h-5 w-5 text-sidebar-foreground/70" />
              <span className="font-medium text-sidebar-foreground/90">Setup</span>
            </div>
            <p className="text-xs text-sidebar-foreground/60 px-3 mb-3">
              Gerencie instalações, desinstalações e evidências
            </p>
            
            <div className="flex flex-col gap-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to="/setup"
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive("/setup") || location.pathname.startsWith("/setup")
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`}
                      aria-label="Setup Dashboard - Painel do técnico"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right">Painel do técnico</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to="/setup/scan"
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive("/setup/scan")
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      }`}
                      aria-label="Scanner QR - Iniciar instalação"
                    >
                      <QrCode className="h-4 w-4" />
                      <span>Scanner QR</span>
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right">Iniciar instalação via QR Code</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}

        {/* Módulo 3 - Operacional (Links existentes) */}
        <div className="mb-6">
          <div className="flex items-center gap-2 px-3 mb-2">
            <ActivitySquare className="h-5 w-5 text-sidebar-foreground/70" />
            <span className="font-medium text-sidebar-foreground/90">Operacional</span>
          </div>
          <p className="text-xs text-sidebar-foreground/60 px-3 mb-3">
            Ferramentas operacionais e de suporte
          </p>
          
          <div className="flex flex-col gap-1">
          <NavLink
            to="/register-asset"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              isActive("/register-asset")
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Cadastrar Ativo</span>
          </NavLink>
          
          <NavLink
            to="/association"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              isActive("/association")
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            }`}
          >
            <Link className="h-4 w-4" />
            <span>Vincular Ativos</span>
          </NavLink>
          
          <NavLink
            to="/data-usage"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              isActive("/data-usage")
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Consumo de Dados</span>
          </NavLink>
          
          <NavLink
            to="/wifi-analyzer"
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
              isActive("/wifi-analyzer")
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            }`}
          >
            <Wifi className="h-4 w-4" />
            <span>WiFi Analyzer</span>
          </NavLink>
          </div>
        </div>
      </nav>
      
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} - Telecom Asset Nexus
          <br />
          Ver. 2.0
        </div>
      </div>
    </div>
  );
}
