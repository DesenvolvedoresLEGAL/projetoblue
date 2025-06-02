
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface StatusItem {
  id: string;
  name: string;
  status: string;
  lastUpdate?: string;
}

interface StatusCardProps {
  title: string;
  description: string;
  items: StatusItem[];
  isLoading?: boolean;
  actionLink: string;
  actionText: string;
  variant?: "default" | "destructive" | "secondary";
  icon?: React.ReactNode;
  emptyMessage?: string;
  isMobile?: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  description,
  items,
  isLoading = false,
  actionLink,
  actionText,
  variant = "default",
  icon,
  emptyMessage = "Nenhum item encontrado.",
  isMobile = false
}) => {
  // Limit items shown on mobile to prevent overflow
  const displayItems = isMobile ? items.slice(0, 3) : items.slice(0, 5);
  const hasMoreItems = items.length > displayItems.length;

  const getVariantClasses = () => {
    switch (variant) {
      case "destructive":
        return "border-red-200 dark:border-red-800";
      case "secondary":
        return "border-yellow-200 dark:border-yellow-800";
      default:
        return "border-gray-200 dark:border-gray-700";
    }
  };

  return (
    <Card className={`h-full flex flex-col ${getVariantClasses()}`}>
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          {icon}
          <span className="text-sm sm:text-base md:text-lg">{title}</span>
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-2 md:space-y-3">
        {isLoading ? (
          <div className="space-y-2 md:space-y-3">
            {Array(isMobile ? 3 : 4)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-12 md:h-14 w-full" />
              ))}
          </div>
        ) : displayItems.length > 0 ? (
          <>
            <div className="space-y-2">
              {displayItems.map((item, index) => (
                <div 
                  key={item.id || index} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 md:p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium truncate">
                      {item.name}
                    </p>
                    {item.lastUpdate && (
                      <p className="text-xs text-muted-foreground">
                        {item.lastUpdate}
                      </p>
                    )}
                  </div>
                  <Badge 
                    variant={variant === "destructive" ? "destructive" : "secondary"}
                    className="text-xs shrink-0"
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
            
            {hasMoreItems && (
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  +{items.length - displayItems.length} itens adicionais
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 md:py-8 text-center">
            <div className="p-3 md:p-4 bg-green-100 dark:bg-green-950/30 rounded-full mb-3 md:mb-4">
              {icon || <div className="h-6 w-6 md:h-8 md:w-8 bg-green-500 rounded-full" />}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground px-4">
              {emptyMessage}
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 mt-auto">
        <Link to={actionLink} className="w-full">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs md:text-sm h-8 md:h-9"
          >
            {actionText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
