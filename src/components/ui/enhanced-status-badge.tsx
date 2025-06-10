
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
 * Enhanced Status Badge component optimized for dark mode
 * Provides better contrast and visual distinction
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
    success: 'status-badge-success',
    warning: 'status-badge-warning',
    error: 'status-badge-error',
    info: 'bg-legal-primary/20 text-legal-primary dark:bg-legal-primary/30 dark:text-legal-secondary border border-legal-primary/30',
    default: 'bg-muted text-muted-foreground border border-border'
  };

  return (
    <Badge 
      className={cn(
        "font-medium px-3 py-1 text-xs rounded-full transition-all duration-200",
        statusClasses[statusType],
        className
      )}
    >
      {status}
    </Badge>
  );
};

export default EnhancedStatusBadge;
