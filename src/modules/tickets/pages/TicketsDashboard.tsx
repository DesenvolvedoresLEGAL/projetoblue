
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { LayoutDashboard, Ticket, AlertCircle, Clock, CheckCircle, Users, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TicketsDashboard = () => {
  // Mock data para demonstração
  const stats = {
    total: 156,
    open: 42,
    inProgress: 28,
    resolved: 86,
    pending: 14,
    overdue: 8
  };

  const priorityData = [
    { name: 'Alta', value: 18, color: '#ef4444' },
    { name: 'Média', value: 67, color: '#f59e0b' },
    { name: 'Baixa', value: 71, color: '#10b981' }
  ];

  const weeklyData = [
    { day: 'Seg', created: 12, resolved: 8 },
    { day: 'Ter', created: 19, resolved: 15 },
    { day: 'Qua', created: 8, resolved: 12 },
    { day: 'Qui', created: 15, resolved: 10 },
    { day: 'Sex', created: 22, resolved: 18 },
    { day: 'Sáb', created: 5, resolved: 8 },
    { day: 'Dom', created: 3, resolved: 4 }
  ];

  const recentTickets = [
    { id: 'T-2024-001', subject: 'Problema de conectividade WiFi', priority: 'Alta', status: 'Aberto', assignee: 'João Silva', created: '2 horas' },
    { id: 'T-2024-002', subject: 'Solicitação de novo equipamento', priority: 'Média', status: 'Em andamento', assignee: 'Maria Santos', created: '4 horas' },
    { id: 'T-2024-003', subject: 'Configuração de SSID', priority: 'Baixa', status: 'Pendente', assignee: 'Pedro Costa', created: '6 horas' },
    { id: 'T-2024-004', subject: 'Erro na autenticação', priority: 'Alta', status: 'Resolvido', assignee: 'Ana Lima', created: '1 dia' },
    { id: 'T-2024-005', subject: 'Atualização de firmware', priority: 'Média', status: 'Em andamento', assignee: 'Carlos Oliveira', created: '1 dia' }
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
      case 'Resolvido': return 'success';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={LayoutDashboard}
        title="Dashboard de Tickets"
        description="Visão geral do sistema de tickets e suporte"
      >
        <Button className="bg-[#4D2BFB] hover:bg-[#020CBC]">
          <Ticket className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </StandardPageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-[#4D2BFB]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#020CBC]">{stats.total}</div>
            <p className="text-xs text-muted-foreground">+12% desde o mês passado</p>
          </CardContent>
        </Card>

        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Abertos</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
            <p className="text-xs text-muted-foreground">-8% desde ontem</p>
          </CardContent>
        </Card>

        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Em Andamento</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">+5% desde ontem</p>
          </CardContent>
        </Card>

        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolvidos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">+15% desde ontem</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#4D2BFB]/20">
          <CardHeader>
            <CardTitle className="text-[#020CBC] font-neue-haas">Tickets por Prioridade</CardTitle>
            <CardDescription>Distribuição de tickets por nível de prioridade</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#4D2BFB]/20">
          <CardHeader>
            <CardTitle className="text-[#020CBC] font-neue-haas">Tickets da Semana</CardTitle>
            <CardDescription>Tickets criados vs resolvidos nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="created" fill="#4D2BFB" name="Criados" />
                <Bar dataKey="resolved" fill="#03F9FF" name="Resolvidos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets Table */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader>
          <CardTitle className="text-[#020CBC] font-neue-haas">Tickets Recentes</CardTitle>
          <CardDescription>Últimos tickets criados ou atualizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-[#020CBC]">ID</th>
                  <th className="text-left p-2 font-medium text-[#020CBC]">Assunto</th>
                  <th className="text-left p-2 font-medium text-[#020CBC]">Prioridade</th>
                  <th className="text-left p-2 font-medium text-[#020CBC]">Status</th>
                  <th className="text-left p-2 font-medium text-[#020CBC]">Responsável</th>
                  <th className="text-left p-2 font-medium text-[#020CBC]">Criado</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-[#4D2BFB]/5">
                    <td className="p-2 font-mono text-sm">{ticket.id}</td>
                    <td className="p-2">{ticket.subject}</td>
                    <td className="p-2">
                      <Badge variant={getPriorityColor(ticket.priority) as any}>
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant={getStatusColor(ticket.status) as any}>
                        {ticket.status}
                      </Badge>
                    </td>
                    <td className="p-2">{ticket.assignee}</td>
                    <td className="p-2 text-muted-foreground">{ticket.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsDashboard;
