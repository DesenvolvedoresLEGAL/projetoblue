
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Users, Phone, Building } from 'lucide-react';
import { useAssociationsList } from '../hooks/useAssociationsList';
import { formatPhone } from '../utils/associationFormatters';
import ExpandedAssociations from '../components/ExpandedAssociations';

const AssociationsList: React.FC = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { clientGroups, stats, loading, error } = useAssociationsList();
  
  const toggleRow = (clientId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedRows(newExpanded);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando associações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-600">
          <p className="font-medium">Erro ao carregar associações</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">
            Listagem de Associações
          </h1>
        </div>
        <p className="text-muted-foreground">
          Visualize e gerencie todas as associações de clientes com seus equipamentos
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total de Clientes</div>
            <div className="text-2xl font-semibold text-foreground">{stats.totalClients}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total de Associações</div>
            <div className="text-2xl font-semibold text-foreground">{stats.totalAssociations}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Associações Ativas</div>
            <div className="text-2xl font-semibold text-green-600">{stats.activeAssociations}</div>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">Cliente</th>
                <th className="text-left p-4 font-medium text-foreground">Total Associações</th>
                <th className="text-left p-4 font-medium text-foreground">Contato</th>
                <th className="text-left p-4 font-medium text-foreground">Responsável</th>
                <th className="w-12 p-4"></th>
              </tr>
            </thead>
            <tbody>
              {clientGroups.map((group) => (
                <React.Fragment key={group.client.uuid}>
                  {/* Linha principal do cliente */}
                  <tr 
                    className="border-b hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => toggleRow(group.client.uuid)}
                  >
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{group.client.nome}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="h-4 w-4" />
                          {group.client.empresa}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{group.totalAssociations}</div>
                        <div className="text-sm text-muted-foreground">
                          <span className="text-green-600">{group.activeAssociations} ativas</span>
                          {group.inactiveAssociations > 0 && (
                            <span className="text-muted-foreground"> • {group.inactiveAssociations} inativas</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{formatPhone(group.client.contato)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-foreground">{group.client.responsavel}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        {expandedRows.has(group.client.uuid) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Linhas expandidas com detalhes das associações */}
                  {expandedRows.has(group.client.uuid) && (
                    <tr>
                      <td colSpan={5} className="p-0">
                        <ExpandedAssociations 
                          associations={group.associations}
                          clientName={group.client.nome}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer com informações */}
      <div className="text-sm text-muted-foreground text-center">
        Mostrando {stats.totalClients} clientes com{' '}
        {stats.totalAssociations} associações no total
      </div>
    </div>
  );
};

export default AssociationsList;
