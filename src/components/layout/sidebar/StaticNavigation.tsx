
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, PackageSearch, PlusCircle, LinkIcon, Network, ActivitySquare, Scan, FileText, Cog, UserCog, ScrollText, BarChart3, Boxes, KeyRound, LogIn, ShieldCheck, Award,
// Added Award icon
Users, Gift, Settings2, HelpCircle, Share2, Ticket, Inbox, User, Plus, BookOpen, Bot, Zap, TrendingUp, Shield, Puzzle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

export function StaticNavigation({
  isMobile = false,
  onClose
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const {
    profile
  } = useAuth(); // Get user profile

  return <div className="flex flex-col space-y-6 pt-2">
      {/* Dashboard Section */}
      <div className="flex flex-col space-y-2">
        <div className="px-3 mb-1">
          
        </div>
        <NavLink to="/" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <LayoutDashboard className="h-4 w-4" />
          <span>Visão Geral</span>
        </NavLink>
      </div>

      {/* Assets Section - Updated structure */}
      <div className="flex flex-col space-y-2">
        <div className="px-3 mb-1">
          <h3 className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">Ativos</h3>
        </div>
        <NavLink to="/assets/dashboard" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <Package className="h-4 w-4" />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/assets/inventory" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} end onClick={isMobile ? onClose : undefined}>
          <PackageSearch className="h-4 w-4" />
          <span>Inventário</span>
        </NavLink>
        
        <NavLink to="/assets/management" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} end onClick={isMobile ? onClose : undefined}>
          <PlusCircle className="h-4 w-4" />
          <span>Gestão</span>
        </NavLink>
      </div>

      {/* Tickets Section */}
      <div className="flex flex-col space-y-2">
        <div className="px-3 mb-1">
          <h3 className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">Tickets</h3>
        </div>
        <NavLink to="/tickets" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <LayoutDashboard className="h-4 w-4" />
          <span>Visão Geral</span>
        </NavLink>
        
        <NavLink to="/tickets/inbox" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <Inbox className="h-4 w-4" />
          <span>Caixa de Entrada</span>
        </NavLink>
        
        <NavLink to="/tickets/my-tickets" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <User className="h-4 w-4" />
          <span>Meus Tickets</span>
        </NavLink>
        
        <NavLink to="/tickets/new" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <Plus className="h-4 w-4" />
          <span>Novo Ticket</span>
        </NavLink>
        
        <NavLink to="/tickets/knowledge-base" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <BookOpen className="h-4 w-4" />
          <span>Base de Conhecimento</span>
        </NavLink>
        
        <NavLink to="/tickets/automation" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <Zap className="h-4 w-4" />
          <span>Automação e Regras</span>
        </NavLink>
        
        <NavLink to="/tickets/analytics" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <TrendingUp className="h-4 w-4" />
          <span>Análises & Relatórios</span>
        </NavLink>
        
        <NavLink to="/tickets/quality" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <Shield className="h-4 w-4" />
          <span>Qualidade & Auditoria</span>
        </NavLink>
        
        <NavLink to="/tickets/copilot" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <Bot className="h-4 w-4" />
          <span>Copiloto do Agente (IA)</span>
        </NavLink>
        
        <NavLink to="/tickets/integrations" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <Puzzle className="h-4 w-4" />
          <span>Integrações</span>
        </NavLink>
      </div>
    </div>;
}
