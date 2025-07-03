
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Smartphone, ExternalLink } from 'lucide-react';
import { OperadoraStats } from '@modules/dashboard/hooks/useOperadorasStats';
import '@/utils/stringUtils';

interface OperadoraCardProps {
  operadora: OperadoraStats;
  isLoading?: boolean;
}

export const OperadoraCard: React.FC<OperadoraCardProps> = ({ 
  operadora, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-8" />
              </div>
            ))}
          </div>
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-legal-dark dark:text-text-primary-dark">
            <div className="p-2 bg-[#4D2BFB]/10 rounded-lg">
              <Smartphone className="h-5 w-5 text-legal-primary dark:text-legal-secondary" />
            </div>
            <span className="text-lg font-semibold">CHIPs da {operadora.nome.capitalize()}</span>
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Métrica Principal */}
        <div className="text-center py-2 bg-legal-primary/5 dark:bg-legal-primary/10 rounded-lg">
          <div className="text-2xl font-bold text-legal-primary">{operadora.total}</div>
          <div className="text-sm text-muted-foreground">Total de Chips</div>
        </div>

        {/* Grid de Métricas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="text-lg font-semibold text-green-700 dark:text-green-400">
              {operadora.disponivel}
            </div>
            <div className="text-xs text-green-600 dark:text-green-500">Disponíveis</div>
          </div>
          
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">
              {operadora.em_locacao}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-500">Em Locação</div>
          </div>
          
          <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <div className="text-lg font-semibold text-purple-700 dark:text-purple-400">
              {operadora.em_assinatura}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-500">Em Assinatura</div>
          </div>
          
          <div className="text-center p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <div className="text-lg font-semibold text-red-700 dark:text-red-400">
              {operadora.com_problema}
            </div>
            <div className="text-xs text-red-600 dark:text-red-500">Com Problema</div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Disponibilidade</span>
            <span className="font-medium text-legal-primary">{operadora.percentual_disponivel}%</span>
          </div>
          <Progress 
            value={operadora.percentual_disponivel} 
            className="h-2"
          />
        </div>

        {/* Ação */}
        <Button 
          asChild 
          variant="outline" 
          size="sm"
          className="w-full border-legal-primary text-legal-primary hover:bg-legal-primary hover:text-white"
        >
          <Link to={`/assets/inventory?solution=CHIP&manufacturer=${operadora.id}`}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Chips
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};
