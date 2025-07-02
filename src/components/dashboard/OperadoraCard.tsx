
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Smartphone, ArrowRight } from 'lucide-react';

interface OperadoraCardProps {
  id: number;
  name: string;
  total: number;
  emUso: number;
  disponiveis: number;
  isLoading?: boolean;
}

export const OperadoraCard: React.FC<OperadoraCardProps> = ({
  id,
  name,
  total,
  emUso,
  disponiveis,
  isLoading = false
}) => {
  const percentualDisponivel = total > 0 ? Math.round((disponiveis / total) * 100) : 0;
  const percentualEmUso = total > 0 ? Math.round((emUso / total) * 100) : 0;

  if (isLoading) {
    return (
      <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
            <div className="h-5 w-5 bg-muted animate-pulse rounded"></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark hover:shadow-legal-md dark:hover:shadow-legal-dark-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-legal-primary dark:text-legal-secondary uppercase tracking-wide">
            {name}
          </CardTitle>
          <Smartphone className="h-5 w-5 text-legal-primary dark:text-legal-secondary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total em destaque */}
        <div className="text-center">
          <div className="text-3xl font-bold text-legal-primary dark:text-legal-secondary">
            {total.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">Total de SIM-cards</p>
        </div>

        {/* Métricas secundárias */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-xl font-semibold text-orange-600 dark:text-orange-400">
              {emUso.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Em uso</p>
            <Badge variant="secondary" className="text-xs">
              {percentualEmUso}%
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-green-600 dark:text-green-400">
              {disponiveis.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Disponíveis</p>
            <Badge variant="success" className="text-xs">
              {percentualDisponivel}%
            </Badge>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Disponibilidade</span>
            <span>{percentualDisponivel}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-legal-primary to-legal-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentualDisponivel}%` }}
            />
          </div>
        </div>

        {/* Link de ação */}
        <Link to={`/assets/inventory?manufacturer=${id}&solution=CHIP`} className="block">
          <Button variant="ghost" size="sm" className="w-full group">
            Ver detalhes
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
