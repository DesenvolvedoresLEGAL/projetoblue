
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Ticket, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TicketsOverview: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - replace with actual API calls
  const metrics = {
    totalTickets: 1247,
    openTickets: 156,
    solvedToday: 42,
    pendingTickets: 23,
    satisfactionScore: 4.7,
    avgResolutionTime: "2h 15m",
    slaCompliance: 94.2,
    activeAgents: 12
  };

  const recentTickets = [
    {
      id: "TK-2024-001",
      subject: "Problema de conectividade com roteador",
      priority: "high",
      status: "open",
      requester: "João Silva",
      assignee: "Maria Santos",
      createdAt: "2024-01-15T10:30:00Z",
      channel: "email"
    },
    {
      id: "TK-2024-002", 
      subject: "Solicitação de novo chip",
      priority: "normal",
      status: "pending",
      requester: "Ana Costa",
      assignee: "Pedro Lima",
      createdAt: "2024-01-15T09:15:00Z",
      channel: "chat"
    },
    {
      id: "TK-2024-003",
      subject: "Configuração de rede WiFi",
      priority: "low",
      status: "solved",
      requester: "Carlos Mendes",
      assignee: "Lucia Fernandes",
      createdAt: "2024-01-14T16:45:00Z",
      channel: "whatsapp"
    }
  ];

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    normal: "bg-blue-100 text-blue-800", 
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800"
  };

  const statusColors = {
    new: "bg-purple-100 text-purple-800",
    open: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    solved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800"
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-legal-dark">Tickets - Visão Geral</h1>
          <p className="text-muted-foreground">
            Painel de controle para suporte e atendimento ao cliente
          </p>
        </div>
        <Button onClick={() => navigate('/tickets/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Ticket
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTickets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando resolução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos Hoje</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.solvedToday}</div>
            <p className="text-xs text-muted-foreground">
              Meta: 40 tickets/dia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.satisfactionScore}/5</div>
            <p className="text-xs text-muted-foreground">
              Baseado em 128 avaliações
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              SLA & Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Conformidade SLA</span>
              <Badge variant="secondary">{metrics.slaCompliance}%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Tempo Médio de Resolução</span>
              <Badge variant="outline">{metrics.avgResolutionTime}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Tickets Pendentes</span>
              <Badge variant="destructive">{metrics.pendingTickets}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Equipe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Agentes Ativos</span>
              <Badge variant="secondary">{metrics.activeAgents}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Carga de Trabalho</span>
              <Badge variant="outline">Balanceada</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Gerenciar Equipe
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => navigate('/tickets/inbox')}
            >
              Ver Caixa de Entrada
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => navigate('/tickets/my-tickets')}
            >
              Meus Tickets
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => navigate('/tickets/analytics')}
            >
              Relatórios
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tickets Recentes</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/tickets/inbox')}
          >
            Ver Todos
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div 
                key={ticket.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/tickets/inbox?id=${ticket.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium">{ticket.id}</div>
                    <div className="text-sm text-muted-foreground">{ticket.subject}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {ticket.requester} • {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={priorityColors[ticket.priority as keyof typeof priorityColors]}
                  >
                    {ticket.priority}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={statusColors[ticket.status as keyof typeof statusColors]}
                  >
                    {ticket.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsOverview;
