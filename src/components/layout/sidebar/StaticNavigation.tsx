
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Link2, 
  BarChart3,
  Wrench,
  Network,
  HeadphonesIcon,
  Gift,
  ChevronDown,
  ChevronRight,
  Ticket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavigationItem } from "./NavigationItem";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface StaticNavigationProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export function StaticNavigation({ isMobile = false, onClose }: StaticNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    assets: location.pathname.startsWith('/assets'),
    tickets: location.pathname.startsWith('/tickets'),
    bits: location.pathname.startsWith('/bits'),
    tools: location.pathname.startsWith('/tools'),
    topology: location.pathname.startsWith('/topology'),
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleItemClick = (path: string) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className="space-y-2">
      {/* Dashboard Principal */}
      <NavigationItem
        icon={LayoutDashboard}
        label="Dashboard"
        path="/"
        isActive={location.pathname === "/"}
        onClick={() => handleItemClick("/")}
      />

      {/* Módulo de Ativos */}
      <Collapsible 
        open={expandedSections.assets} 
        onOpenChange={() => toggleSection('assets')}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between h-10 px-3 text-left font-normal",
              location.pathname.startsWith('/assets') && "bg-accent text-accent-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4" />
              <span>Ativos</span>
            </div>
            {expandedSections.assets ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-4 space-y-1">
          <NavigationItem
            label="Gerenciamento"
            path="/assets/management"
            isActive={location.pathname === "/assets/management" || location.pathname === "/assets"}
            onClick={() => handleItemClick("/assets/management")}
            isSubItem
          />
          <NavigationItem
            label="Inventário"
            path="/assets/inventory"
            isActive={location.pathname === "/assets/inventory"}
            onClick={() => handleItemClick("/assets/inventory")}
            isSubItem
          />
          <NavigationItem
            label="Registrar Ativo"
            path="/assets/register"
            isActive={location.pathname === "/assets/register"}
            onClick={() => handleItemClick("/assets/register")}
            isSubItem
          />
          <NavigationItem
            label="Associações"
            path="/assets/associations"
            isActive={location.pathname === "/assets/associations"}
            onClick={() => handleItemClick("/assets/associations")}
            isSubItem
          />
          <NavigationItem
            label="Histórico"
            path="/assets/history"
            isActive={location.pathname === "/assets/history"}
            onClick={() => handleItemClick("/assets/history")}
            isSubItem
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Módulo de Tickets */}
      <Collapsible 
        open={expandedSections.tickets} 
        onOpenChange={() => toggleSection('tickets')}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between h-10 px-3 text-left font-normal",
              location.pathname.startsWith('/tickets') && "bg-accent text-accent-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <Ticket className="h-4 w-4" />
              <span>Tickets</span>
            </div>
            {expandedSections.tickets ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-4 space-y-1">
          <NavigationItem
            label="Visão Geral"
            path="/tickets/overview"
            isActive={location.pathname === "/tickets/overview" || location.pathname === "/tickets"}
            onClick={() => handleItemClick("/tickets/overview")}
            isSubItem
          />
          <NavigationItem
            label="Caixa de Entrada"
            path="/tickets/inbox"
            isActive={location.pathname === "/tickets/inbox"}
            onClick={() => handleItemClick("/tickets/inbox")}
            isSubItem
          />
          <NavigationItem
            label="Meus Tickets"
            path="/tickets/my-tickets"
            isActive={location.pathname === "/tickets/my-tickets"}
            onClick={() => handleItemClick("/tickets/my-tickets")}
            isSubItem
          />
          <NavigationItem
            label="Novo Ticket"
            path="/tickets/new"
            isActive={location.pathname === "/tickets/new"}
            onClick={() => handleItemClick("/tickets/new")}
            isSubItem
          />
          <NavigationItem
            label="Base de Conhecimento"
            path="/tickets/knowledge-base"
            isActive={location.pathname === "/tickets/knowledge-base"}
            onClick={() => handleItemClick("/tickets/knowledge-base")}
            isSubItem
          />
          <NavigationItem
            label="Automação"
            path="/tickets/automation"
            isActive={location.pathname === "/tickets/automation"}
            onClick={() => handleItemClick("/tickets/automation")}
            isSubItem
          />
          <NavigationItem
            label="Análises"
            path="/tickets/analytics"
            isActive={location.pathname === "/tickets/analytics"}
            onClick={() => handleItemClick("/tickets/analytics")}
            isSubItem
          />
          <NavigationItem
            label="Qualidade"
            path="/tickets/quality"
            isActive={location.pathname === "/tickets/quality"}
            onClick={() => handleItemClick("/tickets/quality")}
            isSubItem
          />
          <NavigationItem
            label="Copiloto IA"
            path="/tickets/copilot"
            isActive={location.pathname === "/tickets/copilot"}
            onClick={() => handleItemClick("/tickets/copilot")}
            isSubItem
          />
          <NavigationItem
            label="Integrações"
            path="/tickets/integrations"
            isActive={location.pathname === "/tickets/integrations"}
            onClick={() => handleItemClick("/tickets/integrations")}
            isSubItem
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Clientes */}
      <NavigationItem
        icon={Users}
        label="Clientes"
        path="/clients"
        isActive={location.pathname.startsWith('/clients')}
        onClick={() => handleItemClick("/clients")}
      />

      {/* Associações */}
      <NavigationItem
        icon={Link2}
        label="Associações"
        path="/assets/associations-list"
        isActive={location.pathname === "/assets/associations-list"}
        onClick={() => handleItemClick("/assets/associations-list")}
      />

      {/* Monitoramento */}
      <NavigationItem
        icon={BarChart3}
        label="Monitoramento"
        path="/monitoring"
        isActive={location.pathname === "/monitoring"}
        onClick={() => handleItemClick("/monitoring")}
      />

      {/* Uso de Dados */}
      <NavigationItem
        icon={BarChart3}
        label="Uso de Dados"
        path="/data-usage"
        isActive={location.pathname === "/data-usage"}
        onClick={() => handleItemClick("/data-usage")}
      />

      {/* Topologia */}
      <Collapsible 
        open={expandedSections.topology} 
        onOpenChange={() => toggleSection('topology')}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between h-10 px-3 text-left font-normal",
              location.pathname.startsWith('/topology') && "bg-accent text-accent-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <Network className="h-4 w-4" />
              <span>Topologia</span>
            </div>
            {expandedSections.topology ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-4 space-y-1">
          <NavigationItem
            label="Visualizar"
            path="/topology/view"
            isActive={location.pathname === "/topology/view" || location.pathname === "/topology"}
            onClick={() => handleItemClick("/topology/view")}
            isSubItem
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Ferramentas */}
      <Collapsible 
        open={expandedSections.tools} 
        onOpenChange={() => toggleSection('tools')}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between h-10 px-3 text-left font-normal",
              location.pathname.startsWith('/tools') && "bg-accent text-accent-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <Wrench className="h-4 w-4" />
              <span>Ferramentas</span>
            </div>
            {expandedSections.tools ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-4 space-y-1">
          <NavigationItem
            label="Discovery"
            path="/tools/discovery"
            isActive={location.pathname === "/tools/discovery" || location.pathname === "/tools"}
            onClick={() => handleItemClick("/tools/discovery")}
            isSubItem
          />
          <NavigationItem
            label="WiFi Analyzer"
            path="/wifi-analyzer"
            isActive={location.pathname === "/wifi-analyzer"}
            onClick={() => handleItemClick("/wifi-analyzer")}
            isSubItem
          />
        </CollapsibleContent>
      </Collapsible>

      {/* BITS™ */}
      <Collapsible 
        open={expandedSections.bits} 
        onOpenChange={() => toggleSection('bits')}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between h-10 px-3 text-left font-normal",
              location.pathname.startsWith('/bits') && "bg-accent text-accent-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <Gift className="h-4 w-4" />
              <span>BITS™</span>
            </div>
            {expandedSections.bits ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-4 space-y-1">
          <NavigationItem
            label="Dashboard"
            path="/bits"
            isActive={location.pathname === "/bits"}
            onClick={() => handleItemClick("/bits")}
            isSubItem
          />
          <NavigationItem
            label="Indicar Agora"
            path="/bits/indicate"
            isActive={location.pathname === "/bits/indicate"}
            onClick={() => handleItemClick("/bits/indicate")}
            isSubItem
          />
          <NavigationItem
            label="Meus Indicados"
            path="/bits/my-referrals"
            isActive={location.pathname === "/bits/my-referrals"}
            onClick={() => handleItemClick("/bits/my-referrals")}
            isSubItem
          />
          <NavigationItem
            label="Pontos & Recompensas"
            path="/bits/rewards"
            isActive={location.pathname === "/bits/rewards"}
            onClick={() => handleItemClick("/bits/rewards")}
            isSubItem
          />
          <NavigationItem
            label="Configurações"
            path="/bits/settings"
            isActive={location.pathname === "/bits/settings"}
            onClick={() => handleItemClick("/bits/settings")}
            isSubItem
          />
          <NavigationItem
            label="Ajuda & Suporte"
            path="/bits/help"
            isActive={location.pathname === "/bits/help"}
            onClick={() => handleItemClick("/bits/help")}
            isSubItem
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Outros */}
      <NavigationItem
        icon={HeadphonesIcon}
        label="Assinaturas"
        path="/subscriptions"
        isActive={location.pathname === "/subscriptions"}
        onClick={() => handleItemClick("/subscriptions")}
      />
    </div>
  );
}
