
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumbs" className={cn("flex items-center text-sm", className)}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && (
              <li aria-hidden="true" className="text-muted-foreground mx-1">/</li>
            )}
            <li className={cn(
              index === items.length - 1 
                ? "text-foreground font-medium" 
                : "text-muted-foreground hover:text-foreground"
            )}>
              {index === items.length - 1 ? (
                <span>{item.label}</span>
              ) : (
                <Link to={item.href}>{item.label}</Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

interface PageTitleProps {
  title: string;
  description?: string;
  className?: string;
  requiredRole?: UserRole;
}

export const PageTitle: React.FC<PageTitleProps> = ({ 
  title, 
  description, 
  className,
  requiredRole 
}) => {
  const { hasMinimumRole } = useAuth();

  // Se há role requerido e usuário não tem permissão, não renderizar
  if (requiredRole && !hasMinimumRole(requiredRole)) {
    return null;
  }

  return (
    <div className={cn("mb-6", className)}>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
};

interface ProtectedPageWrapperProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackComponent?: React.ReactNode;
}

export const ProtectedPageWrapper: React.FC<ProtectedPageWrapperProps> = ({
  children,
  requiredRole,
  fallbackComponent
}) => {
  const { hasMinimumRole, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallbackComponent || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso restrito</h2>
          <p className="text-muted-foreground">Faça login para acessar esta página</p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasMinimumRole(requiredRole)) {
    return fallbackComponent || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso não autorizado</h2>
          <p className="text-muted-foreground">
            Você precisa ter permissões de {requiredRole} ou superior para acessar esta página
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
