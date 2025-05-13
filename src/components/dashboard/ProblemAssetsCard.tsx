
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assetService, ProblemAsset } from "@/services/api/asset";
import { CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ProblemAssetsCard: React.FC = () => {
  const { data: problemAssets = [], isLoading } = useQuery({
    queryKey: ['problem-assets'],
    queryFn: assetService.listProblemAssets
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl flex items-center">
          {problemAssets.length}
          <Badge className="ml-2 bg-red-500" variant="secondary">Critical</Badge>
        </CardTitle>
        <CardDescription>Ativos com problema</CardDescription>
      </CardHeader>
      <CardContent className="max-h-64 overflow-y-auto pt-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : problemAssets.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {problemAssets.map((asset) => (
              <li key={asset.uuid} className="truncate flex items-center gap-2">
                <CircleAlert className="h-4 w-4 text-red-500" />
                <span className="font-mono">
                  {asset.asset_types?.type?.toLowerCase() === 'chip' 
                    ? asset.iccid 
                    : asset.radio}
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
    </Card>
  );
};

export default ProblemAssetsCard;
