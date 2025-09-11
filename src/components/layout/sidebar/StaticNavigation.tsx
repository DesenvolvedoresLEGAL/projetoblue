
import { useAuth } from "@/context/AuthContext";
import { Award, BarChart3, BookOpen, Bot, Boxes, Camera, ChartColumn, Cog, FileChartColumnIncreasing, FileText, Gift, HardHat, Inbox, KeyRound, LayoutDashboard, LogIn, Package, PackageSearch, PenTool, Plus, PlusCircle, Puzzle, QrCode, ScrollText, Settings, Share2, Shield, ShieldCheck, TrendingUp, User, UserCog, Users, Wrench, Zap } from "lucide-react";
import { NavigationItem } from "./NavigationItem";
import { NavigationModule } from "./NavigationModule";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export function StaticNavigation({
  isMobile = false,
  onClose
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const location = useLocation();
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    dashboard: true, // Dashboard module starts open by default
    setup: false,
    assets: false,
    topology: false,
    tools: false,
    support: false,
    wifi: false,
    portal: false,
    campaigns: false,
    ai: false,
    alerts: false,
    finance: false,
    sales: false,
    bits: false,
    nps: false,
    lab: false,
    integrations: false,
    admin: false
  });

  // Determine which module to open based on the current route
  useEffect(() => {
    if (location.pathname === "/" || location.pathname.includes("/dashboard")) {
      setOpenModules(prev => ({ ...prev, dashboard: true }));
    } else if (location.pathname.includes("/setup")) {
      setOpenModules(prev => ({ ...prev, setup: true }));
    } else if (location.pathname.includes("/assets")) {
      setOpenModules(prev => ({ ...prev, assets: true }));
    } else if (location.pathname.includes("/topology")) {
      setOpenModules(prev => ({ ...prev, topology: true }));
    } else if (
      location.pathname.includes("/tools") ||
      location.pathname.includes("/register-asset") ||
      location.pathname.includes("/discovery") ||
      location.pathname.includes("/export")
    ) {
      setOpenModules(prev => ({ ...prev, tools: true }));
    } else if (location.pathname.includes("/support")) {
      setOpenModules(prev => ({ ...prev, support: true }));
    } else if (location.pathname.includes("/wifi")) {
      setOpenModules(prev => ({ ...prev, wifi: true }));
    } else if (location.pathname.includes("/portal")) {
      setOpenModules(prev => ({ ...prev, portal: true }));
    } else if (location.pathname.includes("/campaigns")) {
      setOpenModules(prev => ({ ...prev, campaigns: true }));
    } else if (location.pathname.includes("/ai")) {
      setOpenModules(prev => ({ ...prev, ai: true }));
    } else if (location.pathname.includes("/alerts")) {
      setOpenModules(prev => ({ ...prev, alerts: true }));
    } else if (location.pathname.includes("/finance")) {
      setOpenModules(prev => ({ ...prev, finance: true }));
    } else if (location.pathname.includes("/sales")) {
      setOpenModules(prev => ({ ...prev, sales: true }));
    } else if (location.pathname.includes("/bits")) {
      setOpenModules(prev => ({ ...prev, bits: true }));
    } else if (location.pathname.includes("/nps")) {
      setOpenModules(prev => ({ ...prev, nps: true }));
    } else if (location.pathname.includes("/lab")) {
      setOpenModules(prev => ({ ...prev, lab: true }));
    } else if (location.pathname.includes("/integrations")) {
      setOpenModules(prev => ({ ...prev, integrations: true }));
    } else if (location.pathname.includes("/admin")) {
      setOpenModules(prev => ({ ...prev, admin: true }));
    }
  }, [location.pathname]);

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const isModuleActive = (paths: string[]) => {
    return paths.some(path => location.pathname.includes(path));
  };

  const { profile } = useAuth();

  return (
    <div className="flex flex-col space-y-6 pt-2">
      {/* Dashboard Section */}
      <div className="flex flex-col space-y-2">
        <div className="px-3 mb-1">
        </div>
        <NavigationItem
          to="/"
          icon={LayoutDashboard}
          label="Visão Geral"
          onClose={isMobile ? onClose : undefined}
        />
      </div>

      {/* Setup Section - Requires suporte or above */}
      <NavigationModule
        id="setup"
        title="Setup"
        icon={Settings}
        isActive={isModuleActive(['/setup'])}
        isOpen={openModules.setup}
        onToggle={() => toggleModule('setup')}
        requiredRole="suporte"
      >
        <NavigationItem
          to="/setup"
          icon={LayoutDashboard}
          label="Dashboard"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/setup/scan"
          icon={QrCode}
          label="Scanner QR"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/setup/orders"
          icon={FileText}
          label="Pedidos"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/setup/execution"
          icon={Wrench}
          label="Setups em Execução"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/setup/evidence"
          icon={Camera}
          label="Evidências"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/setup/signatures"
          icon={PenTool}
          label="Assinaturas"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/setup/technician"
          icon={HardHat}
          label="Painel Técnico"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/setup/supervision"
          icon={ShieldCheck}
          label="Supervisão"
          onClose={isMobile ? onClose : undefined}
          requiredRole="suporte"
        />
        <NavigationItem
          to="/setup/reports"
          icon={BarChart3}
          label="Relatórios"
          onClose={isMobile ? onClose : undefined}
          requiredRole="suporte"
        />
        <NavigationItem
          to="/setup/config"
          icon={Cog}
          label="Configurações"
          onClose={isMobile ? onClose : undefined}
          requiredRole="admin"
        />
      </NavigationModule>

      {/* Assets Section - Requires suporte or above */}
      <NavigationModule
        id="assets"
        title="Ativos"
        icon={Users}
        isActive={isModuleActive(['/assets'])}
        isOpen={openModules.assets}
        onToggle={() => toggleModule('assets')}
        requiredRole="suporte"
      >
        <NavigationItem
          to="/assets/dashboard"
          icon={Package}
          label="Dashboard"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/assets/inventory"
          icon={PackageSearch}
          label="Inventário"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/assets/management"
          icon={FileChartColumnIncreasing}
          label="Gestão"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/assets/register"
          icon={PlusCircle}
          label="Cadastrar"
          onClose={isMobile ? onClose : undefined}
        />
      </NavigationModule>

      {/* Tickets Section - Requires suporte or above */}
      <NavigationModule
        id="tickets"
        title="Tickets"
        icon={Users}
        isActive={isModuleActive(['/tickets'])}
        isOpen={openModules.tickets}
        onToggle={() => toggleModule('tickets')}
        requiredRole="cliente"
      >
        <NavigationItem
          to="/tickets/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          onClose={isMobile ? onClose : undefined}
          requiredRole="suporte"
        />
        <NavigationItem
          to="/tickets/inbox"
          icon={Inbox}
          label="Caixa de Entrada"
          onClose={isMobile ? onClose : undefined}
          requiredRole="suporte"
        />
        <NavigationItem
          to="/tickets/my-tickets"
          icon={User}
          label="Meus Tickets"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/tickets/new"
          icon={Plus}
          label="Novo Ticket"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/tickets/knowledge-base"
          icon={BookOpen}
          label="Base de Conhecimento"
          onClose={isMobile ? onClose : undefined}
          requiredRole="suporte"
        />
        <NavigationItem
          to="/tickets/automation"
          icon={Zap}
          label="Automação e Regras"
          onClose={isMobile ? onClose : undefined}
          requiredRole="suporte"
        />
        <NavigationItem
          to="/tickets/analytics"
          icon={TrendingUp}
          label="Análises & Relatórios"
          onClose={isMobile ? onClose : undefined}
          requiredRole="suporte"
        />
        <NavigationItem
          to="/tickets/quality"
          icon={Shield}
          label="Qualidade & Auditoria"
          onClose={isMobile ? onClose : undefined}
          requiredRole="suporte"
        />
        <NavigationItem
          to="/tickets/copilot"
          icon={Bot}
          label="Copiloto do Agente (IA)"
          onClose={isMobile ? onClose : undefined}
          requiredRole="suporte"
        />
      </NavigationModule>

      {/* BITS Section - Available to cliente or above */}
      <NavigationModule
        id="bits"
        title="Bits"
        icon={Gift}
        isActive={isModuleActive(['/bits'])}
        isOpen={openModules.bits}
        onToggle={() => toggleModule('bits')}
        requiredRole="admin"
      >
        <NavigationItem
          to="/bits"
          icon={ChartColumn}
          label="Dashboard"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/bits/indicate"
          icon={Share2}
          label="Indicar Agora"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/bits/my-referrals"
          icon={Users}
          label="Minhas Indicações"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/bits/rewards"
          icon={Award}
          label="Recompensas"
          onClose={isMobile ? onClose : undefined}
        />
      </NavigationModule>

      {/* Clients Section - Requires suporte or above */}
      <NavigationModule
        id="clients"
        title="Clientes"
        icon={Users}
        isActive={isModuleActive(['/clients'])}
        isOpen={openModules.clients}
        onToggle={() => toggleModule('clients')}
        requiredRole="suporte"
      >
        <NavigationItem
          to="/clients/list"
          icon={User}
          label="Listar"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/clients/register"
          icon={PlusCircle}
          label="Cadastrar"
          onClose={isMobile ? onClose : undefined}
        />
      </NavigationModule>

      {/* Admin Section - Requires admin */}
      <NavigationModule
        id="admin"
        title="Admin"
        icon={Cog}
        isActive={isModuleActive(['/admin'])}
        isOpen={openModules.admin}
        onToggle={() => toggleModule('admin')}
        requiredRole="admin"
      >
        <NavigationItem
          to="/suppliers"
          icon={Boxes}
          label="Fornecedores"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/admin/config"
          icon={Cog}
          label="Configurações"
          onClose={isMobile ? onClose : undefined}
        />
        <NavigationItem
          to="/admin/integrations"
          icon={Puzzle}
          label="Integrações"
          onClose={isMobile ? onClose : undefined}
        />
      </NavigationModule>
    </div>
  );
}
