
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { StandardFiltersCard } from "@/components/ui/standard-filters-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Search, Filter, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";

const MyTickets = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Mock data para demonstração
  const myTickets = [
    {
      id: 'T-2024-001',
      subject: 'Problema de conectividade WiFi no escritório principal',
      customer: 'TechCorp Ltda',
      priority: 'Alta',
      status: 'Em andamento',
      created: '2024-01-15 09:30',
      lastUpdate: '1 hora atrás',
      timeSpent: '3h 45m',
      deadline: '2024-01-16 18:00',
      category: 'assigned'
    },
    {
      id: 'T-2024-007',
      subject: 'Configuração de VPN corporativa',
      customer: 'SecureNet',
      priority: 'Média',
      status: 'Pendente',
      created: '2024-01-14 15:20',
      lastUpdate: '2 horas atrás',
      timeSpent: '1h 20m',
      deadline: '2024-01-17 12:00',
      category: 'assigned'
    },
    {
      id: 'T-2024-012',
      subject: 'Solicitação de equipamento adicional',
      customer: 'FastGrowth Inc',
      priority: 'Baixa',
      status: 'Aguardando cliente',
      created: '2024-01-13 11:30',
      lastUpdate: '1 dia atrás',
      timeSpent: '45m',
      deadline: '2024-01-18 17:00',
      category: 'assigned'
    },
    {
      id: 'T-2024-003',
      subject: 'Configuração de SSID personalizada',
      customer: 'StartupXYZ',
      priority: 'Baixa',
      status: 'Resolvido',
      created: '2024-01-10 16:45',
      lastUpdate: '3 dias atrás',
      timeSpent: '2h 15m',
      deadline: '2024-01-15 14:00',
      category: 'created'
    },
    {
      id: 'T-2024-008',
      subject: 'Problema de velocidade de internet',
      customer: 'QuickBiz',
      priority: 'Média',
      status: 'Resolvido',
      created: '2024-01-09 14:20',
      lastUpdate: '4 dias atrás',
      timeSpent: '1h 30m',
      deadline: '2024-01-12 16:00',
      category: 'created'
    }
  ];

  const assignedTickets = myTickets.filter(ticket => ticket.category === 'assigned');
  const createdTickets = myTickets.filter(ticket => ticket.category === 'created');

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Em andamento': return <Clock className="h-4 w-4" />;
      case 'Resolvido': return <CheckCircle className="h-4 w-4" />;
      case 'Aberto': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filterTickets = (tickets: typeof myTickets) => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  };

  const TicketCard = ({ ticket }: { ticket: typeof myTickets[0] }) => (
    <Card key={ticket.id} className="border-l-4 border-l-[#4D2BFB] hover:bg-[#4D2BFB]/5 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-[#4D2BFB] font-medium">{ticket.id}</span>
            <Badge variant={getPriorityColor(ticket.priority) as any}>
              {ticket.priority}
            </Badge>
            <div className="flex items-center gap-1">
              {getStatusIcon(ticket.status)}
              <Badge variant={getStatusColor(ticket.status) as any}>
                {ticket.status}
              </Badge>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Abrir
          </Button>
        </div>
        
        <h3 className="font-semibold text-[#020CBC] mb-2">{ticket.subject}</h3>
        <p className="text-sm text-muted-foreground mb-3">Cliente: {ticket.customer}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Tempo gasto:</span>
            <span className="ml-2 font-medium">{ticket.timeSpent}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Prazo:</span>
            <span className="ml-2 font-medium">{new Date(ticket.deadline).toLocaleDateString('pt-BR')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Criado:</span>
            <span className="ml-2">{new Date(ticket.created).toLocaleDateString('pt-BR')}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Última atualização:</span>
            <span className="ml-2">{ticket.lastUpdate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={User}
        title="Meus Tickets"
        description="Gerencie os tickets atribuídos a você e os que você criou"
      >
        <Button className="bg-[#4D2BFB] hover:bg-[#020CBC]">
          <Plus className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </StandardPageHeader>

      <StandardFiltersCard>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar meus tickets..."
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

          <Button variant="outline" className="border-[#4D2BFB] text-[#4D2BFB]">
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </Button>
        </div>
      </StandardFiltersCard>

      <Tabs defaultValue="assigned" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assigned">
            Atribuídos a Mim ({filterTickets(assignedTickets).length})
          </TabsTrigger>
          <TabsTrigger value="created">
            Criados por Mim ({filterTickets(createdTickets).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-4">
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <CardTitle className="text-[#020CBC] font-neue-haas">
                Tickets Atribuídos a Mim
              </CardTitle>
              <CardDescription>
                Tickets que foram designados para você resolver
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterTickets(assignedTickets).map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
                
                {filterTickets(assignedTickets).length === 0 && (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      Nenhum ticket atribuído
                    </h3>
                    <p className="text-muted-foreground">
                      Você não possui tickets atribuídos no momento.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="created" className="space-y-4">
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <CardTitle className="text-[#020CBC] font-neue-haas">
                Tickets Criados por Mim
              </CardTitle>
              <CardDescription>
                Tickets que você criou e está acompanhando
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterTickets(createdTickets).map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
                
                {filterTickets(createdTickets).length === 0 && (
                  <div className="text-center py-8">
                    <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      Nenhum ticket criado
                    </h3>
                    <p className="text-muted-foreground">
                      Você ainda não criou nenhum ticket.
                    </p>
                    <Button className="mt-4 bg-[#4D2BFB] hover:bg-[#020CBC]">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Ticket
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTickets;
