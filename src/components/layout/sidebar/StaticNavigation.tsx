
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, PackageSearch, PlusCircle, LinkIcon, Network, ActivitySquare, Scan, FileText, Cog, UserCog, ScrollText, BarChart3, Boxes, KeyRound, LogIn, ShieldCheck, Award, Users, Gift, Settings2, HelpCircle, Share2, Ticket, Inbox, User, Plus, BookOpen, Bot, Zap, TrendingUp, Shield, Puzzle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { NavigationItem } from "./NavigationItem";

export function StaticNavigation({
  isMobile = false,
  onClose
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) {
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

      {/* Assets Section - Requires suporte or above */}
      <div className="flex flex-col space-y-2">
        <div className="px-3 mb-1">
          <h3 className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">Ativos</h3>
        </div>
        <NavigationItem
          to="/assets/dashboard"
          icon={Package}
          label="Dashboard"
          onClose={isMobile ? onClose : undefined}
          requiredRole="suporte"
        />
        <NavigationItem
          to="/assets/inventory"
          icon={PackageSearch}
          label="Inventário"
          onClose={isMobile ? onClose : undefined}
          requiredRole="suporte"
        />
        <NavigationItem
          to="/assets/management"
          icon={PlusCircle}
          label="Gestão"
          onClose={isMobile ? onClose : undefined}
          requiredRole="suporte"
        />
      </div>

      {/* Tickets Section - Requires suporte or above */}
      <div className="flex flex-col space-y-2">
        <div className="px-3 mb-1">
          <h3 className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">Tickets</h3>
        </div>
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
        <NavigationItem
          to="/tickets/integrations"
          icon={Puzzle}
          label="Integrações"
          onClose={isMobile ? onClose : undefined}
          requiredRole="admin"
        />
      </div>

      {/* BITS Section - Available to cliente or above */}
      <div className="flex flex-col space-y-2">
        <div className="px-3 mb-1">
          <h3 className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">BITS Legal™</h3>
        </div>
        <NavigationItem
          to="/bits"
          icon={Gift}
          label="Dashboard"
          onClose={isMobile ? onClose : undefined}
          requiredRole="cliente"
        />
        <NavigationItem
          to="/bits/indicate"
          icon={Share2}
          label="Indicar Agora"
          onClose={isMobile ? onClose : undefined}
          requiredRole="cliente"
        />
        <NavigationItem
          to="/bits/my-referrals"
          icon={Users}
          label="Minhas Indicações"
          onClose={isMobile ? onClose : undefined}
          requiredRole="cliente"
        />
        <NavigationItem
          to="/bits/rewards"
          icon={Award}
          label="Recompensas"
          onClose={isMobile ? onClose : undefined}
          requiredRole="cliente"
        />
      </div>

      {/* Clients Section - Requires suporte or above */}
      <div className="flex flex-col space-y-2">
        <div className="px-3 mb-1">
          <h3 className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">Clientes</h3>
        </div>
        <NavigationItem
          to="/clients"
          icon={Users}
          label="Gerenciar Clientes"
          onClose={isMobile ? onClose : undefined}
          requiredRole="suporte"
        />
      </div>

      {/* Admin Section - Requires admin */}
      <div className="flex flex-col space-y-2">
        <div className="px-3 mb-1">
          <h3 className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">Administração</h3>
        </div>
        <NavigationItem
          to="/suppliers"
          icon={Boxes}
          label="Fornecedores"
          onClose={isMobile ? onClose : undefined}
          requiredRole="admin"
        />
        <NavigationItem
          to="/admin"
          icon={Cog}
          label="Configurações"
          onClose={isMobile ? onClose : undefined}
          requiredRole="admin"
        />
      </div>
    </div>
  );
}
