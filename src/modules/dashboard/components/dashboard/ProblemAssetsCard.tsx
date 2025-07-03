
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { assetService } from "@modules/assets/services/asset";
import { CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const ProblemAssetsCard: React.FC = () => {
  const { data: problemAssets = [], isLoading } = useQuery({
    queryKey: ['problem-assets'],
    queryFn: async () => {
      try {
        // Buscar ativos com problema e dados de solução
        const assets = await assetService.listProblemAssets();
        
        // Buscar soluções para mapear solution_id para nome da solução
        const { data: solutions } = await supabase.from('asset_solutions').select('id, solution');
        
        // Retornar ativos com info de solução
        return assets.map(asset => {
          const solution = solutions?.find(s => s.id === asset.solution_id);
          return {
            ...asset,
            solutionName: solution?.solution || 'Desconhecida'
          };
        });
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error fetching problem assets:', error);
        return [];
      }
    }
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl flex items-center">
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <>
              {problemAssets.length}
              <Badge className="ml-2 bg-red-500" variant="secondary">Crítico</Badge>
            </>
          )}
        </CardTitle>
        <CardDescription>Ativos com problema</CardDescription>
      </CardHeader>
      <CardContent className="max-h-64 overflow-y-auto pt-2">
        {isLoading ? (
          <div className="space-y-2">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : problemAssets.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {problemAssets.map((asset) => (
              <li key={asset.uuid} className="truncate flex items-center gap-2">
                <CircleAlert className="h-4 w-4 text-red-500" />
                <span className="font-mono">
                  {asset.solution_id === 11 
                    ? asset.radio || 'N/A'
                    : asset.radio || 'N/A'}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({asset.solutionName})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum ativo com problema encontrado.
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Link to="/assets/inventory?status=problem" className="w-full">
          <Button variant="outline" className="w-full">
            Ver todos os ativos com problema
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProblemAssetsCard;
