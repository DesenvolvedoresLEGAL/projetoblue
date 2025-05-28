
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { getAssetIdentifier } from "@/utils/formatters";
import { AssociationStatusBadge } from "./AssociationStatusBadge";
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
  asset_solution_id: number;
  asset_solution_name: string;
}

interface AssociationTableRowProps {
  association: Association;
  onEdit: (association: Association) => void;
}

export const AssociationTableRow: React.FC<AssociationTableRowProps> = ({ 
  association, 
  onEdit 
}) => {
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

  return (
    <TableRow>
      <TableCell className="font-medium">
        #{association.id}
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">
            {getAssetIdentifier(association)}
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(association)}
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Editar associação"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
