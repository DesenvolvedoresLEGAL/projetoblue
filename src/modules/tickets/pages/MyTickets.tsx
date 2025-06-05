
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Star
} from "lucide-react";

const MyTickets: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("assigned");

  // Mock data - replace with actual API calls
  const myTickets = {
    assigned: [
      {
        id: "TK-2024-001",
        subject: "Problema de conectividade com roteador",
        priority: "high",
        status: "open",
        requester: "João Silva",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T14:22:00Z",
        dueDate: "2024-01-16T18:00:00Z",
        commentsCount: 3,
        lastComment: "Cliente confirmou que o problema persiste após reinicialização"
      },
      {
        id: "TK-2024-005",
        subject: "Relatório de consumo de dados",
        priority: "urgent",
        status: "open",
        requester: "Roberto Santos",
        createdAt: "2024-01-15T13:10:00Z",
        updatedAt: "2024-01-15T14:55:00Z",
        dueDate: "2024-01-15T17:00:00Z",
        commentsCount: 2,
        lastComment: "Aguardando relatório do sistema de monitoramento"
      }
    ],
    solved: [
      {
        id: "TK-2024-003",
        subject: "Configuração de rede WiFi empresarial",
        priority: "low",
        status: "solved",
        requester: "Carlos Mendes",
        createdAt: "2024-01-14T16:45:00Z",
        solvedAt: "2024-01-15T08:30:00Z",
        commentsCount: 5,
        satisfactionRating: 5
      }
    ],
    followed: [
      {
        id: "TK-2024-002",
        subject: "Solicitação de novo chip para filial",
        priority: "normal",
        status: "pending",
        requester: "Ana Costa",
        assignee: "Pedro Lima",
        createdAt: "2024-01-15T09:15:00Z",
        updatedAt: "2024-01-15T11:45:00Z",
        commentsCount: 1
      }
    ]
  };

  const stats = {
    assigned: myTickets.assigned.length,
    solved: myTickets.solved.length,
    followed: myTickets.followed.length,
    overdue: 1,
    avgResolutionTime: "1h 45m"
  };

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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Agora há pouco";
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return `${Math.floor(diffInHours / 24)}d atrás`;
  };

  const isOverdue = (dueDateString?: string) => {
    if (!dueDateString) return false;
    return new Date(dueDateString) < new Date();
  };

  const renderTicketCard = (ticket: any, showAssignee = false) => (
    <div 
      key={ticket.id}
      className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
        isOverdue(ticket.dueDate) ? 'border-red-200 bg-red-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-legal-dark">{ticket.id}</span>
          {isOverdue(ticket.dueDate) && (
            <Badge variant="destructive" className="text-xs">
              Atrasado
            </Badge>
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
        </div>
      </div>

      <h3 className="font-medium text-lg mb-2">{ticket.subject}</h3>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {ticket.requester}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTimeAgo(ticket.updatedAt || ticket.createdAt)}
        </div>
        {ticket.commentsCount > 0 && (
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {ticket.commentsCount}
          </div>
        )}
        {ticket.satisfactionRating && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {ticket.satisfactionRating}/5
          </div>
        )}
      </div>

      {showAssignee && ticket.assignee && (
        <div className="text-sm text-muted-foreground mb-2">
          Responsável: {ticket.assignee}
        </div>
      )}

      {ticket.lastComment && (
        <div className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
          <span className="font-medium">Último comentário:</span> {ticket.lastComment}
        </div>
      )}

      {ticket.dueDate && !isOverdue(ticket.dueDate) && (
        <div className="text-sm text-muted-foreground mt-2">
          Vence em: {formatTimeAgo(ticket.dueDate)}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-legal-dark">Meus Tickets</h1>
          <p className="text-muted-foreground">
            Tickets atribuídos a você e que você está acompanhando
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atribuídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.solved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Seguindo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.followed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResolutionTime}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assigned" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Atribuídos ({stats.assigned})
          </TabsTrigger>
          <TabsTrigger value="solved" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Resolvidos ({stats.solved})
          </TabsTrigger>
          <TabsTrigger value="followed" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Seguindo ({stats.followed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tickets Atribuídos a Você</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myTickets.assigned.length > 0 ? (
                myTickets.assigned.map(ticket => renderTicketCard(ticket))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum ticket atribuído no momento
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tickets Resolvidos por Você</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myTickets.solved.length > 0 ? (
                myTickets.solved.map(ticket => renderTicketCard(ticket))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Nenhum ticket resolvido ainda
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tickets que Você Está Seguindo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myTickets.followed.length > 0 ? (
                myTickets.followed.map(ticket => renderTicketCard(ticket, true))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Você não está seguindo nenhum ticket
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTickets;
