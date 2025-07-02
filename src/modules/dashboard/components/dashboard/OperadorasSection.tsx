import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { OperadoraCard } from "./OperadoraCard";
import { useOperadorasStats } from "../../hooks/useOperadorasStats";

/**
 * OperadorasSection - Seção de cards de operadoras para o dashboard
 * Integra o hook useOperadorasStats com tratamento de estados
 */
export const OperadorasSection: React.FC = () => {
  const { data: operadoras, isLoading, error } = useOperadorasStats();

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-legal-dark dark:text-text-primary-dark">
            Estatísticas por Operadora
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="legal-card p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-8 w-12 mx-auto" />
              <Skeleton className="h-2 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-legal-dark dark:text-text-primary-dark">
          Estatísticas por Operadora
        </h2>
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
          <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
            Erro ao carregar operadoras
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300 text-center">
            Não foi possível carregar as estatísticas das operadoras. Tente novamente.
          </p>
        </div>
      </div>
    );
  }

  // Estado vazio
  if (!operadoras || operadoras.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-legal-dark dark:text-text-primary-dark">
          Estatísticas por Operadora
        </h2>
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Nenhuma operadora encontrada
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Não há operadoras cadastradas no sistema ou não há SIM-cards associados.
          </p>
        </div>
      </div>
    );
  }

  // Estado com dados
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-legal-dark dark:text-text-primary-dark">
          Estatísticas por Operadora
        </h2>
        <div className="px-2 py-1 bg-legal-primary/10 dark:bg-legal-primary/20 text-legal-primary rounded-full text-xs font-medium">
          {operadoras.length} operadora{operadoras.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {operadoras.map((operadora) => (
          <OperadoraCard
            key={operadora.id}
            operadora={operadora}
          />
        ))}
      </div>
    </div>
  );
};

export default OperadorasSection;