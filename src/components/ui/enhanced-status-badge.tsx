
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default';

interface EnhancedStatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

/**
 * Enhanced Status Badge component optimized for dark mode following PRD specifications
 * Provides better contrast and visual distinction with proper LEGAL brand colors
 */
export const EnhancedStatusBadge: React.FC<EnhancedStatusBadgeProps> = ({ 
  status, 
  type = 'default',
  className 
}) => {
  const getStatusType = (status: string): StatusType => {
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus.includes('disponível') || normalizedStatus.includes('ativo') || normalizedStatus.includes('sucesso')) {
      return 'success';
    }
    
    if (normalizedStatus.includes('alugado') || normalizedStatus.includes('locação') || normalizedStatus.includes('assinatura')) {
      return 'info';
    }
    
    if (normalizedStatus.includes('bloqueado') || normalizedStatus.includes('erro') || normalizedStatus.includes('falha')) {
      return 'error';
    }
    
    if (normalizedStatus.includes('manutenção') || normalizedStatus.includes('sem dados') || normalizedStatus.includes('pendente')) {
      return 'warning';
    }
    
    return 'default';
  };

  const statusType = type === 'default' ? getStatusType(status) : type;
  
  const statusClasses = {
    success: cn(
      'status-badge-success',
      'bg-green-100 text-green-800 border border-green-200',
      'dark:bg-[hsl(var(--status-success-bg))] dark:text-[hsl(var(--status-success-text))] dark:border-green-500/30'
    ),
    warning: cn(
      'status-badge-warning',
      'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'dark:bg-[hsl(var(--status-warning-bg))] dark:text-[hsl(var(--status-warning-text))] dark:border-yellow-500/30'
    ),
    error: cn(
      'status-badge-error',
      'bg-red-100 text-red-800 border border-red-200',
      'dark:bg-[hsl(var(--status-error-bg))] dark:text-[hsl(var(--status-error-text))] dark:border-red-500/30'
    ),
    info: cn(
      'bg-legal-primary/20 text-legal-primary border border-legal-primary/30',
      'dark:bg-legal-primary/20 dark:text-legal-primary dark:border-legal-primary/30'
    ),
    default: cn(
      'bg-muted text-muted-foreground border border-border',
      'dark:bg-muted dark:text-muted-foreground dark:border-border'
    )
  };

  return (
    <Badge 
      className={cn(
        "font-medium px-3 py-1 text-xs rounded-full transition-all duration-200",
        "shadow-sm hover:shadow-md",
        statusClasses[statusType],
        className
      )}
    >
      {status}
    </Badge>
  );
};

export default EnhancedStatusBadge;
