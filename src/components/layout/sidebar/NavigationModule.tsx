
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { NavigationItem, NavigationItemProps } from './NavigationItem';
import { cn } from '@/lib/utils';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { UserRole } from '@/types/auth';

export interface NavigationModuleProps {
  title: string;
  items: NavigationItemProps[];
  isCollapsed?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

export const NavigationModule = ({ 
  title, 
  items, 
  isCollapsed = false, 
  isExpanded = true, 
  onToggle,
  requiredRole,
  allowedRoles
}: NavigationModuleProps) => {
  
  // Filter items based on role permissions - only show items user can access
  const visibleItems = items.filter(item => {
    // If item has no role requirements, it's visible to everyone
    if (!item.requiredRole && !item.allowedRoles) {
      return true;
    }
    
    // For now, we'll include all items and let RoleGuard handle visibility
    // This ensures module headers show even if some items are hidden
    return true;
  });

  // If no visible items and module has role requirements, check access
  if (visibleItems.length === 0) {
    return null;
  }

  const moduleContent = (
    <>
      {!isCollapsed && (
        <div 
          className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground transition-colors"
          onClick={onToggle}
        >
          <span>{title}</span>
          {onToggle && (
            <ChevronDown 
              className={cn(
                "h-3 w-3 transition-transform duration-200",
                !isExpanded && "rotate-180"
              )} 
            />
          )}
        </div>
      )}
      
      {(isCollapsed || isExpanded) && (
        <div className={cn("space-y-1", isCollapsed && "space-y-2")}>
          {visibleItems.map((item, index) => (
            <NavigationItem 
              key={`${item.href}-${index}`}
              {...item} 
              isCollapsed={isCollapsed} 
            />
          ))}
        </div>
      )}
    </>
  );

  // If module has role requirements, wrap with RoleGuard
  if (requiredRole || allowedRoles) {
    return (
      <RoleGuard 
        requiredRole={requiredRole}
        allowedRoles={allowedRoles}
        fallback={null}
      >
        <div className="space-y-1">
          {moduleContent}
        </div>
      </RoleGuard>
    );
  }

  return (
    <div className="space-y-1">
      {moduleContent}
    </div>
  );
};
