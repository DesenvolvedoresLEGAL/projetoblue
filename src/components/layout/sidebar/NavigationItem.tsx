
import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  onClose?: () => void;
  ariaLabel?: string;
}

export function NavigationItem({ 
  to, 
  icon: Icon, 
  label, 
  onClose, 
  ariaLabel 
}: NavigationItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        }`
      }
      aria-label={ariaLabel || label}
      onClick={onClose}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );
}
