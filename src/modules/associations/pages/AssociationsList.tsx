
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Users, Phone, Building } from 'lucide-react';
import { generateMockAssociations } from '../data/mockData';
import { ClientAssociationGroup, AssociationWithRelations } from '../types/associationsTypes';

const AssociationsList: React.FC = () => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Gerar dados mockados
  const mockAssociations = useMemo(() => generateMockAssociations(), []);
  
  // Agrupar associações por cliente
  const clientGroups = useMemo(() => {
    const groups = new Map<string, ClientAssociationGroup>();
    
    mockAssociations.forEach(association => {
      const clientId = association.client_id;
      
      if (!groups.has(clientId)) {
        groups.set(clientId, {
          client: association.client,
          associations: [],
          totalAssociations: 0,
          activeAssociations: 0,
          inactiveAssociations: 0
        });
      }
      
      const group = groups.get(clientId)!;
      group.associations.push(association);
      group.totalAssociations++;
      
      if (association.status) {
        group.activeAssociations++;
      } else {
        group.inactiveAssociations++;
      }
    });
    
    return Array.from(groups.values());
  }, [mockAssociations]);
  
  const toggleRow = (clientId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedRows(newExpanded);
  };
  
  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };
  
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
            <div className="text-2xl font-semibold text-foreground">{clientGroups.length}</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total de Associações</div>
            <div className="text-2xl font-semibold text-foreground">
              {clientGroups.reduce((sum, group) => sum + group.totalAssociations, 0)}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Associações Ativas</div>
            <div className="text-2xl font-semibold text-green-600">
              {clientGroups.reduce((sum, group) => sum + group.activeAssociations, 0)}
            </div>
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
                      <td colSpan={5} className="p-0 bg-muted/20">
                        <div className="p-4 space-y-3">
                          <h4 className="font-medium text-foreground mb-3">
                            Associações do Cliente ({group.associations.length})
                          </h4>
                          <div className="space-y-2">
                            {group.associations.map((association) => (
                              <div 
                                key={association.uuid}
                                className="bg-card rounded border p-3 space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      association.status ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                    <span className="font-medium text-sm">
                                      {association.status ? 'Ativa' : 'Inativa'}
                                    </span>
                                    {association.equipment?.solution?.solution && (
                                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                        {association.equipment.solution.solution}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {association.entry_date}
                                    {association.exit_date && ` → ${association.exit_date}`}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                                  {association.equipment && (
                                    <div>
                                      <span className="text-muted-foreground">Equipamento:</span>
                                      <div className="font-medium">
                                        {association.equipment.model || 'N/A'}
                                      </div>
                                      <div className="text-muted-foreground">
                                        {association.equipment.radio || association.equipment.serial_number}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {association.chip && (
                                    <div>
                                      <span className="text-muted-foreground">Chip:</span>
                                      <div className="font-medium">
                                        {association.chip.iccid || 'N/A'}
                                      </div>
                                      <div className="text-muted-foreground">
                                        {association.chip.line_number ? formatPhone(association.chip.line_number.toString()) : 'N/A'}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {association.plan_gb && (
                                    <div>
                                      <span className="text-muted-foreground">Plano:</span>
                                      <div className="font-medium">{association.plan_gb}GB</div>
                                    </div>
                                  )}
                                </div>
                                
                                {association.notes && (
                                  <div className="text-xs text-muted-foreground mt-2">
                                    <strong>Observações:</strong> {association.notes}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
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
        Mostrando {clientGroups.length} clientes com{' '}
        {clientGroups.reduce((sum, group) => sum + group.totalAssociations, 0)} associações no total
      </div>
    </div>
  );
};

export default AssociationsList;
