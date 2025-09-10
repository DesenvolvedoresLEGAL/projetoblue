import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Wifi, 
  PenTool, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  QrCode,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useCompleteSetup } from '../hooks/useSetupData';
import type { SetupDetailedView, SetupFormData } from '../types';

interface InstallationStepperProps {
  setup: SetupDetailedView;
  onComplete: () => void;
}

type Step = 'scan' | 'summary' | 'photos' | 'speedtest' | 'signature' | 'confirmation';

export const InstallationStepper: React.FC<InstallationStepperProps> = ({
  setup,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('scan');
  const [formData, setFormData] = useState<Partial<SetupFormData>>({
    photos: [],
    speed_test: { download_mbps: 0, upload_mbps: 0, ping_ms: 0 },
    signature: '',
    signer_name: ''
  });

  const completeSetup = useCompleteSetup();

  const steps: { key: Step; title: string; icon: React.ComponentType<any>; description: string }[] = [
    { key: 'scan', title: 'Escaneamento', icon: QrCode, description: 'Validar equipamentos' },
    { key: 'summary', title: 'Resumo', icon: MapPin, description: 'Confirmar dados' },
    { key: 'photos', title: 'Evidências', icon: Camera, description: 'Fotografar instalação' },
    { key: 'speedtest', title: 'Velocidade', icon: Wifi, description: 'Teste de velocidade' },
    { key: 'signature', title: 'Assinatura', icon: PenTool, description: 'Colher assinatura' },
    { key: 'confirmation', title: 'Finalização', icon: CheckCircle, description: 'Confirmar conclusão' }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const handlePrev = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleComplete = async () => {
    if (formData as SetupFormData) {
      await completeSetup.mutateAsync({
        setupId: setup.id,
        formData: formData as SetupFormData
      });
      onComplete();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'scan': return true; // QR already scanned
      case 'summary': return true; // Just confirmation
      case 'photos': return formData.photos && formData.photos.length > 0;
      case 'speedtest': return formData.speed_test && formData.speed_test.download_mbps > 0;
      case 'signature': return formData.signature && formData.signer_name;
      case 'confirmation': return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'scan':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <QrCode className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-semibold mb-2">QR Code Validado</h2>
              <p className="text-muted-foreground">Equipamentos confirmados para instalação</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Ativos para Instalação:</h3>
              {setup.asset_serials?.map((serial) => (
                <div key={serial} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-mono text-sm">{serial}</span>
                  <Badge variant="default">Confirmado</Badge>
                </div>
              ))}
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Resumo da Instalação</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Tipo de Serviço</h3>
                  <Badge variant="outline">
                    {setup.order_type === 'install' ? 'Instalação' : 'Desinstalação'}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Cliente</h3>
                  <p className="text-sm">{setup.customer_id}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Agendamento</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {setup.order_scheduled_at ? 
                      new Date(setup.order_scheduled_at).toLocaleString('pt-BR') : 
                      'Não agendado'
                    }
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Endereço</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      {setup.address ? JSON.stringify(setup.address) : 'Endereço não informado'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Evidências Fotográficas</h2>
            
            <Alert>
              <Camera className="h-4 w-4" />
              <AlertDescription>
                Tire fotos da instalação para documentar o trabalho realizado.
                Mínimo de 3 fotos são necessárias.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button className="w-full h-12" variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Tirar Foto ({formData.photos?.length || 0})
              </Button>
              
              {formData.photos && formData.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">Foto {index + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'speedtest':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Teste de Velocidade</h2>
            
            <Alert>
              <Wifi className="h-4 w-4" />
              <AlertDescription>
                Execute o teste de velocidade para validar a qualidade da conexão.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formData.speed_test?.download_mbps || 0}
                </div>
                <div className="text-sm text-muted-foreground">Mbps Down</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formData.speed_test?.upload_mbps || 0}
                </div>
                <div className="text-sm text-muted-foreground">Mbps Up</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {formData.speed_test?.ping_ms || 0}
                </div>
                <div className="text-sm text-muted-foreground">ms Ping</div>
              </div>
            </div>

            <Button 
              className="w-full h-12" 
              onClick={() => {
                // TODO: Implement speed test
                setFormData(prev => ({
                  ...prev,
                  speed_test: {
                    download_mbps: Math.round(Math.random() * 100 + 50),
                    upload_mbps: Math.round(Math.random() * 50 + 25),
                    ping_ms: Math.round(Math.random() * 50 + 10)
                  }
                }));
              }}
            >
              <Wifi className="h-4 w-4 mr-2" />
              Executar Teste
            </Button>
          </div>
        );

      case 'signature':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold mb-4">Assinatura do Cliente</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center">
                <div className="text-center">
                  <PenTool className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {formData.signature ? 'Assinatura capturada' : 'Toque para assinar'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Nome do Assinante</label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Digite o nome completo"
                  value={formData.signer_name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, signer_name: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-semibold mb-2">Instalação Concluída</h2>
              <p className="text-muted-foreground">Revise as informações antes de finalizar</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Fotos:</span>
                  <span className="font-medium">{formData.photos?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Velocidade:</span>
                  <span className="font-medium">
                    {formData.speed_test?.download_mbps || 0} Mbps
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Assinatura:</span>
                  <span className="font-medium">
                    {formData.signature ? 'Coletada' : 'Pendente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Assinante:</span>
                  <span className="font-medium">{formData.signer_name || 'N/A'}</span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-12" 
              onClick={handleComplete}
              disabled={completeSetup.isPending}
            >
              {completeSetup.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar Instalação
                </>
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Instalação #{setup.id.substring(0, 8)}</h1>
            <p className="text-muted-foreground">
              {setup.order_type === 'install' ? 'Instalação' : 'Desinstalação'} • 
              Cliente: {setup.customer_id}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Etapa {currentStepIndex + 1} de {steps.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div key={step.key} className="flex items-center">
                <div
                  className={`flex flex-col items-center min-w-0 ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`rounded-full p-2 mb-1 ${
                      isCurrent
                        ? 'bg-primary text-white'
                        : isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">{step.title}</span>
                  <span className="text-xs opacity-75">{step.description}</span>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        {currentStep !== 'confirmation' ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : null}
      </div>

      {/* Error handling */}
      {completeSetup.error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao finalizar instalação: {completeSetup.error.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};