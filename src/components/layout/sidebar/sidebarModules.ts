
import {
  LayoutDashboard,
  Home,
  Network,
  Search,
  Wifi,
  Users,
  Megaphone,
  Wrench,
  Bot,
  AlertTriangle,
  CircleDollarSign,
  BarChart3,
  Link2,
  ShieldCheck,
  BarChart2,
  Rocket,
  Settings,
  Package
} from "lucide-react";
import { SidebarModule } from "./sidebarTypes";

// Define the module structure
export const modules: SidebarModule[] = [
  {
    id: "home",
    title: "Home",
    icon: Home,
    path: "/",
    isExpandable: false
  },
  {
    id: "assets",
    title: "Asset & Network Management",
    icon: Network,
    isExpandable: true,
    subItems: [
      { title: "Devices & Topology", path: "/inventory/assets", icon: Package },
      { title: "Auto Discovery", path: "/inventory/discovery", icon: Search },
      { title: "SLAs & Status", path: "/inventory/status", icon: AlertTriangle }
    ]
  },
  {
    id: "wifi-analytics",
    title: "WiFi Analytics",
    icon: Wifi,
    isExpandable: true,
    subItems: [
      { title: "Usage KPIs", path: "/wifi/usage", icon: BarChart2 },
      { title: "Heatmap", path: "/wifi/heatmap", icon: Wifi },
      { title: "Download Reports", path: "/wifi/reports", icon: BarChart3 }
    ]
  },
  {
    id: "guest-wifi",
    title: "Guest WiFi & Captive Portal",
    icon: Users,
    isExpandable: true,
    subItems: [
      { title: "Splash Page Builder", path: "/guest-wifi/splash", icon: LayoutDashboard },
      { title: "Leads & Login Settings", path: "/guest-wifi/leads", icon: Users },
      { title: "Integrations (PipeRun)", path: "/guest-wifi/integrations", icon: Link2 }
    ]
  },
  {
    id: "wifi-marketing",
    title: "WiFi Marketing",
    icon: Megaphone,
    isExpandable: true,
    subItems: [
      { title: "Campaign Manager", path: "/marketing/campaigns", icon: Megaphone },
      { title: "Audience Segments", path: "/marketing/audience", icon: Users },
      { title: "ROI Dashboard", path: "/marketing/roi", icon: CircleDollarSign }
    ]
  },
  {
    id: "remote-access",
    title: "Remote Access & Support",
    icon: Wrench,
    isExpandable: true,
    subItems: [
      { title: "Equipment Access", path: "/remote-access/equipment", icon: Wrench },
      { title: "Playbook Library", path: "/remote-access/playbooks", icon: LayoutDashboard },
      { title: "Audit Logs", path: "/remote-access/logs", icon: BarChart2 }
    ]
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    icon: Bot,
    isExpandable: true,
    subItems: [
      { title: "Chat & Video Bot", path: "/ai/chat", icon: Bot },
      { title: "RAG Knowledge Base", path: "/ai/knowledge", icon: LayoutDashboard },
      { title: "Escalation Routing", path: "/ai/escalation", icon: Users }
    ]
  },
  {
    id: "predictive-alerts",
    title: "Predictive Alerts",
    icon: AlertTriangle,
    isExpandable: true,
    subItems: [
      { title: "Threshold Rules", path: "/alerts/rules", icon: AlertTriangle },
      { title: "Auto-Ticketing", path: "/alerts/tickets", icon: LayoutDashboard },
      { title: "Corrective Automation", path: "/alerts/automation", icon: Settings }
    ]
  },
  {
    id: "erp-billing",
    title: "ERP & Billing Hub",
    icon: CircleDollarSign,
    isExpandable: true,
    subItems: [
      { title: "Invoices (Superlógica)", path: "/billing/invoices", icon: CircleDollarSign },
      { title: "Delinquency", path: "/billing/delinquency", icon: AlertTriangle },
      { title: "Revenue by BU", path: "/billing/revenue", icon: BarChart3 }
    ]
  },
  {
    id: "crm-sales",
    title: "CRM & Sales Insights",
    icon: BarChart3,
    isExpandable: true,
    subItems: [
      { title: "Automated Opportunities", path: "/crm/opportunities", icon: BarChart3 },
      { title: "360º Customer View", path: "/crm/customers", icon: Users },
      { title: "Cross-sell and Upsell", path: "/crm/upsell", icon: CircleDollarSign }
    ]
  },
  {
    id: "integration-hub",
    title: "Integration Hub",
    icon: Link2,
    isExpandable: true,
    subItems: [
      { title: "API Portal", path: "/integrations/api", icon: Link2 },
      { title: "Webhooks", path: "/integrations/webhooks", icon: Link2 },
      { title: "SDK Downloads", path: "/integrations/sdk", icon: Package }
    ]
  },
  {
    id: "security",
    title: "IAM & Security",
    icon: ShieldCheck,
    isExpandable: true,
    subItems: [
      { title: "Access & Permissions", path: "/security/access", icon: ShieldCheck },
      { title: "SSO & MFA", path: "/security/sso", icon: ShieldCheck },
      { title: "Logs and Secrets", path: "/security/logs", icon: BarChart2 }
    ]
  },
  {
    id: "observability",
    title: "Observability",
    icon: BarChart2,
    isExpandable: true,
    subItems: [
      { title: "Logs", path: "/observability/logs", icon: BarChart2 },
      { title: "Metrics", path: "/observability/metrics", icon: BarChart3 },
      { title: "Tracing", path: "/observability/tracing", icon: Network }
    ]
  },
  {
    id: "devops",
    title: "DevOps & Deploy",
    icon: Rocket,
    isExpandable: true,
    subItems: [
      { title: "Pipelines & Releases", path: "/devops/pipelines", icon: Rocket },
      { title: "Feature Flags", path: "/devops/features", icon: Settings },
      { title: "Post-Deploy Monitoring", path: "/devops/monitoring", icon: AlertTriangle }
    ]
  },
  {
    id: "tools",
    title: "Tools",
    icon: Wrench,
    isExpandable: true,
    subItems: [
      { title: "Register Asset", path: "/register-asset", icon: Package },
      { title: "Link Asset", path: "/association", icon: Link2 },
      { title: "Export Inventory", path: "/export", icon: Package }
    ]
  },
  {
    id: "sandbox",
    title: "Sandbox",
    icon: Wrench,
    isExpandable: true,
    subItems: [
      { title: "Tests & Prototypes", path: "/sandbox", icon: Wrench }
    ]
  },
  {
    id: "admin",
    title: "Admin",
    icon: Settings,
    isExpandable: true,
    subItems: [
      { title: "System Settings", path: "/admin/settings", icon: Settings },
      { title: "Team Management", path: "/admin/team", icon: Users },
      { title: "Versioning", path: "/admin/versions", icon: Package }
    ]
  }
];
