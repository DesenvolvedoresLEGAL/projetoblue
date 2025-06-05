
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Download, Clock, CheckCircle, AlertCircle, Filter, RefreshCcw, Users } from "lucide-react";

const TicketAnalytics = () => {
  const [timeRange, setTimeRange] = useState('month');
  
  // Mock data para demonstração
  const ticketsVolume = [
    { name: 'Jan', total: 45, resolved: 38 },
    { name: 'Fev', total: 53, resolved: 49 },
    { name: 'Mar', total: 62, resolved: 54 },
    { name: 'Abr', total: 48, resolved: 40 },
    { name: 'Mai', total: 70, resolved: 65 },
    { name: 'Jun', total: 55, resolved: 50 },
    { name: 'Jul', total: 60, resolved: 48 },
    { name: 'Ago', total: 45, resolved: 42 },
    { name: 'Set', total: 65, resolved: 60 },
    { name: 'Out', total: 62, resolved: 58 },
    { name: 'Nov', total: 58, resolved: 55 },
    { name: 'Dez', total: 48, resolved: 45 }
  ];

  const responseTimeData = [
    { name: 'Jan', tempo: 3.5 },
    { name: 'Fev', tempo: 4.2 },
    { name: 'Mar', tempo: 3.8 },
    { name: 'Abr', tempo: 2.9 },
    { name: 'Mai', tempo: 2.2 },
    { name: 'Jun', tempo: 2.5 },
    { name: 'Jul', tempo: 2.3 },
    { name: 'Ago', tempo: 2.1 },
    { name: 'Set', tempo: 2.0 },
    { name: 'Out', tempo: 1.8 },
    { name: 'Nov', tempo: 1.7 },
    { name: 'Dez', tempo: 1.5 }
  ];

  const categoryData = [
    { name: 'Conectividade', value: 32 },
    { name: 'Configuração', value: 26 },
    { name: 'Equipamento', value: 18 },
    { name: 'Software', value: 15 },
    { name: 'Outros', value: 9 }
  ];

  const priorityData = [
    { name: 'Alta', value: 18, color: '#ef4444' },
    { name: 'Média', value: 42, color: '#f59e0b' },
    { name: 'Baixa', value: 40, color: '#10b981' }
  ];

  const agentPerformance = [
    { name: 'João Silva', tickets: 45, resolucao: 92, tempo: 2.1 },
    { name: 'Maria Santos', tickets: 38, resolucao: 95, tempo: 1.8 },
    { name: 'Pedro Costa', tickets: 42, resolucao: 88, tempo: 2.5 },
    { name: 'Ana Lima', tickets: 30, resolucao: 97, tempo: 1.7 },
    { name: 'Carlos Oliveira', tickets: 28, resolucao: 86, tempo: 2.7 }
  ];

  const satisfactionScores = [
    { name: 'Jan', score: 4.2 },
    { name: 'Fev', score: 4.3 },
    { name: 'Mar', score: 4.1 },
    { name: 'Abr', score: 4.4 },
    { name: 'Mai', score: 4.6 },
    { name: 'Jun', score: 4.5 },
    { name: 'Jul', score: 4.7 },
    { name: 'Ago', score: 4.6 },
    { name: 'Set', score: 4.8 },
    { name: 'Out', score: 4.7 },
    { name: 'Nov', score: 4.9 },
    { name: 'Dez', score: 4.8 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={TrendingUp}
        title="Análises & Relatórios"
        description="Visualize métricas e indicadores de desempenho do sistema de tickets"
      >
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mês</SelectItem>
              <SelectItem value="quarter">Último Trimestre</SelectItem>
              <SelectItem value="year">Último Ano</SelectItem>
              <SelectItem value="all">Todo o Período</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#4D2BFB] hover:bg-[#020CBC]">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </StandardPageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Tickets</CardTitle>
              <AlertCircle className="h-4 w-4 text-[#4D2BFB]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#020CBC]">621</div>
            <p className="text-xs text-muted-foreground">+8.2% em relação ao período anterior</p>
          </CardContent>
        </Card>

        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Resolução</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">92%</div>
            <p className="text-xs text-muted-foreground">+2.5% em relação ao período anterior</p>
          </CardContent>
        </Card>

        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tempo Médio de Resposta</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">1.8h</div>
            <p className="text-xs text-muted-foreground">-12% em relação ao período anterior</p>
          </CardContent>
        </Card>

        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Satisfação do Cliente</CardTitle>
              <Users className="h-4 w-4 text-[#4D2BFB]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#020CBC]">4.7/5</div>
            <p className="text-xs text-muted-foreground">+0.2 em relação ao período anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#4D2BFB]/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-[#020CBC] font-neue-haas">Volume de Tickets</CardTitle>
                <CardDescription>Total vs. Resolvidos por mês</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketsVolume}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="total" name="Total de Tickets" fill="#4D2BFB" />
                <Bar dataKey="resolved" name="Tickets Resolvidos" fill="#03F9FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#4D2BFB]/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-[#020CBC] font-neue-haas">Tempo de Resposta</CardTitle>
                <CardDescription>Tempo médio de primeira resposta (horas)</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip formatter={(value) => [`${value} horas`, 'Tempo Médio']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="tempo"
                  name="Tempo de Resposta"
                  stroke="#4D2BFB"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#4D2BFB]/20">
          <CardHeader>
            <CardTitle className="text-[#020CBC] font-neue-haas">Tickets por Categoria</CardTitle>
            <CardDescription>Distribuição de tickets por categoria</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`${value} tickets`, 'Quantidade']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-[#4D2BFB]/20">
          <CardHeader>
            <CardTitle className="text-[#020CBC] font-neue-haas">Distribuição por Prioridade</CardTitle>
            <CardDescription>Tickets classificados por nível de prioridade</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`${value} tickets`, 'Quantidade']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance Table */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader>
          <CardTitle className="text-[#020CBC] font-neue-haas">Desempenho dos Agentes</CardTitle>
          <CardDescription>Métricas de desempenho da equipe de suporte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-[#020CBC]">Agente</th>
                  <th className="text-center p-2 font-medium text-[#020CBC]">Tickets Atendidos</th>
                  <th className="text-center p-2 font-medium text-[#020CBC]">Taxa de Resolução</th>
                  <th className="text-center p-2 font-medium text-[#020CBC]">Tempo Médio (h)</th>
                  <th className="text-center p-2 font-medium text-[#020CBC]">Desempenho</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.map((agent) => (
                  <tr key={agent.name} className="border-b hover:bg-[#4D2BFB]/5">
                    <td className="p-2 font-medium">{agent.name}</td>
                    <td className="p-2 text-center">{agent.tickets}</td>
                    <td className="p-2 text-center">{agent.resolucao}%</td>
                    <td className="p-2 text-center">{agent.tempo}</td>
                    <td className="p-2 text-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-[#4D2BFB] h-2.5 rounded-full"
                          style={{ width: `${agent.resolucao}%` }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Customer Satisfaction */}
      <Card className="border-[#4D2BFB]/20">
        <CardHeader>
          <CardTitle className="text-[#020CBC] font-neue-haas">Satisfação do Cliente</CardTitle>
          <CardDescription>Evolução da avaliação média dos tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={satisfactionScores}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <RechartsTooltip formatter={(value) => [`${value}/5`, 'Avaliação']} />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                name="Satisfação"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketAnalytics;
