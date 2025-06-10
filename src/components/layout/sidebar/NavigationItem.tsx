
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types/auth';

export interface NavigationItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isCollapsed?: boolean;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

export const NavigationItem = ({ 
  icon: Icon, 
  label, 
  href, 
  isCollapsed = false,
  requiredRole,
  allowedRoles
}: NavigationItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(href + '/');

  const linkContent = (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-muted-foreground hover:bg-accent",
        isCollapsed && "justify-center px-2"
      )}
      title={isCollapsed ? label : undefined}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </Link>
  );

  // If no role requirements, show the item to everyone
  if (!requiredRole && !allowedRoles) {
    return linkContent;
  }

  // Apply role-based access control
  return (
    <RoleGuard 
      requiredRole={requiredRole}
      allowedRoles={allowedRoles}
      fallback={null}
    >
      {linkContent}
    </RoleGuard>
  );
};
