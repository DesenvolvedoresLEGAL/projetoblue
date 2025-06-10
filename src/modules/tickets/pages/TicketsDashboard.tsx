
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
        <Button className="bg-legal-primary hover:bg-legal-primary-light dark:bg-legal-primary dark:hover:bg-legal-primary-light text-white shadow-legal">
          <Ticket className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </StandardPageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-legal-primary dark:text-legal-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-legal-primary dark:text-legal-secondary">{stats.total}</div>
            <p className="text-xs text-muted-foreground">+12% desde o mês passado</p>
          </CardContent>
        </Card>

        <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark">
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

        <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark">
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

        <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark">
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
        <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark">
          <CardHeader>
            <CardTitle className="text-legal-primary dark:text-legal-secondary font-semibold">Tickets por Prioridade</CardTitle>
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

        <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark">
          <CardHeader>
            <CardTitle className="text-legal-primary dark:text-legal-secondary font-semibold">Tickets da Semana</CardTitle>
            <CardDescription>Tickets criados vs resolvidos nos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="created" fill="rgb(77, 43, 251)" name="Criados" />
                <Bar dataKey="resolved" fill="rgb(3, 249, 255)" name="Resolvidos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets Table */}
      <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark">
        <CardHeader>
          <CardTitle className="text-legal-primary dark:text-legal-secondary font-semibold">Tickets Recentes</CardTitle>
          <CardDescription>Últimos tickets criados ou atualizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 font-medium text-legal-primary dark:text-legal-secondary">ID</th>
                  <th className="text-left p-2 font-medium text-legal-primary dark:text-legal-secondary">Assunto</th>
                  <th className="text-left p-2 font-medium text-legal-primary dark:text-legal-secondary">Prioridade</th>
                  <th className="text-left p-2 font-medium text-legal-primary dark:text-legal-secondary">Status</th>
                  <th className="text-left p-2 font-medium text-legal-primary dark:text-legal-secondary">Responsável</th>
                  <th className="text-left p-2 font-medium text-legal-primary dark:text-legal-secondary">Criado</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-border hover:bg-legal-primary/5 dark:hover:bg-legal-secondary/5 transition-colors duration-200">
                    <td className="p-2 font-mono text-sm text-legal-primary dark:text-legal-secondary">{ticket.id}</td>
                    <td className="p-2 text-legal-dark dark:text-text-primary-dark">{ticket.subject}</td>
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
                    <td className="p-2 text-legal-dark dark:text-text-primary-dark">{ticket.assignee}</td>
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
