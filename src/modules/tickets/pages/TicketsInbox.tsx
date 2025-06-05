
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  SortAsc, 
  RefreshCw,
  MoreHorizontal,
  User,
  Clock,
  MessageSquare
} from "lucide-react";

const TicketsInbox: React.FC = () => {
  // Mock data - replace with actual API calls
  const tickets = [
    {
      id: "TK-2024-001",
      subject: "Problema de conectividade com roteador",
      priority: "high",
      status: "open",
      requester: "João Silva",
      assignee: "Maria Santos",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T14:22:00Z",
      channel: "email",
      unread: true,
      commentsCount: 3
    },
    {
      id: "TK-2024-002", 
      subject: "Solicitação de novo chip para filial",
      priority: "normal",
      status: "pending",
      requester: "Ana Costa",
      assignee: "Pedro Lima",
      createdAt: "2024-01-15T09:15:00Z",
      updatedAt: "2024-01-15T11:45:00Z",
      channel: "chat",
      unread: false,
      commentsCount: 1
    },
    {
      id: "TK-2024-003",
      subject: "Configuração de rede WiFi empresarial",
      priority: "low",
      status: "solved",
      requester: "Carlos Mendes",
      assignee: "Lucia Fernandes",
      createdAt: "2024-01-14T16:45:00Z",
      updatedAt: "2024-01-15T08:30:00Z",
      channel: "whatsapp",
      unread: false,
      commentsCount: 5
    },
    {
      id: "TK-2024-004",
      subject: "Upgrade de plano de dados móveis",
      priority: "normal",
      status: "new",
      requester: "Fernanda Oliveira",
      assignee: null,
      createdAt: "2024-01-15T15:20:00Z",
      updatedAt: "2024-01-15T15:20:00Z",
      channel: "web",
      unread: true,
      commentsCount: 0
    },
    {
      id: "TK-2024-005",
      subject: "Relatório de consumo de dados",
      priority: "urgent",
      status: "open",
      requester: "Roberto Santos",
      assignee: "Maria Santos",
      createdAt: "2024-01-15T13:10:00Z",
      updatedAt: "2024-01-15T14:55:00Z",
      channel: "phone",
      unread: true,
      commentsCount: 2
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

  const channelEmojis = {
    email: "📧",
    chat: "💬",
    whatsapp: "📱",
    web: "🌐",
    phone: "📞"
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Agora há pouco";
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return `${Math.floor(diffInHours / 24)}d atrás`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-legal-dark">Caixa de Entrada</h1>
          <p className="text-muted-foreground">
            Todos os tickets do sistema em um só lugar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por número, assunto, cliente..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Ordenar
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tickets ({tickets.length})</span>
            <Badge variant="secondary">
              {tickets.filter(t => t.unread).length} não lidos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  ticket.unread ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-legal-dark">{ticket.id}</span>
                      <span className="text-sm">
                        {channelEmojis[ticket.channel as keyof typeof channelEmojis]}
                      </span>
                      {ticket.unread && (
                        <Badge variant="secondary" className="text-xs">
                          Novo
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-medium text-lg mb-1 truncate">
                      {ticket.subject}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ticket.requester}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(ticket.updatedAt)}
                      </div>
                      {ticket.commentsCount > 0 && (
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {ticket.commentsCount}
                        </div>
                      )}
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
                      {ticket.assignee && (
                        <Badge variant="outline" className="text-xs">
                          {ticket.assignee}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {tickets.length} de 156 tickets
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TicketsInbox;
