
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { StandardFiltersCard } from "@/components/ui/standard-filters-card";
import { Inbox, Search, Filter, MoreHorizontal, Clock, User, Tag } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const TicketsInbox = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Mock data para demonstração
  const tickets = [
    {
      id: 'T-2024-001',
      subject: 'Problema de conectividade WiFi no escritório principal',
      customer: 'TechCorp Ltda',
      priority: 'Alta',
      status: 'Aberto',
      assignee: 'João Silva',
      created: '2024-01-15 09:30',
      lastUpdate: '2 horas atrás',
      description: 'Cliente relatando problemas intermitentes de conectividade WiFi.',
      tags: ['wifi', 'conectividade', 'urgente']
    },
    {
      id: 'T-2024-002',
      subject: 'Solicitação de novo equipamento router',
      customer: 'Inovações S.A.',
      priority: 'Média',
      status: 'Em andamento',
      assignee: 'Maria Santos',
      created: '2024-01-15 08:15',
      lastUpdate: '1 hora atrás',
      description: 'Cliente precisa de upgrade do equipamento atual.',
      tags: ['equipamento', 'router', 'upgrade']
    },
    {
      id: 'T-2024-003',
      subject: 'Configuração de SSID personalizada',
      customer: 'StartupXYZ',
      priority: 'Baixa',
      status: 'Pendente',
      assignee: 'Pedro Costa',
      created: '2024-01-14 16:45',
      lastUpdate: '3 horas atrás',
      description: 'Configuração de rede personalizada para ambiente corporativo.',
      tags: ['configuração', 'ssid', 'personalização']
    },
    {
      id: 'T-2024-004',
      subject: 'Erro na autenticação de usuários',
      customer: 'GlobalTech Inc',
      priority: 'Alta',
      status: 'Aguardando cliente',
      assignee: 'Ana Lima',
      created: '2024-01-14 14:20',
      lastUpdate: '5 horas atrás',
      description: 'Usuários não conseguem autenticar no sistema.',
      tags: ['autenticação', 'usuários', 'erro']
    },
    {
      id: 'T-2024-005',
      subject: 'Atualização de firmware necessária',
      customer: 'DigitalSoft',
      priority: 'Média',
      status: 'Em andamento',
      assignee: 'Carlos Oliveira',
      created: '2024-01-14 11:10',
      lastUpdate: '1 dia atrás',
      description: 'Atualização de segurança requerida para equipamentos.',
      tags: ['firmware', 'atualização', 'segurança']
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'destructive';
      case 'Média': return 'warning';
      case 'Baixa': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto': return 'destructive';
      case 'Em andamento': return 'warning';
      case 'Pendente': return 'secondary';
      case 'Aguardando cliente': return 'outline';
      case 'Resolvido': return 'success';
      default: return 'default';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={Inbox}
        title="Caixa de Entrada"
        description="Visualize e gerencie todos os tickets recebidos"
      >
        <Button className="bg-legal-primary hover:bg-legal-primary-light dark:bg-legal-primary dark:hover:bg-legal-primary-light text-white shadow-legal">
          <Filter className="h-4 w-4 mr-2" />
          Filtros Avançados
        </Button>
      </StandardPageHeader>

      <StandardFiltersCard>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="Aberto">Aberto</SelectItem>
              <SelectItem value="Em andamento">Em andamento</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
              <SelectItem value="Aguardando cliente">Aguardando cliente</SelectItem>
              <SelectItem value="Resolvido">Resolvido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Prioridades</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Baixa">Baixa</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="border-legal-primary text-legal-primary hover:bg-legal-primary/10 dark:border-legal-secondary dark:text-legal-secondary dark:hover:bg-legal-secondary/10">
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </StandardFiltersCard>

      <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-legal-primary dark:text-legal-secondary font-semibold">
                Tickets na Caixa de Entrada ({filteredTickets.length})
              </CardTitle>
              <CardDescription>
                {filteredTickets.length === tickets.length 
                  ? `Mostrando todos os ${tickets.length} tickets`
                  : `Mostrando ${filteredTickets.length} de ${tickets.length} tickets`
                }
              </CardDescription>
            </div>
            <Button variant="outline" className="border-legal-primary text-legal-primary hover:bg-legal-primary/10 dark:border-legal-secondary dark:text-legal-secondary dark:hover:bg-legal-secondary/10">
              Marcar Todos como Lidos
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="border-l-4 border-l-legal-primary dark:border-l-legal-secondary hover:bg-legal-primary/5 dark:hover:bg-legal-secondary/5 transition-colors cursor-pointer shadow-legal-sm dark:shadow-legal-dark">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-legal-primary dark:text-legal-secondary font-medium">{ticket.id}</span>
                        <Badge variant={getPriorityColor(ticket.priority) as any}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant={getStatusColor(ticket.status) as any}>
                          {ticket.status}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-legal-dark dark:text-text-primary-dark mb-1">{ticket.subject}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{ticket.customer}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Atualizado {ticket.lastUpdate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>Responsável: {ticket.assignee}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        {ticket.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-legal-primary/30 text-legal-primary dark:border-legal-secondary/30 dark:text-legal-secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background border border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal-lg">
                        <DropdownMenuItem className="hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10">Visualizar Detalhes</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10">Assumir Ticket</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10">Transferir</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-legal-primary/10 dark:hover:bg-legal-secondary/10">Marcar como Resolvido</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">Fechar Ticket</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredTickets.length === 0 && (
            <div className="text-center py-8">
              <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Nenhum ticket encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Tente ajustar os filtros para encontrar mais tickets.'
                  : 'Sua caixa de entrada está vazia no momento.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsInbox;
