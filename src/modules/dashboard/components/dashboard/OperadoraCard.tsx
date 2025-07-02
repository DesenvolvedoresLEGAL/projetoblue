import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Signal, Smartphone, TrendingUp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { OperadoraStats } from "../../hooks/useOperadorasStats";

interface OperadoraCardProps {
  operadora: OperadoraStats;
  isLoading?: boolean;
}

/**
 * OperadoraCard - Componente para exibir estatísticas de operadoras
 * Segue padrões LEGAL com responsividade mobile-first
 */
export const OperadoraCard: React.FC<OperadoraCardProps> = ({
  operadora,
  isLoading = false
}) => {
  const getDisponibilidadeColor = () => {
    if (operadora.disponibilidadePercent >= 80) return "text-green-600 dark:text-green-400";
    if (operadora.disponibilidadePercent >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getOperadoraIcon = () => {
    switch (operadora.name.toUpperCase()) {
      case 'VIVO':
        return <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <Signal className="w-3 h-3 text-white" />
        </div>;
      case 'TIM':
        return <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <Signal className="w-3 h-3 text-white" />
        </div>;
      case 'CLARO':
        return <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
          <Signal className="w-3 h-3 text-white" />
        </div>;
      default:
        return <Smartphone className="w-6 h-6 text-legal-primary" />;
    }
  };

  return (
    <TooltipProvider>
      <Card className="legal-card group h-full flex flex-col hover:shadow-legal transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-legal-dark dark:text-text-primary-dark">
            {getOperadoraIcon()}
            <span className="font-black">{operadora.name}</span>
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            SIM-cards da operadora
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-2 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          ) : (
            <>
              {/* Total de SIM-cards */}
              <div className="text-center">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="text-3xl font-black text-legal-primary dark:text-legal-primary">
                      {operadora.total}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total de SIM-cards {operadora.name}</p>
                  </TooltipContent>
                </Tooltip>
                <p className="text-xs text-muted-foreground">Total de chips</p>
              </div>

              {/* Barra de progresso */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Disponibilidade</span>
                  <span className={`text-sm font-bold ${getDisponibilidadeColor()}`}>
                    {operadora.disponibilidadePercent}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-legal-primary to-legal-secondary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${operadora.disponibilidadePercent}%` }}
                  />
                </div>
              </div>

              {/* Métricas secundárias */}
              <div className="grid grid-cols-2 gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors cursor-help">
                      <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                        Disponíveis
                      </p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {operadora.disponivel}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>SIM-cards prontos para uso</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-lg border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors cursor-help">
                      <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">
                        Em Uso
                      </p>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {operadora.emUso}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>SIM-cards em locação ou assinatura</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="pt-0 mt-auto">
          <Link to={`/assets/inventory?manufacturer=${operadora.id}&solution=CHIP`} className="w-full">
            <Button 
              variant="outline" 
              className="w-full legal-button border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white group-hover:shadow-md transition-all duration-200 text-xs h-8" 
              size="sm"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Ver Detalhes
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};

export default OperadoraCard;