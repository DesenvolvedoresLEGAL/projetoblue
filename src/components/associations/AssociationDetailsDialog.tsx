
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDate } from '@/utils/formatDate';
import { formatPhoneNumber, parsePhoneFromScientific } from '@/utils/phoneFormatter';

interface Association {
  id: number;
  asset_id: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  association_id: number;
  plan_id: number;
  notes: string | null;
  gb: number;
  ssid: string | null;
  created_at: string;
  updated_at: string;
  asset: {
    uuid: string;
    iccid: string | null;
    radio: string | null;
    serial_number: string | null;
    model: string | null;
    line_number: number | null;
    solution: string;
    manufacturer: string;
    status: string;
  };
  client: {
    uuid: string;
    nome: string;
    cnpj: string;
    email: string | null;
    contato: number;
  };
  plan: {
    nome: string;
  };
  association_type: {
    type: string;
  };
}

interface AssociationDetailsDialogProps {
  association: Association;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssociationDetailsDialog: React.FC<AssociationDetailsDialogProps> = ({
  association,
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Associação #{association.id}</DialogTitle>
          <DialogDescription>
            Informações completas da associação entre ativo e cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status da Associação */}
          <div className="flex items-center gap-2">
            <strong>Status:</strong>
            {association.exit_date ? (
              <Badge variant="secondary">Encerrada</Badge>
            ) : (
              <Badge variant="default">Ativa</Badge>
            )}
          </div>

          {/* Informações do Ativo */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">Ativo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Tipo/Solução:</strong>
                <p>{association.asset.solution}</p>
              </div>
              <div>
                <strong>Fabricante:</strong>
                <p>{association.asset.manufacturer}</p>
              </div>
              {association.asset.model && (
                <div>
                  <strong>Modelo:</strong>
                  <p>{association.asset.model}</p>
                </div>
              )}
              {association.asset.iccid && (
                <div>
                  <strong>ICCID:</strong>
                  <p>{association.asset.iccid}</p>
                </div>
              )}
              {association.asset.line_number && (
                <div>
                  <strong>Linha:</strong>
                  <p>{formatPhoneNumber(association.asset.line_number)}</p>
                </div>
              )}
              {association.asset.radio && (
                <div>
                  <strong>Rádio:</strong>
                  <p>{association.asset.radio}</p>
                </div>
              )}
              {association.asset.serial_number && (
                <div>
                  <strong>Número de Série:</strong>
                  <p>{association.asset.serial_number}</p>
                </div>
              )}
              <div>
                <strong>Status do Ativo:</strong>
                <p>{association.asset.status}</p>
              </div>
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Nome:</strong>
                <p>{association.client.nome}</p>
              </div>
              <div>
                <strong>CNPJ:</strong>
                <p>{association.client.cnpj}</p>
              </div>
              <div>
                <strong>Telefone:</strong>
                <p>{formatPhoneNumber(parsePhoneFromScientific(association.client.contato))}</p>
              </div>
              {association.client.email && (
                <div>
                  <strong>Email:</strong>
                  <p>{association.client.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informações da Associação */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">Detalhes da Associação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Tipo de Associação:</strong>
                <p>{association.association_type.type}</p>
              </div>
              <div>
                <strong>Plano:</strong>
                <p>{association.plan.nome}</p>
              </div>
              <div>
                <strong>Data de Início:</strong>
                <p>{formatDate(association.entry_date)}</p>
              </div>
              <div>
                <strong>Data de Fim:</strong>
                <p>{association.exit_date ? formatDate(association.exit_date) : 'Não definida'}</p>
              </div>
              {association.gb > 0 && (
                <div>
                  <strong>GB Alocados:</strong>
                  <p>{association.gb} GB</p>
                </div>
              )}
              {association.ssid && (
                <div>
                  <strong>SSID:</strong>
                  <p>{association.ssid}</p>
                </div>
              )}
            </div>
            {association.notes && (
              <div>
                <strong>Observações:</strong>
                <p className="bg-muted p-2 rounded text-sm">{association.notes}</p>
              </div>
            )}
          </div>

          {/* Informações do Sistema */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">Informações do Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Criado em:</strong>
                <p>{formatDate(association.created_at)}</p>
              </div>
              <div>
                <strong>Última atualização:</strong>
                <p>{formatDate(association.updated_at)}</p>
              </div>
              <div>
                <strong>ID do Ativo:</strong>
                <p className="font-mono text-xs">{association.asset_id}</p>
              </div>
              <div>
                <strong>ID do Cliente:</strong>
                <p className="font-mono text-xs">{association.client_id}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
