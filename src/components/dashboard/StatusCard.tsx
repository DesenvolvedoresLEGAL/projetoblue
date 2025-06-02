
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { CircleAlert, CheckCircle, Shield } from "lucide-react";
import { formatPhoneNumber } from "@/utils/formatters";
import { capitalize } from "@/utils/stringUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  variant?: "default" | "destructive" | "warning";
  icon?: React.ReactNode;
  limitItems?: number;
  showCount?: boolean;
}

/**
 * StatusCard - Enhanced with LEGAL visual identity and conditional display
 * Only shows problem cards when there are actual problems
 */
export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  description,
  items,
  isLoading = false,
  emptyMessage = "Nenhum item encontrado.",
  actionLink,
  actionText,
  variant = "default",
  icon,
  limitItems = 5,
  showCount = true,
}) => {
  // Don't render destructive cards if there are no problems
  if (variant === "destructive" && !isLoading && items.length === 0) {
    return (
      <TooltipProvider>
        <Card className="legal-card border-green-200 dark:border-green-800">
          <CardHeader className="pb-4">
            <CardTitle className="legal-subtitle text-xl flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              <span>Tudo Certo!</span>
            </CardTitle>
            <CardDescription className="text-xs text-green-600 dark:text-green-300">
              Nenhum problema detectado nos ativos
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <div className="flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-400 mb-1">
                  Sistema Operacional
                </h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Todos os ativos estão funcionando corretamente
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={actionLink} className="w-full">
                  <Button 
                    variant="outline" 
                    className="w-full border-green-500 text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20" 
                    size="sm"
                  >
                    Ver Todos os Ativos
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Visualizar inventário completo de ativos</p>
              </TooltipContent>
            </Tooltip>
          </CardFooter>
        </Card>
      </TooltipProvider>
    );
  }

  // Apply styling based on variant
  const getCardStyles = () => {
    switch (variant) {
      case "destructive":
        return "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20";
      case "warning":
        return "border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-950/20";
      default:
        return "legal-card";
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case "destructive":
        return "destructive";
      case "warning":
        return "outline";
      default:
        return "outline";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "destructive":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-legal-primary";
    }
  };

  const getTitleColor = () => {
    switch (variant) {
      case "destructive":
        return "text-red-700 dark:text-red-400";
      case "warning":
        return "text-yellow-700 dark:text-yellow-400";
      default:
        return "legal-title";
    }
  };

  // Limit the number of items displayed
  const displayedItems = items.slice(0, limitItems);
  const hasMoreItems = items.length > limitItems;

  return (
    <TooltipProvider>
      <Card className={`flex flex-col h-full ${getCardStyles()}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-lg flex items-center gap-2 ${getTitleColor()}`}>
              {isLoading ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <>
                  {icon}
                  <span className="legal-subtitle">
                    {showCount ? `${items.length} ` : ""}
                    {typeof title === "string" ? title : title}
                  </span>
                </>
              )}
            </CardTitle>
          </div>
          <CardDescription
            className={
              variant === "destructive"
                ? "text-red-600 dark:text-red-300"
                : variant === "warning"
                ? "text-yellow-600 dark:text-yellow-300"
                : "legal-text"
            }
          >
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2 flex-1">
          {isLoading ? (
            <div className="space-y-2">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
            </div>
          ) : displayedItems.length > 0 ? (
            <ul className="space-y-2">
              {displayedItems.map((item) => (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <li className="flex items-center gap-2 text-sm font-mono border-b border-gray-100 dark:border-gray-800 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-2 transition-colors cursor-help">
                      <CircleAlert
                        className={`h-4 w-4 flex-shrink-0 ${getIconColor()}`}
                      />
                      <span className="font-semibold flex-1 truncate">
                        {item.type === 'CHIP' ? formatPhoneNumber(item.identifier) : item.identifier}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.additionalInfo || `(${capitalize(item.status)})`}
                      </span>
                    </li>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p><strong>Tipo:</strong> {item.type}</p>
                      <p><strong>Identificador:</strong> {item.identifier}</p>
                      <p><strong>Status:</strong> {capitalize(item.status)}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
              {hasMoreItems && (
                <li className="text-center text-sm text-muted-foreground pt-2 italic">
                  + {items.length - limitItems} itens adicionais...
                </li>
              )}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                {emptyMessage}
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={actionLink} className="w-full">
                <Button 
                  variant={getButtonVariant()} 
                  className={`w-full transition-all duration-200 ${
                    variant === "default" ? "border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white" : ""
                  }`}
                  size="sm"
                >
                  {actionText}
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver lista detalhada e gerenciar ativos</p>
            </TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default StatusCard;
