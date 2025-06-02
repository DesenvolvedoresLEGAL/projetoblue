
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Check, X, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatsData {
  total: number;
  available: number;
  unavailable: number;
}

interface StatsSummaryCardProps {
  title: string;
  description?: string;
  data: StatsData;
  isLoading?: boolean;
  actionLink: string;
  actionText: string;
}

/**
 * StatsSummaryCard - Reusable component for displaying asset statistics
 * Updated with LEGAL visual identity, enhanced UX and mobile responsiveness
 */
export const StatsSummaryCard: React.FC<StatsSummaryCardProps> = ({
  title,
  description = "Disponibilidade atual do inventário",
  data,
  isLoading = false,
  actionLink,
  actionText
}) => {
  const availabilityPercentage = data.total > 0 ? Math.round((data.available / data.total) * 100) : 0;
  
  const getAvailabilityColor = () => {
    if (availabilityPercentage >= 80) return "text-green-600 dark:text-green-400";
    if (availabilityPercentage >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <TooltipProvider>
      <Card className="legal-card group h-full flex flex-col">
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="legal-title text-lg md:text-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-sm sm:text-base md:text-lg">{title}</span>
            <Tooltip>
              <TooltipTrigger>
                <div className={`text-xl md:text-2xl font-black ${getAvailabilityColor()}`}>
                  {isLoading ? <Skeleton className="h-6 md:h-8 w-12 md:w-16" /> : data.total}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total de {title.toLowerCase()} no sistema</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription className="legal-text text-xs md:text-sm">
            {description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 space-y-3 md:space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 md:h-10 w-24 md:w-32" />
              <div className="flex gap-2 md:gap-4">
                <Skeleton className="h-4 md:h-6 w-16 md:w-24" />
                <Skeleton className="h-4 md:h-6 w-16 md:w-24" />
              </div>
            </div>
          ) : (
            <>
              {/* Availability Indicator */}
              <div>
                <div className="flex items-center gap-1 md:gap-2 mb-2">
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-legal-primary" />
                  <span className="text-xs md:text-sm font-medium text-muted-foreground">
                    Disponibilidade
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className={`text-sm md:text-lg font-bold ${getAvailabilityColor()}`}>
                        {availabilityPercentage}%
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Porcentagem de ativos disponíveis para uso</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 md:h-2">
                  <div 
                    className="bg-gradient-to-r from-legal-primary to-legal-secondary h-1.5 md:h-2 rounded-full transition-all duration-500"
                    style={{ width: `${availabilityPercentage}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid - Mobile Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-green-50 dark:bg-green-950/30 p-2 md:p-3 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors cursor-help">
                      <div className="flex items-center gap-1 md:gap-2">
                        <div className="size-3 md:size-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="size-2 md:size-3 text-white" />
                        </div>
                        <p className="text-xs font-medium text-green-700 dark:text-green-300">
                          Disponíveis
                        </p>
                      </div>
                      <p className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {data.available}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ativos prontos para uso e associação</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-gray-50 dark:bg-gray-800/30 p-2 md:p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-help">
                      <div className="flex items-center gap-1 md:gap-2">
                        <div className="size-3 md:size-4 bg-gray-400 dark:bg-gray-500 rounded-full flex items-center justify-center">
                          <X className="size-2 md:size-3 text-white" />
                        </div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          Em Uso
                        </p>
                      </div>
                      <p className="text-lg md:text-xl font-bold text-gray-600 dark:text-gray-400 mt-1">
                        {data.unavailable}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ativos atualmente associados ou indisponíveis</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 mt-auto">
          <Link to={actionLink} className="w-full">
            <Button 
              variant="outline" 
              className="w-full legal-button border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white group-hover:shadow-md transition-all duration-200 text-xs md:text-sm h-8 md:h-9" 
              size="sm"
            >
              {actionText}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default StatsSummaryCard;
