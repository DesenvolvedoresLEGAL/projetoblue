
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Phone, Mail } from 'lucide-react';
import { AssociationGroup } from '../../types/associationsList';
import { AssociationExpandedRows } from './AssociationExpandedRows';

interface AssociationTableRowProps {
  group: AssociationGroup;
  onFinalizeAssociation: (associationId: string) => Promise<void>;
  onToggleExpansion: (clientId: string) => void;
  isMobile?: boolean;
}

export const AssociationTableRow: React.FC<AssociationTableRowProps> = ({
  group,
  onFinalizeAssociation,
  onToggleExpansion,
  isMobile = false
}) => {
  const toggleExpansion = () => {
    onToggleExpansion(group.client_id);
  };

  if (isMobile) {
    return (
      <Card>
        <CardContent className="p-4">
          {/* Client Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{group.client_name}</h3>
              <p className="text-sm text-muted-foreground">{group.client_empresa}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpansion}
              className="ml-2"
            >
              {group.is_expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Client Info */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-3 w-3 mr-1" />
                {group.client_contato}
              </div>
              {group.client_email && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-3 w-3 mr-1" />
                  {group.client_email}
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Responsável: {group.client_responsavel}
            </div>
          </div>

          {/* Association Stats */}
          <div className="flex items-center space-x-2 mb-3">
            <Badge variant="outline">
              Total: {group.total_associations}
            </Badge>
            {group.active_associations > 0 && (
              <Badge variant="default">
                Ativas: {group.active_associations}
              </Badge>
            )}
            {group.inactive_associations > 0 && (
              <Badge variant="secondary">
                Inativas: {group.inactive_associations}
              </Badge>
            )}
          </div>

          {/* Expanded Content */}
          {group.is_expanded && (
            <AssociationExpandedRows
              associations={group.associations}
              onFinalizeAssociation={onFinalizeAssociation}
              isMobile
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <TableRow className="cursor-pointer" onClick={toggleExpansion}>
        <TableCell>
          <Button variant="ghost" size="sm">
            {group.is_expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        <TableCell>
          <div>
            <div className="font-semibold">{group.client_name}</div>
            <div className="text-sm text-muted-foreground">{group.client_empresa}</div>
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="outline">
              {group.total_associations}
            </Badge>
            {group.active_associations > 0 && (
              <Badge variant="default" className="text-xs">
                {group.active_associations} ativas
              </Badge>
            )}
            {group.inactive_associations > 0 && (
              <Badge variant="secondary" className="text-xs">
                {group.inactive_associations} inativas
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <Phone className="h-3 w-3 mr-1" />
              {group.client_contato}
            </div>
            {group.client_email && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-3 w-3 mr-1" />
                {group.client_email}
              </div>
            )}
          </div>
        </TableCell>
        <TableCell>{group.client_responsavel}</TableCell>
        <TableCell>
          {/* Actions can be added here if needed */}
        </TableCell>
      </TableRow>

      {/* Expanded rows */}
      {group.is_expanded && (
        <TableRow>
          <TableCell colSpan={6} className="p-0">
            <AssociationExpandedRows
              associations={group.associations}
              onFinalizeAssociation={onFinalizeAssociation}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
