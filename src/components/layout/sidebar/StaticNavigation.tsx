import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, PackageSearch, PlusCircle, LinkIcon, Network, ActivitySquare, Scan, FileText, Cog, UserCog, ScrollText, BarChart3, Boxes, KeyRound, LogIn, ShieldCheck, Award,
// Added Award icon
Users, Gift, Settings2, HelpCircle, Share2 } from "lucide-react";
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
        
        <NavLink to="/assets" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} end onClick={isMobile ? onClose : undefined}>
          <PlusCircle className="h-4 w-4" />
          <span>Gestão</span>
        </NavLink>
        
        {/* <NavLink to="/topology/view" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <Network className="h-4 w-4" />
          <span>Topologia</span>
        </NavLink>
        
        <NavLink to="/tools/discovery" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <Scan className="h-4 w-4" />
          <span>Descoberta</span>
        </NavLink> */}
      </div>

      {/* BITS™ Section - Conditionally rendered for 'cliente' role (previously 'afiliado')
      {profile?.role === 'cliente' && <div className="flex flex-col space-y-2">
          <div className="px-3 mb-1">
            <h3 className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">BITS™</h3>
          </div>
          <NavLink to="/bits" // Main BITS dashboard
      className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive || location.pathname.startsWith('/bits/') && location.pathname !== '/bits/indicate' && location.pathname !== '/bits/my-referrals' && location.pathname !== '/bits/rewards' && location.pathname !== '/bits/settings' && location.pathname !== '/bits/help' ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined} end // Ensure only exact match for dashboard
      >
            <Award className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/bits/indicate" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
            <Share2 className="h-4 w-4" />
            <span>Indicar Agora</span>
          </NavLink>
          <NavLink to="/bits/my-referrals" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
            <Users className="h-4 w-4" />
            <span>Minhas Indicações</span>
          </NavLink>
          <NavLink to="/bits/rewards" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
            <Gift className="h-4 w-4" />
            <span>Pontos & Recompensas</span>
          </NavLink>
          <NavLink to="/bits/settings" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
            <Settings2 className="h-4 w-4" />
            <span>Configurações</span>
          </NavLink>
          <NavLink to="/bits/help" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
            <HelpCircle className="h-4 w-4" />
            <span>Ajuda & Suporte</span>
          </NavLink>
        </div>} */}

      {/* Admin Section - Unchanged
      <div className="flex flex-col space-y-2">
        <div className="px-3 mb-1">
          <h3 className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70">Admin</h3>
        </div>
        <NavLink to="/admin/settings" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <Cog className="h-4 w-4" />
          <span>Configurações</span>
        </NavLink>
        
        <NavLink to="/admin/team" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <UserCog className="h-4 w-4" />
          <span>Equipe</span>
        </NavLink>
        
        <NavLink to="/admin/versioning" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <ScrollText className="h-4 w-4" />
          <span>Versionamento</span>
        </NavLink>
        
        <NavLink to="/admin/logs" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <ScrollText className="h-4 w-4" />
          <span>Logs</span>
        </NavLink>
        
        <NavLink to="/admin/metrics" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <BarChart3 className="h-4 w-4" />
          <span>Métricas</span>
        </NavLink>
        
        <NavLink to="/admin/traces" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <Boxes className="h-4 w-4" />
          <span>Traces</span>
        </NavLink>
        
        <NavLink to="/admin/iam" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <KeyRound className="h-4 w-4" />
          <span>IAM</span>
        </NavLink>
        
        <NavLink to="/admin/access" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <LogIn className="h-4 w-4" />
          <span>Acessos</span>
        </NavLink>
        
        <NavLink to="/admin/sso-mfa" className={({
        isActive
      }) => cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium" : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-foreground")} onClick={isMobile ? onClose : undefined}>
          <ShieldCheck className="h-4 w-4" />
          <span>SSO & MFA</span>
        </NavLink>
      </div> */}
    </div>;
}
