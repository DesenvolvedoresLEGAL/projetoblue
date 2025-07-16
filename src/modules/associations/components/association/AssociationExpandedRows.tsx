
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarCheck, CalendarX, Wifi, Lock, X } from 'lucide-react';
import { AssociationWithDetails } from '../../types/associationsList';
import { 
  getAssetDisplayName, 
  getAssetTypeBadgeColor, 
  getAssetTypeLabel 
} from '../../utils/associationsUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AssociationExpandedRowsProps {
  associations: AssociationWithDetails[];
  onFinalizeAssociation: (associationId: string) => Promise<void>;
  isMobile?: boolean;
}

export const AssociationExpandedRows: React.FC<AssociationExpandedRowsProps> = ({
  associations,
  onFinalizeAssociation,
  isMobile = false
}) => {
  // Group associations by status
  const activeAssociations = associations.filter(a => a.status);
  const inactiveAssociations = associations.filter(a => !a.status);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const AssociationCard = ({ association }: { association: AssociationWithDetails }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        {/* Asset Info */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getAssetTypeBadgeColor(association)}>
                {getAssetTypeLabel(association)}
              </Badge>
              {association.status && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Ativo
                </Badge>
              )}
              {!association.status && (
                <Badge variant="secondary">
                  Inativo
                </Badge>
              )}
            </div>
            <div className="font-medium text-lg mb-1">
              {getAssetDisplayName(association)}
            </div>
            {association.equipment_model && (
              <div className="text-sm text-muted-foreground">
                {association.equipment_model} • {association.equipment_serial_number}
              </div>
            )}
          </div>
          
          {association.status && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <X className="h-4 w-4 mr-1" />
                  Finalizar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Finalizar Associação</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja finalizar esta associação? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onFinalizeAssociation(association.uuid)}>
                    Finalizar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex items-center space-x-2 text-sm">
            <CalendarCheck className="h-4 w-4 text-green-600" />
            <span>Entrada: {formatDate(association.entry_date)}</span>
          </div>
          {association.exit_date && (
            <div className="flex items-center space-x-2 text-sm">
              <CalendarX className="h-4 w-4 text-red-600" />
              <span>Saída: {formatDate(association.exit_date)}</span>
            </div>
          )}
        </div>

        {/* Association Details */}
        <div className="space-y-2 text-sm">
          <div>
            <strong>Tipo:</strong> {association.association_type_name}
          </div>
          {association.plan_name && (
            <div>
              <strong>Plano:</strong> {association.plan_name}
              {association.plan_gb && ` (${association.plan_gb}GB)`}
            </div>
          )}
          {association.equipment_ssid && (
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4" />
              <span>SSID: {association.equipment_ssid}</span>
              {association.equipment_pass && (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Senha: {association.equipment_pass}</span>
                </>
              )}
            </div>
          )}
          {association.notes && (
            <div>
              <strong>Observações:</strong> {association.notes}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <div className="mt-4 space-y-4">
        {activeAssociations.length > 0 && (
          <div>
            <h4 className="font-semibold text-green-600 mb-2">Associações Ativas</h4>
            {activeAssociations.map(association => (
              <AssociationCard key={association.uuid} association={association} />
            ))}
          </div>
        )}
        
        {inactiveAssociations.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-600 mb-2">Associações Inativas</h4>
            {inactiveAssociations.map(association => (
              <AssociationCard key={association.uuid} association={association} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-muted/30 p-4">
      {activeAssociations.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-green-600 mb-3 flex items-center">
            Associações Ativas ({activeAssociations.length})
          </h4>
          <div className="space-y-3">
            {activeAssociations.map(association => (
              <AssociationCard key={association.uuid} association={association} />
            ))}
          </div>
        </div>
      )}
      
      {activeAssociations.length > 0 && inactiveAssociations.length > 0 && (
        <Separator className="my-4" />
      )}
      
      {inactiveAssociations.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-600 mb-3 flex items-center">
            Associações Inativas ({inactiveAssociations.length})
          </h4>
          <div className="space-y-3">
            {inactiveAssociations.map(association => (
              <AssociationCard key={association.uuid} association={association} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
