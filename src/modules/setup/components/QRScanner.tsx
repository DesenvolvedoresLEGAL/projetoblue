import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Camera, Type, AlertCircle } from 'lucide-react';
import { useQRScanner, useStartSetup } from '../hooks/useSetupData';
import { useNavigate } from 'react-router-dom';

export const QRScanner: React.FC = () => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const qrScanner = useQRScanner();
  const startSetup = useStartSetup();

  const handleScan = async (qrCode: string) => {
    try {
      setError(null);
      
      const result = await qrScanner.mutateAsync(qrCode);
      
      if (result.type === 'order') {
        // Start setup for this order
        const setupData = await startSetup.mutateAsync({
          orderId: result.id,
          // TODO: Get current technician ID from auth context
          technicianId: 'current-user-id'
        });
        
        navigate(`/setup/${setupData.setup_id}`);
      } else if (result.type === 'asset') {
        // Handle asset QR code
        navigate(`/setup/asset/${result.id}`);
      }
    } catch (err) {
      setError('Erro ao processar QR Code');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
    }
  };

  const startCamera = async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      // TODO: Implement camera access and QR scanning
      // This would use a library like html5-qrcode or react-qr-scanner
      // For now, showing placeholder
      setError('Scanner de câmera será implementado em breve. Use entrada manual.');
    } catch (err) {
      setError('Erro ao acessar a câmera');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <QrCode className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Scanner QR Code</h1>
          <p className="text-muted-foreground">
            Escaneie o QR Code do pedido ou equipamento para iniciar a instalação
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Camera Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scanner de Câmera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                {isScanning ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Preparando câmera...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      Clique no botão abaixo para ativar a câmera
                    </p>
                    <Button onClick={startCamera} disabled={isScanning}>
                      <Camera className="h-4 w-4 mr-2" />
                      Ativar Câmera
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Entrada Manual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <Input
                  placeholder="Digite o código QR (ex: BLU-O-123456)"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="text-center font-mono"
                />
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Formato esperado: BLU-O-{'{'}ID{'}'} para pedidos ou BLU-A-{'{'}ID{'}'} para ativos
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!manualCode.trim() || qrScanner.isPending || startSetup.isPending}
              >
                {qrScanner.isPending || startSetup.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Processar Código
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Como usar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                  <span className="block w-2 h-2 bg-primary rounded-full"></span>
                </div>
                <div>
                  <p className="font-medium">Scanner de Câmera</p>
                  <p className="text-muted-foreground">Aponte a câmera para o QR Code do pedido ou equipamento</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                  <span className="block w-2 h-2 bg-primary rounded-full"></span>
                </div>
                <div>
                  <p className="font-medium">Entrada Manual</p>
                  <p className="text-muted-foreground">Digite o código manualmente se não conseguir escanear</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                  <span className="block w-2 h-2 bg-primary rounded-full"></span>
                </div>
                <div>
                  <p className="font-medium">Processamento</p>
                  <p className="text-muted-foreground">O sistema iniciará automaticamente o processo de instalação</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};