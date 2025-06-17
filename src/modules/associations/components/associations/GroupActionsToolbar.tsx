
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  edit, 
  trash-2, 
  x 
} from "lucide-react";
import { AssociationGroup } from '@/types/associations';
import { useGroupActions } from '../../hooks/useGroupActions';
import { BulkEditDialog } from './BulkEditDialog';
import { ConfirmationModal } from '../association/ConfirmationModal';

interface GroupActionsToolbarProps {
  group: AssociationGroup;
  onEndGroup: (groupKey: string) => void;
  isEndingGroup: boolean;
}

export const GroupActionsToolbar: React.FC<GroupActionsToolbarProps> = ({
  group,
  onEndGroup,
  isEndingGroup
}) => {
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [showSoftDeleteConfirm, setShowSoftDeleteConfirm] = useState(false);
  const { softDeleteGroup, changeGroupAssociationType } = useGroupActions();

  const handleSoftDelete = () => {
    softDeleteGroup.mutate(group);
    setShowSoftDeleteConfirm(false);
  };

  const handleChangeAssociationType = (newType: number) => {
    changeGroupAssociationType.mutate({ group, newType });
  };

  const activeAssociationsCount = group.associations.filter(a => 
    !a.exit_date || a.exit_date > new Date().toISOString().split('T')[0]
  ).length;

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Botão Encerrar Grupo */}
        {group.canEndGroup && activeAssociationsCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEndGroup(group.groupKey)}
            disabled={isEndingGroup}
            className="h-8 px-3 hover:bg-destructive/10 text-destructive hover:text-destructive"
            title={`Encerrar ${activeAssociationsCount} associação${activeAssociationsCount > 1 ? 'ões' : ''} ativa${activeAssociationsCount > 1 ? 's' : ''}`}
          >
            <x className="h-4 w-4 mr-1" />
            Encerrar Grupo
          </Button>
        )}

        {/* Menu de Ações */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowBulkEdit(true)}>
              <edit className="h-4 w-4 mr-2" />
              Editar em Lote
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleChangeAssociationType(1)}
              disabled={group.associations.every(a => a.association_id === 1)}
            >
              Alterar para Aluguel
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleChangeAssociationType(2)}
              disabled={group.associations.every(a => a.association_id === 2)}
            >
              Alterar para Assinatura
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setShowSoftDeleteConfirm(true)}
              className="text-destructive"
            >
              <trash-2 className="h-4 w-4 mr-2" />
              Remover Grupo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialog de Edição em Lote */}
      <BulkEditDialog
        open={showBulkEdit}
        onOpenChange={setShowBulkEdit}
        group={group}
      />

      {/* Confirmação de Soft Delete */}
      <ConfirmationModal
        open={showSoftDeleteConfirm}
        onOpenChange={setShowSoftDeleteConfirm}
        onConfirm={handleSoftDelete}
        title="Remover Grupo de Associações"
        description={`Tem certeza que deseja remover permanentemente ${group.totalAssets} associação${group.totalAssets > 1 ? 'ões' : ''} do cliente ${group.client_name}? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  );
};
