
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
  Square,
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
  ScrollText,
  BarChart3,
  Boxes,
  KeyRound,
  LogIn,
  ShieldCheck,
  Star
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NavigationModule } from "./NavigationModule";
import { getNavigationModules } from "../navigation-helpers";

interface ExpandedNavigationProps {
  isMobile: boolean;
  onClose?: () => void;
}

export function ExpandedNavigation({ isMobile, onClose }: ExpandedNavigationProps) {
  const location = useLocation();
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({
    'Principal': true,
    'Gestão de Ativos': false,
    'Atendimento': false,
    'Clientes': false,
    'BITS™': false,
    'Rede': false,
    'Ferramentas': false,
    'Administração': false
  });

  // Determine which module to open based on the current route
  useEffect(() => {
    if (location.pathname === "/" || location.pathname.includes("/dashboard")) {
      setOpenModules(prev => ({ ...prev, 'Principal': true }));
    } else if (location.pathname.includes("/assets")) {
      setOpenModules(prev => ({ ...prev, 'Gestão de Ativos': true }));
    } else if (location.pathname.includes("/tickets")) {
      setOpenModules(prev => ({ ...prev, 'Atendimento': true }));
    } else if (location.pathname.includes("/clients")) {
      setOpenModules(prev => ({ ...prev, 'Clientes': true }));
    } else if (location.pathname.includes("/bits")) {
      setOpenModules(prev => ({ ...prev, 'BITS™': true }));
    } else if (location.pathname.includes("/topology")) {
      setOpenModules(prev => ({ ...prev, 'Rede': true }));
    } else if (location.pathname.includes("/tools") || location.pathname.includes("/discovery")) {
      setOpenModules(prev => ({ ...prev, 'Ferramentas': true }));
    } else if (location.pathname.includes("/suppliers")) {
      setOpenModules(prev => ({ ...prev, 'Administração': true }));
    }
  }, [location.pathname]);

  const toggleModule = (moduleTitle: string) => {
    setOpenModules(prev => ({
      ...prev,
      [moduleTitle]: !prev[moduleTitle]
    }));
  };

  const navigationModules = getNavigationModules();

  return (
    <div className="space-y-4">
      {navigationModules.map((module) => (
        <NavigationModule
          key={module.title}
          title={module.title}
          items={module.items}
          isCollapsed={false}
          isExpanded={openModules[module.title]}
          onToggle={() => toggleModule(module.title)}
          requiredRole={module.requiredRole}
          allowedRoles={module.allowedRoles}
        />
      ))}
    </div>
  );
}
