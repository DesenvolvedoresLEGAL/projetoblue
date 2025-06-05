
import { useState } from "react";
import { useLocation } from "react-router-dom";
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

  return (
    <div className="space-y-2">
      {/* Dashboard Principal */}
      <NavigationItem
        to="/"
        icon={LayoutDashboard}
        label="Dashboard"
        onClose={onClose}
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
            to="/assets/management"
            icon={Package}
            label="Gerenciamento"
            onClose={onClose}
          />
          <NavigationItem
            to="/assets/inventory"
            icon={Package}
            label="Inventário"
            onClose={onClose}
          />
          <NavigationItem
            to="/assets/register"
            icon={Package}
            label="Registrar Ativo"
            onClose={onClose}
          />
          <NavigationItem
            to="/assets/associations"
            icon={Package}
            label="Associações"
            onClose={onClose}
          />
          <NavigationItem
            to="/assets/history"
            icon={Package}
            label="Histórico"
            onClose={onClose}
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
            to="/tickets/overview"
            icon={Ticket}
            label="Visão Geral"
            onClose={onClose}
          />
          <NavigationItem
            to="/tickets/inbox"
            icon={Ticket}
            label="Caixa de Entrada"
            onClose={onClose}
          />
          <NavigationItem
            to="/tickets/my-tickets"
            icon={Ticket}
            label="Meus Tickets"
            onClose={onClose}
          />
          <NavigationItem
            to="/tickets/new"
            icon={Ticket}
            label="Novo Ticket"
            onClose={onClose}
          />
          <NavigationItem
            to="/tickets/knowledge-base"
            icon={Ticket}
            label="Base de Conhecimento"
            onClose={onClose}
          />
          <NavigationItem
            to="/tickets/automation"
            icon={Ticket}
            label="Automação"
            onClose={onClose}
          />
          <NavigationItem
            to="/tickets/analytics"
            icon={Ticket}
            label="Análises"
            onClose={onClose}
          />
          <NavigationItem
            to="/tickets/quality"
            icon={Ticket}
            label="Qualidade"
            onClose={onClose}
          />
          <NavigationItem
            to="/tickets/copilot"
            icon={Ticket}
            label="Copiloto IA"
            onClose={onClose}
          />
          <NavigationItem
            to="/tickets/integrations"
            icon={Ticket}
            label="Integrações"
            onClose={onClose}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Clientes */}
      <NavigationItem
        to="/clients"
        icon={Users}
        label="Clientes"
        onClose={onClose}
      />

      {/* Associações */}
      <NavigationItem
        to="/assets/associations-list"
        icon={Link2}
        label="Associações"
        onClose={onClose}
      />

      {/* Monitoramento */}
      <NavigationItem
        to="/monitoring"
        icon={BarChart3}
        label="Monitoramento"
        onClose={onClose}
      />

      {/* Uso de Dados */}
      <NavigationItem
        to="/data-usage"
        icon={BarChart3}
        label="Uso de Dados"
        onClose={onClose}
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
            to="/topology/view"
            icon={Network}
            label="Visualizar"
            onClose={onClose}
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
            to="/tools/discovery"
            icon={Wrench}
            label="Discovery"
            onClose={onClose}
          />
          <NavigationItem
            to="/wifi-analyzer"
            icon={Wrench}
            label="WiFi Analyzer"
            onClose={onClose}
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
            to="/bits"
            icon={Gift}
            label="Dashboard"
            onClose={onClose}
          />
          <NavigationItem
            to="/bits/indicate"
            icon={Gift}
            label="Indicar Agora"
            onClose={onClose}
          />
          <NavigationItem
            to="/bits/my-referrals"
            icon={Gift}
            label="Meus Indicados"
            onClose={onClose}
          />
          <NavigationItem
            to="/bits/rewards"
            icon={Gift}
            label="Pontos & Recompensas"
            onClose={onClose}
          />
          <NavigationItem
            to="/bits/settings"
            icon={Gift}
            label="Configurações"
            onClose={onClose}
          />
          <NavigationItem
            to="/bits/help"
            icon={Gift}
            label="Ajuda & Suporte"
            onClose={onClose}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Outros */}
      <NavigationItem
        to="/subscriptions"
        icon={HeadphonesIcon}
        label="Assinaturas"
        onClose={onClose}
      />
    </div>
  );
}
