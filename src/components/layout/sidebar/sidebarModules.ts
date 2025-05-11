
import {
  LayoutDashboard,
  Package,
  MonitorSmartphone,
  Wifi,
  Globe,
  Megaphone,
  BrainCircuit,
  Bell,
  DollarSign,
  LineChart,
  BarChart,
  Star,
  Beaker,
  Webhook,
  Settings,
  Users,
  HelpCircle,
  ShieldCheck
} from "lucide-react";
import { SidebarModule } from "./sidebarTypes";

export const sidebarModules: SidebarModule[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    isExpandable: false,
  },
  {
    id: "ativos",
    title: "Ativos",
    icon: Package,
    isExpandable: true,
    subItems: [
      { title: "Inventário", path: "/inventory", icon: Package },
      { title: "Registrar Ativo", path: "/register-asset", icon: Package },
      { title: "Vincular Ativo", path: "/association", icon: Package },
      { title: "Topologia", path: "/topology", icon: Package },
      { title: "Status", path: "/status", icon: Package },
      { title: "Descoberta", path: "/discovery", icon: Package },
      { title: "Exportar", path: "/export", icon: Package },
    ]
  },
  {
    id: "suporte",
    title: "Suporte",
    icon: HelpCircle,
    isExpandable: true,
    subItems: [
      { title: "Dashboard", path: "/support", icon: LayoutDashboard },
      { title: "Acesso Remoto", path: "/remote-access", icon: MonitorSmartphone },
      { title: "Tickets", path: "/tickets", icon: Bell },
      { title: "Playbooks", path: "/playbooks", icon: Package },
      { title: "Auditoria", path: "/audit", icon: ShieldCheck },
    ]
  },
  {
    id: "wifi",
    title: "WiFi",
    icon: Wifi,
    isExpandable: true,
    subItems: [
      { title: "Métricas", path: "/wifi-metrics", icon: LineChart },
      { title: "Heatmap", path: "/wifi-heatmap", icon: Wifi },
      { title: "Relatórios", path: "/wifi-reports", icon: Package },
    ]
  },
  {
    id: "portal",
    title: "Portal",
    icon: Globe,
    isExpandable: true,
    subItems: [
      { title: "Splash Page", path: "/splash-page", icon: Globe },
      { title: "Leads", path: "/leads", icon: Users },
      { title: "Integrações", path: "/portal-integrations", icon: Webhook },
    ]
  },
  {
    id: "campanhas",
    title: "Campanhas",
    icon: Megaphone,
    isExpandable: true,
    subItems: [
      { title: "Disparos", path: "/campaign-sends", icon: Megaphone },
      { title: "Públicos", path: "/campaign-audiences", icon: Users },
      { title: "Resultados", path: "/campaign-results", icon: BarChart },
    ]
  },
  {
    id: "ia",
    title: "IA",
    icon: BrainCircuit,
    isExpandable: true,
    subItems: [
      { title: "Assistente", path: "/ai-assistant", icon: BrainCircuit },
      { title: "Base de Conhecimento", path: "/knowledge-base", icon: Package },
      { title: "Escalonamentos", path: "/ai-escalations", icon: LineChart },
    ]
  },
  {
    id: "alertas",
    title: "Alertas",
    icon: Bell,
    isExpandable: true,
    subItems: [
      { title: "Regras", path: "/alert-rules", icon: Settings },
      { title: "Automação", path: "/alert-automation", icon: Webhook },
      { title: "Tickets", path: "/alert-tickets", icon: Bell },
    ]
  },
  {
    id: "financeiro",
    title: "Financeiro",
    icon: DollarSign,
    isExpandable: true,
    subItems: [
      { title: "Dashboard", path: "/financial", icon: LayoutDashboard },
      { title: "Controller", path: "/controller", icon: DollarSign },
      { title: "Faturas", path: "/invoices", icon: DollarSign },
      { title: "Inadimplência", path: "/default", icon: DollarSign },
    ]
  },
  {
    id: "vendas",
    title: "Vendas",
    icon: LineChart,
    isExpandable: true,
    subItems: [
      { title: "Oportunidades", path: "/opportunities", icon: LineChart },
      { title: "Clientes", path: "/clients", icon: Users },
      { title: "Insights", path: "/sales-insights", icon: BrainCircuit },
    ]
  },
  {
    id: "bits",
    title: "BITS",
    icon: BarChart,
    isExpandable: true,
    subItems: [
      { title: "Dashboard", path: "/bits", icon: LayoutDashboard },
      { title: "Métricas", path: "/bits-metrics", icon: LineChart },
      { title: "Configurações", path: "/bits-settings", icon: Settings },
    ]
  },
  {
    id: "nps",
    title: "NPS",
    icon: Star,
    isExpandable: true,
    subItems: [
      { title: "Dashboard", path: "/nps", icon: LayoutDashboard },
      { title: "Respostas", path: "/nps-responses", icon: Package },
      { title: "Insights", path: "/nps-insights", icon: BrainCircuit },
      { title: "Ações Automatizadas", path: "/nps-actions", icon: Webhook },
      { title: "Configurações", path: "/nps-settings", icon: Settings },
    ]
  },
  {
    id: "lab",
    title: "Lab",
    icon: Beaker,
    isExpandable: true,
    subItems: [
      { title: "Protótipos", path: "/prototypes", icon: Beaker },
      { title: "Testes", path: "/tests", icon: Beaker },
      { title: "Pipeline", path: "/pipeline", icon: Package },
      { title: "Flags", path: "/flags", icon: Bell },
      { title: "Pós-deploy", path: "/post-deploy", icon: Package },
    ]
  },
  {
    id: "integracoes",
    title: "Integrações",
    icon: Webhook,
    isExpandable: true,
    subItems: [
      { title: "APIs", path: "/apis", icon: Webhook },
      { title: "Webhooks", path: "/webhooks", icon: Webhook },
      { title: "SDK", path: "/sdk", icon: Package },
    ]
  },
  {
    id: "admin",
    title: "Admin",
    icon: Settings,
    isExpandable: true,
    subItems: [
      { title: "Configurações", path: "/settings", icon: Settings },
      { title: "Equipe", path: "/team", icon: Users },
      { title: "Versionamento", path: "/versions", icon: Package },
      { title: "Logs", path: "/logs", icon: Package },
      { title: "Métricas", path: "/metrics", icon: BarChart },
      { title: "Traces", path: "/traces", icon: LineChart },
      { title: "IAM", path: "/iam", icon: ShieldCheck },
      { title: "Acessos", path: "/access", icon: ShieldCheck },
      { title: "SSO & MFA", path: "/sso-mfa", icon: ShieldCheck },
    ]
  },
];
