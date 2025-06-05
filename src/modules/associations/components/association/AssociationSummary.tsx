
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Phone, Mail, Building, Hash } from 'lucide-react';
import { SelectedAsset } from '@modules/associations/types';

interface AssociationSummaryProps {
  client: any; // Replace 'any' with the actual client type
  assets: SelectedAsset[];
  generalConfig: any; // Replace 'any' with the actual generalConfig type
  onComplete: () => void;
  onBack: () => void;
}

export const AssociationSummary: React.FC<AssociationSummaryProps> = ({
  client,
  assets,
  generalConfig,
  onComplete,
  onBack
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Associação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Informações do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="h-4 w-4" />
                  Nome:
                </div>
                <div className="font-medium">{client.name}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  CNPJ:
                </div>
                <div className="font-medium">{client.cnpj}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  Endereço:
                </div>
                <div className="font-medium">{client.address}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Telefone:
                </div>
                <div className="font-medium">{client.phone}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email:
                </div>
                <div className="font-medium">{client.email}</div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Ativos Associados</h3>
            <div className="space-y-3">
              {assets.map((asset) => (
                <Card key={asset.uuid} className="border">
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Data de Registro:
                      </div>
                      <div className="font-medium">{new Date(asset.registrationDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Badge className="bg-green-100 text-green-600">
                          Status: {asset.status}
                        </Badge>
                      </div>
                      <div className="font-medium">
                        {asset.type === 'CHIP' ? `ICCID: ${asset.iccid}` : `Radio: ${asset.radio}`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button onClick={onComplete}>Confirmar Associação</Button>
      </div>
    </div>
  );
};
