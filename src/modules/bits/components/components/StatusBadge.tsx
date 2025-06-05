
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ReferralStatus } from '../types';

interface StatusBadgeProps {
  status: ReferralStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusConfig = {
    pendente: {
      label: 'Pendente',
      variant: 'outline' as const
    },
    aprovada: {
      label: 'Aprovada',
      variant: 'secondary' as const
    },
    rejeitada: {
      label: 'Rejeitada',
      variant: 'destructive' as const
    },
    convertida: {
      label: 'Convertida',
      variant: 'default' as const
    }
  };

  const config = statusConfig[status] || statusConfig.pendente;

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};
