
import React from "react";
import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
  onClick?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  icon: Icon,
  label,
  collapsed = false,
  onClick,
}) => {
  return (
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
};

export const SidebarCategoryLabel: React.FC<{
  children: React.ReactNode;
  collapsed?: boolean;
}> = ({ children, collapsed = false }) => {
  if (collapsed) return null;
  
  return (
    <div className="px-3 py-2">
      <span className="text-xs uppercase tracking-wider font-medium text-sidebar-foreground/70">
        {children}
      </span>
    </div>
  );
};
