import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Date picker will be implemented later
import { BarChart3, Clock, TrendingUp, Users, Download, Calendar, Target, Star, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface KPIData {
  period: string;
  avg_installation_time: number;
  rework_rate: number;
  nps_score: number;
  completed_setups: number;
  technicians_active: number;
}

const mockKPIData: KPIData[] = [
  {
    period: 'Jan 2024',
    avg_installation_time: 2.8,
    rework_rate: 4.2,
    nps_score: 8.3,
    completed_setups: 127,
    technicians_active: 8
  },
  {
    period: 'Fev 2024',
    avg_installation_time: 2.6,
    rework_rate: 3.8,
    nps_score: 8.5,
    completed_setups: 145,
    technicians_active: 9
  },
  {
    period: 'Mar 2024',
    avg_installation_time: 2.4,
    rework_rate: 3.2,
    nps_score: 8.7,
    completed_setups: 163,
    technicians_active: 10
  }
];

const technicianPerformance = [
  { name: 'Carlos Oliveira', setups: 45, avg_time: 2.2, rating: 4.8, efficiency: 92 },
  { name: 'Maria Santos', setups: 38, avg_time: 2.6, rating: 4.6, efficiency: 87 },
  { name: 'Roberto Lima', setups: 42, avg_time: 2.4, rating: 4.7, efficiency: 89 },
  { name: 'Ana Paula', setups: 35, avg_time: 2.8, rating: 4.5, efficiency: 82 },
  { name: 'Pedro Costa', setups: 40, avg_time: 2.3, rating: 4.9, efficiency: 95 }
];

const regionPerformance = [
  { name: 'São Paulo - Norte', value: 35, setups: 245 },
  { name: 'São Paulo - Sul', value: 28, setups: 198 },
  { name: 'São Paulo - Leste', value: 22, setups: 156 },
  { name: 'São Paulo - Oeste', value: 15, setups: 108 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const SetupReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('installation_time');

  const handleExportReport = () => {
    console.log('Exportando relatório para BI');
    // TODO: Implementar export para BLUE BI API
  };

  const currentMonthData = mockKPIData[mockKPIData.length - 1];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Métricas & Relatórios</h1>
          <p className="text-muted-foreground">
            KPIs de instalação, tempo médio, retrabalho e NPS
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar BI
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthData.avg_installation_time}h</div>
            <p className="text-xs text-muted-foreground">
              -0.2h vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Retrabalho</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthData.rework_rate}%</div>
            <p className="text-xs text-muted-foreground">
              -0.6% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthData.nps_score}/10</div>
            <p className="text-xs text-muted-foreground">
              +0.2 vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Setups Concluídos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthData.completed_setups}</div>
            <p className="text-xs text-muted-foreground">
              +18 vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Técnicos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMonthData.technicians_active}</div>
            <p className="text-xs text-muted-foreground">
              +1 vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Installation Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução do Tempo de Instalação
            </CardTitle>
            <CardDescription>Tempo médio em horas por período</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockKPIData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="avg_installation_time" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Tempo Médio (h)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rework Rate and NPS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Qualidade e Satisfação
            </CardTitle>
            <CardDescription>Taxa de retrabalho e NPS score</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockKPIData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="rework_rate" fill="#ff7c7c" name="Taxa Retrabalho (%)" />
                <Bar yAxisId="right" dataKey="nps_score" fill="#82ca9d" name="NPS Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technician Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Técnico</CardTitle>
            <CardDescription>Ranking de eficiência dos técnicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {technicianPerformance.map((tech, index) => (
                <div key={tech.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{tech.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {tech.setups} setups • {tech.avg_time}h médio
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{tech.efficiency}%</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {tech.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Região</CardTitle>
            <CardDescription>Setups realizados por região</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionPerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {regionPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Integration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Integração BLUE BI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Dados exportados automaticamente via n8n job diário</p>
            <p>• Dashboard completo disponível no BLUE BI com filtros avançados</p>
            <p>• Alertas automáticos para KPIs fora do padrão</p>
            <p>• Relatórios customizáveis por região, técnico e período</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};