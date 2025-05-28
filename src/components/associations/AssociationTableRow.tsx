
import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, XCircle } from "lucide-react";
import { getAssetIdentifier } from "@/utils/formatters";
import { AssociationStatusBadge } from "./AssociationStatusBadge";
import { ConfirmationModal } from "../association/ConfirmationModal";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Association {
  id: number;
  asset_id: string;
  client_id: string;
  entry_date: string;
  exit_date: string | null;
  association_id: number;
  created_at: string;
  client_name: string;
  asset_iccid: string | null;
  asset_radio: string | null;
  asset_line_number: number | null;
  asset_solution_id: number;
  asset_solution_name: string;
}

interface AssociationTableRowProps {
  association: Association;
  onEdit: (association: Association) => void;
  onEndAssociation: (associationId: number) => void;
}

export const AssociationTableRow: React.FC<AssociationTableRowProps> = ({ 
  association, 
  onEdit,
  onEndAssociation
}) => {
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);

  // Função para formatar datas corrigindo o problema de timezone
  const formatDateCorrect = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Verificar se a associação está ativa (não tem data de saída ou a data é futura)
  const isActive = !association.exit_date || new Date(association.exit_date) > new Date();

  // Função melhorada para obter identificador do ativo
  const getImprovedAssetIdentifier = (assoc: Association) => {
    // Para CHIP, usar line_number primeiro, depois iccid
    if (assoc.asset_solution_name?.toUpperCase() === "CHIP" || assoc.asset_solution_id === 11) {
      return assoc.asset_line_number?.toString() || assoc.asset_iccid || "N/A";
    }
    // Para outros ativos, usar radio
    return assoc.asset_radio || "N/A";
  };

  const handleEndAssociation = () => {
    onEndAssociation(association.id);
    setShowEndConfirmation(false);
  };

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          #{association.id}
        </TableCell>
        <TableCell>
          <div>
            <div className="font-medium">
              {getImprovedAssetIdentifier(association)}
            </div>
            <div className="text-sm text-muted-foreground">
              {association.asset_solution_name}
            </div>
          </div>
        </TableCell>
        <TableCell>
          {association.client_name}
        </TableCell>
        <TableCell>
          {formatDateCorrect(association.entry_date)}
        </TableCell>
        <TableCell>
          {formatDateCorrect(association.exit_date)}
        </TableCell>
        <TableCell>
          <AssociationStatusBadge exitDate={association.exit_date} />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(association)}
              className="h-8 w-8 p-0 hover:bg-muted"
              title="Editar associação"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            {isActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEndConfirmation(true)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 text-destructive hover:text-destructive"
                title="Encerrar associação"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Modal de Confirmação para Encerrar Associação */}
      <ConfirmationModal
        open={showEndConfirmation}
        onOpenChange={setShowEndConfirmation}
        onConfirm={handleEndAssociation}
        title="Encerrar Associação"
        description={`Tem certeza que deseja encerrar a associação do ativo ${getImprovedAssetIdentifier(association)} com o cliente ${association.client_name}? Esta ação definirá a data de fim como hoje e o status do ativo será atualizado.`}
        confirmText="Encerrar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  );
};
