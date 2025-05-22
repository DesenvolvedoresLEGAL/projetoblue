
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { capitalize } from '@/utils/formatters';

interface StatusCardItem {
  id: string;
  identifier: string;
  type: string;
  status: string;
  additionalInfo?: string;
}

interface StatusCardProps {
  title: string | React.ReactNode;
  description: string;
  items: StatusCardItem[];
  isLoading?: boolean;
  emptyMessage?: string;
  actionLink: string;
  actionText: string;
  variant?: 'default' | 'destructive' | 'warning';
  icon?: React.ReactNode;
  limitItems?: number;
  showCount?: boolean;
}

/**
 * StatusCard - Reusable component for displaying lists of assets with statuses
 * Problem: Renderização Condicional Repetida
 * Solução: Criar componente reutilizável StatusCard
 */
export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  description,
  items,
  isLoading = false,
  emptyMessage = "Nenhum item encontrado.",
  actionLink,
  actionText,
  variant = 'default',
  icon,
  limitItems = 5,
  showCount = true,
}) => {
  // Apply styling based on variant
  const getCardStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return '';
    }
  };
  
  const getButtonVariant = () => {
    switch (variant) {
      case 'destructive':
        return 'destructive';
      case 'warning':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'destructive':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-primary';
    }
  };

  // Limit the number of items displayed
  const displayedItems = items.slice(0, limitItems);
  const hasMoreItems = items.length > limitItems;

  return (
    <Card className={`flex flex-col h-full ${getCardStyles()}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl flex items-center gap-2">
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <>
                {icon}
                <span>
                  {showCount ? `${items.length} ` : ''}{typeof title === 'string' ? title : title}
                </span>
              </>
            )}
          </CardTitle>
        </div>
        <CardDescription className={variant === 'destructive' ? 'text-red-700' : 
                                  variant === 'warning' ? 'text-yellow-700' : ''}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-1">
        {isLoading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : displayedItems.length > 0 ? (
          <ul className="space-y-1">
            {displayedItems.map(item => (
              <li key={item.id} className="flex items-center gap-2 text-sm font-mono border-b border-gray-100 py-1">
                <CircleAlert className={`h-4 w-4 flex-shrink-0 ${getIconColor()}`} />
                <span className="font-semibold">{item.identifier}</span>
                <span className="text-xs text-muted-foreground">
                  {item.additionalInfo || `(${capitalize(item.type)} - ${capitalize(item.status)})`}
                </span>
              </li>
            ))}
            {hasMoreItems && (
              <li className="text-center text-sm text-muted-foreground pt-1">
                + {items.length - limitItems} mais itens...
              </li>
            )}
          </ul>
        ) : (
          <p className="text-center py-3 text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-0 mt-auto">
        <Link to={actionLink} className="w-full">
          <Button variant={getButtonVariant()} className="w-full" size="sm">
            {actionText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default StatusCard;
