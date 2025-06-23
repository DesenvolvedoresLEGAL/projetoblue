
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  BarChart3,
  Database,
  Loader2
} from "lucide-react";
import { rentedDaysService, BatchUpdateResult, IntegrityCheckResult } from '../../services/rentedDaysService';

export const RentedDaysManagement: React.FC = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [lastBatchResult, setLastBatchResult] = useState<BatchUpdateResult | null>(null);
  const [integrityResults, setIntegrityResults] = useState<IntegrityCheckResult[]>([]);
  const [stats, setStats] = useState<any>(null);

  const handleUpdateAll = async () => {
    setIsUpdating(true);
    try {
      const result = await rentedDaysService.updateAllRentedDays();
      setLastBatchResult(result);
      
      // Atualizar estatísticas após o processamento
      if (result?.success) {
        await loadStats();
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleValidateIntegrity = async () => {
    setIsValidating(true);
    try {
      const results = await rentedDaysService.validateIntegrity();
      setIntegrityResults(results);
    } finally {
      setIsValidating(false);
    }
  };

  const loadStats = async () => {
    const statsData = await rentedDaysService.getRentedDaysStats();
    setStats(statsData);
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-legal-primary">Gestão de Dias Alugados</h2>
          <p className="text-muted-foreground">
            Atualize e monitore os dados de rented_days dos ativos
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estatísticas Gerais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-legal-primary">{stats.total_assets}</div>
                <div className="text-sm text-muted-foreground">Total de Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-legal-secondary">{stats.assets_with_rented_days}</div>
                <div className="text-sm text-muted-foreground">Com Histórico</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.max_rented_days}</div>
                <div className="text-sm text-muted-foreground">Máximo de Dias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.avg_rented_days}</div>
                <div className="text-sm text-muted-foreground">Média de Dias</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Atualização em Lote */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Atualização em Lote
            </CardTitle>
            <CardDescription>
              Recalcula rented_days para todos os ativos baseado em associações finalizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                <strong>Preserva valores históricos:</strong> Apenas adiciona dias de associações 
                finalizadas do sistema Blue. Valores nunca diminuem.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleUpdateAll}
              disabled={isUpdating}
              className="w-full"
              variant="default"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Todos os Ativos
                </>
              )}
            </Button>

            {lastBatchResult && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium mb-2">Último Processamento:</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <Badge variant="outline">{lastBatchResult.total_processed}</Badge>
                    <div className="text-muted-foreground">Processados</div>
                  </div>
                  <div>
                    <Badge variant="default">{lastBatchResult.total_updated}</Badge>
                    <div className="text-muted-foreground">Atualizados</div>
                  </div>
                  <div>
                    <Badge variant={lastBatchResult.total_errors > 0 ? "destructive" : "secondary"}>
                      {lastBatchResult.total_errors}
                    </Badge>
                    <div className="text-muted-foreground">Erros</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Validação de Integridade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Validação de Integridade
            </CardTitle>
            <CardDescription>
              Verifica se os valores atuais estão consistentes com as associações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Valida uma amostra de 10 ativos para verificar consistência dos dados.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={handleValidateIntegrity}
              disabled={isValidating}
              className="w-full"
              variant="outline"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validar Integridade
                </>
              )}
            </Button>

            {integrityResults.length > 0 && (
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {integrityResults.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded border text-xs ${
                      result.is_consistent 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">
                        {result.asset_id.substring(0, 8)}...
                      </span>
                      <Badge 
                        variant={result.is_consistent ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {result.current_rented_days} dias
                      </Badge>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      {result.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-legal-primary mb-2">Lógica de Cálculo:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Preserva valor histórico atual (pré-Blue)</li>
                <li>• Soma apenas associações com exit_date</li>
                <li>• Elimina sobreposição de períodos</li>
                <li>• Nunca diminui valores existentes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-legal-secondary mb-2">Segurança:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Função idempotente (executável múltiplas vezes)</li>
                <li>• Logs detalhados para auditoria</li>
                <li>• Processamento individual por ativo</li>
                <li>• Validação de integridade disponível</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
