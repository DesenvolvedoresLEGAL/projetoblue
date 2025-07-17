
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StandardStatusBadgeProps {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
}

export function StandardStatusBadge({ 
  status, 
  variant,
  className 
}: StandardStatusBadgeProps) {
  // Auto-determine variant based on status if not provided
  const getVariant = (statusText: string): "default" | "secondary" | "destructive" | "outline" => {
    if (variant) return variant;
    
    const normalizedStatus = statusText.toLowerCase();
    
    if (normalizedStatus.includes('disponível') || 
        normalizedStatus.includes('disponivel') || 
        normalizedStatus.includes('ativo')) {
      return 'default'; // Green-ish in most themes
    }
    
    if (normalizedStatus.includes('locação') || 
        normalizedStatus.includes('locacao') || 
        normalizedStatus.includes('alocado') ||
        normalizedStatus.includes('em uso')) {
      return 'secondary'; // Blue-ish
    }
    
    if (normalizedStatus.includes('manutenção') || 
        normalizedStatus.includes('manutencao') ||
        normalizedStatus.includes('problema')) {
      return 'outline'; // Warning-ish
    }
    
    if (normalizedStatus.includes('bloqueado') || 
        normalizedStatus.includes('crítico') ||
        normalizedStatus.includes('critico') ||
        normalizedStatus.includes('erro')) {
      return 'destructive'; // Red
    }
    
    return 'default';
  };

  const badgeVariant = getVariant(status);

  return (
    <Badge 
      variant={badgeVariant}
      className={cn("text-xs font-medium", className)}
    >
      {status}
    </Badge>
  );
}
