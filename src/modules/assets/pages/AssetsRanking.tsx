
import React from 'react';
import { Trophy, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useRentedAssetsRanking } from '@modules/assets/hooks/useRentedAssetsRanking';
import { RankingCard } from '@modules/assets/components/ranking/RankingCard';
import { RankingTable } from '@modules/assets/components/ranking/RankingTable';
import { RankingMetrics } from '@modules/assets/components/ranking/RankingMetrics';

const AssetsRanking: React.FC = () => {
  const isMobile = useIsMobile();
  const { data: assets, isLoading, error, refetch } = useRentedAssetsRanking();

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-6 space-y-6">
        <StandardPageHeader
          icon={Trophy}
          title="Ranking de Locação"
          description="Equipamentos ordenados por dias locados"
        />
        
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="h-12 w-12 text-[#4D2BFB] animate-spin" />
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">Carregando Ranking</p>
            <p className="text-sm text-muted-foreground">Buscando dados de locação...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 md:px-6 space-y-6">
        <StandardPageHeader
          icon={Trophy}
          title="Ranking de Locação"
          description="Equipamentos ordenados por dias locados"
        />
        
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="p-4 bg-red-100 dark:bg-red-950/30 rounded-full">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400">
              Erro ao carregar ranking
            </h2>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Não foi possível carregar os dados do ranking. Verifique sua conexão e tente novamente.
            </p>
            <Button 
              onClick={() => refetch()} 
              className="mt-4 bg-[#4D2BFB] hover:bg-[#4D2BFB]/90 text-white"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!assets || assets.length === 0) {
    return (
      <div className="container mx-auto px-4 md:px-6 space-y-6">
        <StandardPageHeader
          icon={Trophy}
          title="Ranking de Locação"
          description="Equipamentos ordenados por dias locados"
        />
        
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Trophy className="h-16 w-16 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Nenhum equipamento encontrado
            </h2>
            <p className="text-sm text-muted-foreground">
              Não há Speedys 5G ou equipamentos cadastrados no sistema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-6 space-y-6">
      <StandardPageHeader
        icon={Trophy}
        title="Ranking de Locação"
        description={`Equipamentos ordenados por dias locados`}
      />

      {/* Métricas */}
      <RankingMetrics assets={assets} />

      {/* Conteúdo principal */}
      {isMobile ? (
        // Layout mobile - Cards
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Ranking Completo
            </h2>
            <div className="text-sm text-muted-foreground">
              {assets.filter(a => a.rented_days >= 30).length} com alto rendimento
            </div>
          </div>
          
          <div className="grid gap-4">
            {assets.map((asset) => (
              <RankingCard key={asset.uuid} asset={asset} />
            ))}
          </div>
        </div>
      ) : (
        // Layout desktop - Tabela
        <div className="space-y-4">          
          <RankingTable assets={assets} />
        </div>
      )}
    </div>
  );
};

export default AssetsRanking;
