
import { NavLink } from "react-router-dom";
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
  Home,
  Package,
  FileText,
  Network,
  Scan,
  HelpCircle,
  Laptop,
  SendHorizonal,
  BrainCircuit,
  Bell,
  Banknote,
  ShoppingBag,
  MonitorSmartphone,
  Heart,
  FlaskConical,
  Share2,
  Cog
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function CollapsedNavigation() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Home</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Dashboard</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/assets"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Package className="h-5 w-5" />
              <span className="sr-only">Ativos</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Ativos</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/support"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Suporte</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Suporte</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/wifi"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Wifi className="h-5 w-5" />
              <span className="sr-only">WiFi</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">WiFi</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/portal"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Laptop className="h-5 w-5" />
              <span className="sr-only">Portal</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Portal</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/campaigns"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <SendHorizonal className="h-5 w-5" />
              <span className="sr-only">Campanhas</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Campanhas</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/ai"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <BrainCircuit className="h-5 w-5" />
              <span className="sr-only">IA</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">IA</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Bell className="h-5 w-5" />
              <span className="sr-only">Alertas</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Alertas</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/finance"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Banknote className="h-5 w-5" />
              <span className="sr-only">Financeiro</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Financeiro</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/sales"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Vendas</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Vendas</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/bits"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <MonitorSmartphone className="h-5 w-5" />
              <span className="sr-only">BITS</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">BITS</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/nps"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Heart className="h-5 w-5" />
              <span className="sr-only">NPS</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">NPS</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/lab"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <FlaskConical className="h-5 w-5" />
              <span className="sr-only">Lab</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Lab</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/integrations"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Share2 className="h-5 w-5" />
              <span className="sr-only">Integrações</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Integrações</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "flex items-center justify-center rounded-md p-2 transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <Cog className="h-5 w-5" />
              <span className="sr-only">Admin</span>
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">Admin</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
