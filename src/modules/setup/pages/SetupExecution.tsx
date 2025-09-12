import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, MapPin, User, QrCode, Camera, Zap, PenTool, CheckCircle } from 'lucide-react';

interface SetupInProgress {
  id: string;
  order_id: string;
  customer_name: string;
  address: string;
  status: 'in_progress' | 'completed';
  started_at: string;
  steps: {
    qr_scan: boolean;
    photos: boolean;
    speed_test: boolean;
    signature: boolean;
  };
  progress: number;
}

const mockSetups: SetupInProgress[] = [
  {
    id: 'BLU-S-001',
    order_id: 'BLU-O-001',
    customer_name: 'João Silva',
    address: 'Rua das Flores, 123 - São Paulo',
    status: 'in_progress',
    started_at: '2024-01-15T14:00:00Z',
    steps: {
      qr_scan: true,
      photos: false,
      speed_test: false,
      signature: false
    },
    progress: 25
  },
  {
    id: 'BLU-S-002',
    order_id: 'BLU-O-002',
    customer_name: 'Maria Santos',
    address: 'Av. Paulista, 456 - São Paulo',
    status: 'in_progress',
    started_at: '2024-01-14T09:00:00Z',
    steps: {
      qr_scan: true,
      photos: true,
      speed_test: true,
      signature: false
    },
    progress: 75
  }
];

const stepIcons = {
  qr_scan: QrCode,
  photos: Camera,
  speed_test: Zap,
  signature: PenTool
};

const stepLabels = {
  qr_scan: 'QR Scan',
  photos: 'Fotos',
  speed_test: 'Speed Test',
  signature: 'Assinatura'
};

export const SetupExecution: React.FC = () => {
  const handleContinueSetup = (setupId: string) => {
    // console.log('Continuando setup:', setupId);
    // TODO: Navegar para o stepper de instalação
  };

  const handleCompleteSetup = (setupId: string) => {
    // console.log('Finalizando setup:', setupId);
    // TODO: Implementar finalização do setup
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Setups em Execução</h1>
          <p className="text-muted-foreground">
            Dashboard mobile-first para técnicos em campo
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Setups Ativos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSetups.length}</div>
            <p className="text-xs text-muted-foreground">
              Suas instalações em andamento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockSetups.reduce((acc, setup) => acc + setup.progress, 0) / mockSetups.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Média de conclusão
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5h</div>
            <p className="text-xs text-muted-foreground">
              Por instalação
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Setups */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Seus Setups Ativos</h2>
        
        {mockSetups.map((setup) => (
          <Card key={setup.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{setup.customer_name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    {setup.address}
                  </CardDescription>
                </div>
                <Badge variant={setup.status === 'completed' ? 'default' : 'secondary'}>
                  {setup.status === 'in_progress' ? 'Em Progresso' : 'Concluído'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{setup.progress}%</span>
                </div>
                <Progress value={setup.progress} className="w-full" />
              </div>

              {/* Steps */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(setup.steps).map(([stepKey, completed]) => {
                  const Icon = stepIcons[stepKey as keyof typeof stepIcons];
                  return (
                    <div
                      key={stepKey}
                      className={`flex flex-col items-center p-3 rounded-lg border ${
                        completed 
                          ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300' 
                          : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-900/20 dark:border-gray-800'
                      }`}
                    >
                      <Icon className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">
                        {stepLabels[stepKey as keyof typeof stepLabels]}
                      </span>
                      {completed && (
                        <CheckCircle className="h-4 w-4 mt-1 text-green-600" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Info */}
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>ID: {setup.id}</span>
                <span>Iniciado: {new Date(setup.started_at).toLocaleDateString('pt-BR')}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {setup.progress < 100 ? (
                  <Button 
                    onClick={() => handleContinueSetup(setup.id)}
                    className="flex-1"
                  >
                    Continuar Setup
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleCompleteSetup(setup.id)}
                    className="flex-1"
                    variant="default"
                  >
                    Finalizar Setup
                  </Button>
                )}
                <Button variant="outline">
                  Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {mockSetups.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum setup ativo</h3>
            <p className="text-muted-foreground mb-4">
              Você não possui setups em andamento no momento.
            </p>
            <Button>Verificar Novos Pedidos</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};