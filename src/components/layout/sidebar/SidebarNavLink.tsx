
import React from "react";
import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface SidebarNavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
  onClick?: () => void;
}

export const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({
  to,
  icon: Icon,
  label,
  collapsed = false,
  onClick,
}) => {
  const link = (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-[#4D2BFB]/10 text-[#4D2BFB] font-medium"
            : "text-sidebar-foreground hover:bg-[#4D2BFB]/5 hover:text-sidebar-accent-foreground"
        )
      }
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            {link}
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return link;
};
