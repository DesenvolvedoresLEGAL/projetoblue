
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  Building,
  Package,
  Home,
  FileText,
  Network,
  Scan,
  LineChart,
  HelpCircle,
  Ticket,
  Book,
  ClipboardList,
  Thermometer,
  FileBarChart2,
  Laptop,
  Share2,
  SendHorizonal,
  Users2,
  PieChart,
  BrainCircuit,
  BookOpen,
  ArrowUpRightSquare,
  Bell,
  Settings,
  MessagesSquare,
  Banknote,
  Calculator,
  FileSpreadsheet,
  Ban,
  ASquare,
  ShoppingBag,
  LightbulbIcon,
  MonitorSmartphone,
  Gauge,
  Heart,
  MessageSquare,
  FlaskConical,
  Flag,
  SquareDot,
  Workflow,
  Webhook,
  Code,
  Cog,
  UserCog,
  Versions,
  ScrollText,
  BarChart3,
  Boxes,
  KeyRound,
  LogIn,
  ShieldCheck
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavigationItem } from "./NavigationItem";
import { NavigationModule } from "./NavigationModule";

interface ExpandedNavigationProps {
  isMobile: boolean;
  onClose?: () => void;
}

export function ExpandedNavigation({ isMobile, onClose }: ExpandedNavigationProps) {
  const location = useLocation();
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    dashboard: true, // Dashboard module starts open by default
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

  return (
    <>
      {/* Home link */}
      <div className="mb-6">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <NavigationItem 
                to="/"
                icon={Home}
                label="Home"
                onClose={isMobile ? onClose : undefined}
                ariaLabel="Home - Home page"
              />
            </TooltipTrigger>
            <TooltipContent side="right">Home page</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Dashboard Module */}
      <NavigationModule
        id="dashboard"
        title="Dashboard"
        icon={LayoutDashboard}
        description="Overview of your assets, clients, and activities"
        isActive={isModuleActive(['/dashboard'])}
        isOpen={openModules.dashboard}
        onToggle={() => toggleModule('dashboard')}
      >
        <NavigationItem
          to="/dashboard"
          icon={LayoutDashboard}
          label="Main Dashboard"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Dashboard - Overall system overview"
        />
      </NavigationModule>

      {/* Assets Module */}
      <NavigationModule
        id="assets"
        title="Ativos"
        icon={Package}
        description="Manage and monitor all your assets"
        isActive={isModuleActive(['/assets', '/inventory', '/register-asset', '/link-asset'])}
        isOpen={openModules.assets}
        onToggle={() => toggleModule('assets')}
      >
        <NavigationItem
          to="/assets/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Assets Dashboard - Asset status and metrics"
        />

        <NavigationItem
          to="/assets/inventory"
          icon={PackageSearch}
          label="Inventário"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Assets Inventory - Complete asset listing"
        />

        <NavigationItem
          to="/assets/register"
          icon={PlusCircle}
          label="Registrar Ativo"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Register Asset - Add a new asset"
        />

        <NavigationItem
          to="/link-asset"
          icon={LinkIcon}
          label="Vincular Ativo"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Link Asset - Connect asset to a client"
        />

        <NavigationItem
          to="/topology/view"
          icon={Network}
          label="Topologia"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Topology - Network visualization"
        />

        <NavigationItem
          to="/assets/status"
          icon={ActivitySquare}
          label="Status"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Status - Asset status overview"
        />

        <NavigationItem
          to="/tools/discovery"
          icon={Scan}
          label="Descoberta"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Discovery - SNMP/Netconf network scan"
        />

        <NavigationItem
          to="/tools/export"
          icon={FileText}
          label="Exportar"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Export - Export inventory data"
        />
      </NavigationModule>

      {/* Support Module */}
      <NavigationModule
        id="support"
        title="Suporte"
        icon={HelpCircle}
        description="Customer support and help desk"
        isActive={isModuleActive(['/support'])}
        isOpen={openModules.support}
        onToggle={() => toggleModule('support')}
      >
        <NavigationItem
          to="/support/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Support Dashboard"
        />

        <NavigationItem
          to="/support/remote-access"
          icon={Laptop}
          label="Acesso Remoto"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Remote Access"
        />

        <NavigationItem
          to="/support/tickets"
          icon={Ticket}
          label="Tickets"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Support Tickets"
        />

        <NavigationItem
          to="/support/playbooks"
          icon={Book}
          label="Playbooks"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Support Playbooks"
        />

        <NavigationItem
          to="/support/audit"
          icon={ClipboardList}
          label="Auditoria"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Support Audit"
        />
      </NavigationModule>

      {/* WiFi Module */}
      <NavigationModule
        id="wifi"
        title="WiFi"
        icon={Wifi}
        description="WiFi analytics and management"
        isActive={isModuleActive(['/wifi'])}
        isOpen={openModules.wifi}
        onToggle={() => toggleModule('wifi')}
      >
        <NavigationItem
          to="/wifi/metrics"
          icon={LineChart}
          label="Métricas"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="WiFi Metrics"
        />

        <NavigationItem
          to="/wifi/heatmap"
          icon={Thermometer}
          label="Heatmap"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="WiFi Heatmap"
        />

        <NavigationItem
          to="/wifi/reports"
          icon={FileBarChart2}
          label="Relatórios"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="WiFi Reports"
        />
      </NavigationModule>

      {/* Portal Module */}
      <NavigationModule
        id="portal"
        title="Portal"
        icon={Laptop}
        description="Splash page and lead generation"
        isActive={isModuleActive(['/portal'])}
        isOpen={openModules.portal}
        onToggle={() => toggleModule('portal')}
      >
        <NavigationItem
          to="/portal/splash"
          icon={Laptop}
          label="Splash Page"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Portal Splash Page"
        />

        <NavigationItem
          to="/portal/leads"
          icon={Users}
          label="Leads"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Portal Leads"
        />

        <NavigationItem
          to="/portal/integrations"
          icon={Share2}
          label="Integrações"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Portal Integrations"
        />
      </NavigationModule>

      {/* Campaigns Module */}
      <NavigationModule
        id="campaigns"
        title="Campanhas"
        icon={SendHorizonal}
        description="Marketing campaign management"
        isActive={isModuleActive(['/campaigns'])}
        isOpen={openModules.campaigns}
        onToggle={() => toggleModule('campaigns')}
      >
        <NavigationItem
          to="/campaigns/send"
          icon={SendHorizonal}
          label="Disparos"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Campaign Sends"
        />

        <NavigationItem
          to="/campaigns/audiences"
          icon={Users2}
          label="Públicos"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Campaign Audiences"
        />

        <NavigationItem
          to="/campaigns/results"
          icon={PieChart}
          label="Resultados"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Campaign Results"
        />
      </NavigationModule>

      {/* AI Module */}
      <NavigationModule
        id="ai"
        title="IA"
        icon={BrainCircuit}
        description="Artificial intelligence capabilities"
        isActive={isModuleActive(['/ai'])}
        isOpen={openModules.ai}
        onToggle={() => toggleModule('ai')}
      >
        <NavigationItem
          to="/ai/assistant"
          icon={MessagesSquare}
          label="Assistente"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="AI Assistant"
        />

        <NavigationItem
          to="/ai/knowledge-base"
          icon={BookOpen}
          label="Base de Conhecimento"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="AI Knowledge Base"
        />

        <NavigationItem
          to="/ai/escalations"
          icon={ArrowUpRightSquare}
          label="Escalonamentos"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="AI Escalations"
        />
      </NavigationModule>

      {/* Alerts Module */}
      <NavigationModule
        id="alerts"
        title="Alertas"
        icon={Bell}
        description="Alert management and automation"
        isActive={isModuleActive(['/alerts'])}
        isOpen={openModules.alerts}
        onToggle={() => toggleModule('alerts')}
      >
        <NavigationItem
          to="/alerts/rules"
          icon={Settings}
          label="Regras"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Alert Rules"
        />

        <NavigationItem
          to="/alerts/automation"
          icon={Settings}
          label="Automação"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Alert Automation"
        />

        <NavigationItem
          to="/alerts/tickets"
          icon={Ticket}
          label="Tickets"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Alert Tickets"
        />
      </NavigationModule>

      {/* Finance Module */}
      <NavigationModule
        id="finance"
        title="Financeiro"
        icon={Banknote}
        description="Financial management and reporting"
        isActive={isModuleActive(['/finance'])}
        isOpen={openModules.finance}
        onToggle={() => toggleModule('finance')}
      >
        <NavigationItem
          to="/finance/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Finance Dashboard"
        />

        <NavigationItem
          to="/finance/controller"
          icon={Calculator}
          label="Controller"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Finance Controller"
        />

        <NavigationItem
          to="/finance/invoices"
          icon={FileSpreadsheet}
          label="Faturas"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Finance Invoices"
        />

        <NavigationItem
          to="/finance/debt"
          icon={Ban}
          label="Inadimplência"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Finance Debt"
        />
      </NavigationModule>

      {/* Sales Module */}
      <NavigationModule
        id="sales"
        title="Vendas"
        icon={ShoppingBag}
        description="Sales management and CRM"
        isActive={isModuleActive(['/sales'])}
        isOpen={openModules.sales}
        onToggle={() => toggleModule('sales')}
      >
        <NavigationItem
          to="/sales/opportunities"
          icon={ASquare}
          label="Oportunidades"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Sales Opportunities"
        />

        <NavigationItem
          to="/sales/clients"
          icon={Users}
          label="Clientes"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Sales Clients"
        />

        <NavigationItem
          to="/sales/insights"
          icon={LightbulbIcon}
          label="Insights"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Sales Insights"
        />
      </NavigationModule>

      {/* BITS Module */}
      <NavigationModule
        id="bits"
        title="BITS"
        icon={MonitorSmartphone}
        description="BITS platform integration"
        isActive={isModuleActive(['/bits'])}
        isOpen={openModules.bits}
        onToggle={() => toggleModule('bits')}
      >
        <NavigationItem
          to="/bits/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="BITS Dashboard"
        />

        <NavigationItem
          to="/bits/metrics"
          icon={Gauge}
          label="Métricas"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="BITS Metrics"
        />

        <NavigationItem
          to="/bits/settings"
          icon={Settings}
          label="Configurações"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="BITS Settings"
        />
      </NavigationModule>

      {/* NPS Module */}
      <NavigationModule
        id="nps"
        title="NPS"
        icon={Heart}
        description="Net Promoter Score management"
        isActive={isModuleActive(['/nps'])}
        isOpen={openModules.nps}
        onToggle={() => toggleModule('nps')}
      >
        <NavigationItem
          to="/nps/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="NPS Dashboard"
        />

        <NavigationItem
          to="/nps/responses"
          icon={MessageSquare}
          label="Respostas"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="NPS Responses"
        />

        <NavigationItem
          to="/nps/insights"
          icon={LightbulbIcon}
          label="Insights"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="NPS Insights"
        />

        <NavigationItem
          to="/nps/automated-actions"
          icon={Settings}
          label="Ações Automatizadas"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="NPS Automated Actions"
        />

        <NavigationItem
          to="/nps/settings"
          icon={Settings}
          label="Configurações"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="NPS Settings"
        />
      </NavigationModule>

      {/* Lab Module */}
      <NavigationModule
        id="lab"
        title="Lab"
        icon={FlaskConical}
        description="Research and experimentation"
        isActive={isModuleActive(['/lab'])}
        isOpen={openModules.lab}
        onToggle={() => toggleModule('lab')}
      >
        <NavigationItem
          to="/lab/prototypes"
          icon={FlaskConical}
          label="Protótipos"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Lab Prototypes"
        />

        <NavigationItem
          to="/lab/tests"
          icon={ClipboardList}
          label="Testes"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Lab Tests"
        />

        <NavigationItem
          to="/lab/pipeline"
          icon={Workflow}
          label="Pipeline"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Lab Pipeline"
        />

        <NavigationItem
          to="/lab/flags"
          icon={Flag}
          label="Flags"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Lab Flags"
        />

        <NavigationItem
          to="/lab/post-deploy"
          icon={SquareDot}
          label="Pós-deploy"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Lab Post-deploy"
        />
      </NavigationModule>

      {/* Integrations Module */}
      <NavigationModule
        id="integrations"
        title="Integrações"
        icon={Share2}
        description="API and integration management"
        isActive={isModuleActive(['/integrations'])}
        isOpen={openModules.integrations}
        onToggle={() => toggleModule('integrations')}
      >
        <NavigationItem
          to="/integrations/apis"
          icon={Code}
          label="APIs"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Integration APIs"
        />

        <NavigationItem
          to="/integrations/webhooks"
          icon={Webhook}
          label="Webhooks"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Integration Webhooks"
        />

        <NavigationItem
          to="/integrations/sdk"
          icon={Code}
          label="SDK"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Integration SDK"
        />
      </NavigationModule>

      {/* Admin Module */}
      <NavigationModule
        id="admin"
        title="Admin"
        icon={Cog}
        description="System administration"
        isActive={isModuleActive(['/admin'])}
        isOpen={openModules.admin}
        onToggle={() => toggleModule('admin')}
      >
        <NavigationItem
          to="/admin/settings"
          icon={Settings}
          label="Configurações"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Admin Settings"
        />

        <NavigationItem
          to="/admin/team"
          icon={UserCog}
          label="Equipe"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Admin Team"
        />

        <NavigationItem
          to="/admin/versioning"
          icon={Versions}
          label="Versionamento"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Admin Versioning"
        />

        <NavigationItem
          to="/admin/logs"
          icon={ScrollText}
          label="Logs"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Admin Logs"
        />

        <NavigationItem
          to="/admin/metrics"
          icon={BarChart3}
          label="Métricas"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Admin Metrics"
        />

        <NavigationItem
          to="/admin/traces"
          icon={Boxes}
          label="Traces"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Admin Traces"
        />

        <NavigationItem
          to="/admin/iam"
          icon={KeyRound}
          label="IAM"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Admin IAM"
        />

        <NavigationItem
          to="/admin/access"
          icon={LogIn}
          label="Acessos"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Admin Access"
        />

        <NavigationItem
          to="/admin/sso-mfa"
          icon={ShieldCheck}
          label="SSO & MFA"
          onClose={isMobile ? onClose : undefined}
          ariaLabel="Admin SSO & MFA"
        />
      </NavigationModule>
    </>
  );
}
