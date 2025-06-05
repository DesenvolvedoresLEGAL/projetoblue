
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChipWithMetrics } from "@/types/dataUsage";
import { formatDataSize } from "@/utils/formatDataSize";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Upload, 
  SignalHigh,
  SignalMedium,
  SignalLow,
  WifiOff,
  Wifi,
  CircleAlert
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChipSummaryCardsProps {
  chips: ChipWithMetrics[];
}

const SignalQualityIcon = ({ quality }: { quality?: string }) => {
  switch (quality) {
    case 'GOOD':
      return <SignalHigh className="h-4 w-4 text-green-500" />;
    case 'UNSTABLE':
      return <SignalMedium className="h-4 w-4 text-yellow-500" />;
    case 'POOR':
      return <SignalLow className="h-4 w-4 text-red-500" />;
    default:
      return <WifiOff className="h-4 w-4 text-gray-500" />;
  }
};

const StatusIcon = ({ isOnline }: { isOnline?: boolean }) => {
  return isOnline ? 
    <Wifi className="h-4 w-4 text-green-500" /> : 
    <WifiOff className="h-4 w-4 text-red-500" />;
};

export const ChipSummaryCards: React.FC<ChipSummaryCardsProps> = ({ chips }) => {
  if (chips.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <CircleAlert className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Nenhum chip encontrado com os filtros atuais.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {chips.map((chip) => (
        <Card key={chip.id} className={
          chip.quality?.status === 'POOR' ? 'border-red-200 bg-red-50' : 
          chip.quality?.status === 'UNSTABLE' ? 'border-yellow-200 bg-yellow-50' : 
          'border'
        }>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium truncate">
                {chip.clientName || 'Cliente não identificado'}
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant={
                      chip.isOnline ? "success" : "destructive"
                    } className="ml-2">
                      <StatusIcon isOnline={chip.isOnline} />
                      <span className="ml-1 text-xs">
                        {chip.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{chip.isOnline ? 'Chip ativo e conectado' : 'Chip sem conexão'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-xs text-gray-500 grid grid-cols-2 gap-1">
                <div>
                  <span className="font-medium">Telefone:</span> {chip.phoneNumber}
                </div>
                <div>
                  <span className="font-medium">ICCID:</span> {chip.iccid || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Operadora:</span> {chip.carrier}
                </div>
                <div>
                  <span className="font-medium">Região:</span> {chip.region || 'N/A'}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3 text-blue-500" />
                  <span className="font-medium text-gray-700">
                    {formatDataSize(chip.metrics?.download || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Upload className="h-3 w-3 text-green-500" />
                  <span className="font-medium text-gray-700">
                    {formatDataSize(chip.metrics?.upload || 0)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-1 border-t text-xs">
                <div className="flex items-center gap-1">
                  <SignalQualityIcon quality={chip.quality?.status} />
                  <span className={
                    chip.quality?.status === 'GOOD' ? 'text-green-600' :
                    chip.quality?.status === 'UNSTABLE' ? 'text-yellow-600' :
                    chip.quality?.status === 'POOR' ? 'text-red-600' : 
                    'text-gray-500'
                  }>
                    {chip.quality?.status === 'GOOD' ? 'Sinal bom' :
                     chip.quality?.status === 'UNSTABLE' ? 'Sinal médio' :
                     chip.quality?.status === 'POOR' ? 'Sinal ruim' : 
                     'Sem dados'}
                  </span>
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-gray-500 cursor-help">
                        {chip.metrics?.lastUpdated ? 
                          new Date(chip.metrics.lastUpdated).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Última atualização: {chip.metrics?.lastUpdated ? 
                        new Date(chip.metrics.lastUpdated).toLocaleString('pt-BR') : 
                        'Não disponível'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
