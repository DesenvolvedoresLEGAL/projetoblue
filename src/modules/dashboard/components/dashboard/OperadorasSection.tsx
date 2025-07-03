
import React from 'react';
import { OperadoraCard } from './OperadoraCard';
import { OperadoraStats, useOperadorasStats } from '@modules/dashboard/hooks/useOperadorasStats';
import { AlertTriangle } from 'lucide-react';

export const OperadorasSection: React.FC = () => {
  const { data: operadoras, isLoading, error } = useOperadorasStats();

  // Estado de erro
  if (error && !isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="col-span-full flex items-center justify-center p-6 bg-red-50 dark:bg-red-950/30 rounded-lg">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto" />
            <p className="text-sm text-red-600 dark:text-red-400">
              Erro ao carregar dados das operadoras
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Estado de loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[...Array(3)].map((_, index) => (
          <OperadoraCard 
            key={index} 
            operadora={{} as OperadoraStats} 
            isLoading={true} 
          />
        ))}
      </div>
    );
  }

  // Estado vazio
  if (!operadoras || operadoras.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="col-span-full text-center py-8 text-muted-foreground">
          <p>Nenhuma operadora encontrada</p>
        </div>
      </div>
    );
  }

  // Garantir que temos exatamente as 3 operadoras principais (VIVO, TIM, CLARO)
  const operadorasOrdenadas = [...operadoras].sort((a, b) => {
    const ordem = { 'VIVO': 1, 'TIM': 2, 'CLARO': 3 };
    const ordemA = ordem[a.nome as keyof typeof ordem] || 999;
    const ordemB = ordem[b.nome as keyof typeof ordem] || 999;
    return ordemA - ordemB;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {operadorasOrdenadas.map((operadora) => (
        <OperadoraCard 
          key={operadora.id} 
          operadora={operadora}
        />
      ))}
    </div>
  );
};
