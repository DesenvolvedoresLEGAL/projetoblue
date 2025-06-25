
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { badgeVariants } from "@/components/ui/badge-variants";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

interface StandardStatusBadgeProps {
  status: string;
  type?: 'status' | 'event' | 'association';
  className?: string;
}

export const StandardStatusBadge: React.FC<StandardStatusBadgeProps> = ({
  status,
  type = 'status',
  className
}) => {
  const getStatusVariant = (status: string, type: string) => {
    // Para eventos de histórico
    if (type === 'event') {
      switch (status) {
        case 'Ativo Criado':
        case 'Associação Criada':
          return 'default';
        case 'Status Atualizado':
        case 'Status da Associação Atualizado':
          return 'secondary';
        case 'Associação Removida':
        case 'Ativo Removido':
          return 'destructive';
        case 'Inconsistência Corrigida':
          return 'success';
        default:
          return 'outline';
      }
    }

    // Para status de ativos
    switch (status.toUpperCase()) {
      case 'DISPONÍVEL':
      case 'DISPONIVEL':
        return 'success';
      case 'ALUGADO':
      case 'ASSINATURA':
      case 'EM USO':
        return 'default';
      case 'BLOQUEADO':
      case 'MANUTENÇÃO':
      case 'MANUTENCAO':
        return 'destructive';
      case 'SEM DADOS':
        return 'warning';
      default:
        return 'outline';
    }
  };

  const variant: VariantProps<typeof badgeVariants>["variant"] =
    getStatusVariant(status, type);

  return (
    <Badge
      variant={variant}
      className={cn("text-xs font-neue-haas", className)}
    >
      {status}
    </Badge>
  );
};
