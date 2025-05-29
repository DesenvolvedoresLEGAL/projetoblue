
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, Clock, Zap, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface StandardStatusBadgeProps {
  status: string;
  type?: 'status' | 'solution' | 'event';
  className?: string;
}

const getStatusConfig = (status: string, type: string = 'status') => {
  const normalizedStatus = status.toLowerCase();
  
  if (type === 'solution') {
    switch (normalizedStatus) {
      case 'chip':
        return { icon: Package, variant: 'secondary' as const, bgColor: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'speedy 5g':
        return { icon: Zap, variant: 'secondary' as const, bgColor: 'bg-purple-100 text-purple-800 border-purple-200' };
      default:
        return { icon: Package, variant: 'outline' as const, bgColor: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  }
  
  if (type === 'event') {
    switch (normalizedStatus) {
      case 'criado':
      case 'cadastrado':
        return { icon: CheckCircle, variant: 'success' as const, bgColor: 'bg-green-100 text-green-800 border-green-200' };
      case 'atualizado':
      case 'modificado':
        return { icon: AlertCircle, variant: 'warning' as const, bgColor: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'removido':
      case 'excluído':
        return { icon: XCircle, variant: 'destructive' as const, bgColor: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { icon: Clock, variant: 'outline' as const, bgColor: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  }
  
  // Status padrão
  switch (normalizedStatus) {
    case 'disponível':
    case 'ativo':
      return { icon: CheckCircle, variant: 'success' as const, bgColor: 'bg-green-100 text-green-800 border-green-200' };
    case 'alugado':
    case 'em uso':
      return { icon: Clock, variant: 'default' as const, bgColor: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'assinatura':
      return { icon: Package, variant: 'secondary' as const, bgColor: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'sem dados':
    case 'bloqueado':
    case 'manutenção':
      return { icon: XCircle, variant: 'destructive' as const, bgColor: 'bg-red-100 text-red-800 border-red-200' };
    default:
      return { icon: AlertCircle, variant: 'outline' as const, bgColor: 'bg-gray-100 text-gray-800 border-gray-200' };
  }
};

export const StandardStatusBadge: React.FC<StandardStatusBadgeProps> = ({
  status,
  type = 'status',
  className
}) => {
  const { icon: Icon, variant, bgColor } = getStatusConfig(status, type);
  
  return (
    <Badge 
      variant={variant}
      className={cn(
        "flex items-center gap-1 font-neue-haas font-medium",
        bgColor,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
};
