import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HardHat, Clock, CheckCircle, TrendingUp, Calendar, Star, Award, Target } from 'lucide-react';

interface TechnicianStats {
  technician_id: string;
  name: string;
  email: string;
  region: string;
  setups_completed: number;
  setups_pending: number;
  avg_completion_time: number; // em horas
  rework_rate: number; // percentage
  customer_rating: number;
  efficiency_score: number;
  this_month: {
    completed: number;
    avg_time: number;
    rating: number;
  };
}

interface SetupHistory {
  id: string;
  order_id: string;
  customer_name: string;
  type: 'install' | 'uninstall';
  status: 'completed' | 'approved' | 'rejected';
  started_at: string;
  completed_at: string;
  duration_hours: number;
  customer_rating?: number;
  rejection_reason?: string;
}

const mockTechnicianStats: TechnicianStats = {
  technician_id: 'TECH-001',
  name: 'Carlos Oliveira',
  email: 'carlos@blue.com',
  region: 'São Paulo - Zona Norte',
  setups_completed: 127,
  setups_pending: 3,
  avg_completion_time: 2.4,
  rework_rate: 3.2,
  customer_rating: 4.7,
  efficiency_score: 87,
  this_month: {
    completed: 15,
    avg_time: 2.1,
    rating: 4.8
  }
};

const mockSetupHistory: SetupHistory[] = [
  {
    id: 'BLU-S-001',
    order_id: 'BLU-O-001',
    customer_name: 'João Silva',
    type: 'install',
    status: 'approved',
    started_at: '2024-01-15T14:00:00Z',
    completed_at: '2024-01-15T16:30:00Z',
    duration_hours: 2.5,
    customer_rating: 5
  },
  {
    id: 'BLU-S-002',
    order_id: 'BLU-O-002',
    customer_name: 'Maria Santos',
    type: 'install',
    status: 'completed',
    started_at: '2024-01-14T09:00:00Z',
    completed_at: '2024-01-14T11:15:00Z',
    duration_hours: 2.25
  },
  {
    id: 'BLU-S-003',
    order_id: 'BLU-O-003',
    customer_name: 'Pedro Costa',
    type: 'uninstall',
    status: 'rejected',
    started_at: '2024-01-13T15:00:00Z',
    completed_at: '2024-01-13T16:00:00Z',
    duration_hours: 1.0,
    rejection_reason: 'Equipamento não localizado na foto'
  }
];

const statusColors = {
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

const statusLabels = {
  completed: 'Concluído',
  approved: 'Aprovado',
  rejected: 'Rejeitado'
};

const typeLabels = {
  install: 'Instalação',
  uninstall: 'Desinstalação'
};

export const SetupTechnician: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const stats = mockTechnicianStats;

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel do Técnico</h1>
          <p className="text-muted-foreground">
            Dashboard individual com KPIs e histórico de performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Technician Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <HardHat className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{stats.name}</CardTitle>
              <CardDescription>{stats.email} • {stats.region}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Setups Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.setups_completed}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.this_month.completed} este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avg_completion_time}h</div>
            <p className="text-xs text-muted-foreground">
              {stats.this_month.avg_time}h este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Cliente</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRatingColor(stats.customer_rating)}`}>
              {stats.customer_rating}/5
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.this_month.rating}/5 este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getEfficiencyColor(stats.efficiency_score)}`}>
              {stats.efficiency_score}%
            </div>
            <Progress value={stats.efficiency_score} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Métricas de Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Taxa de Retrabalho</span>
              <span className={`font-bold ${stats.rework_rate <= 5 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.rework_rate}%
              </span>
            </div>
            <Progress value={stats.rework_rate} max={10} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Setups Pendentes</span>
              <span className="font-bold">{stats.setups_pending}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Aprovação Primeira Tentativa</span>
              <span className="font-bold text-green-600">96.8%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium">5 Estrelas</div>
                <div className="text-sm text-muted-foreground">Avaliação perfeita</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Tempo Record</div>
                <div className="text-sm text-muted-foreground">Instalação em 1.5h</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium">100 Setups</div>
                <div className="text-sm text-muted-foreground">Marco alcançado</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico Recente
          </CardTitle>
          <CardDescription>Últimos setups realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setup</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSetupHistory.map((setup) => (
                <TableRow key={setup.id}>
                  <TableCell className="font-medium">{setup.id}</TableCell>
                  <TableCell>{setup.customer_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {typeLabels[setup.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[setup.status]}>
                      {statusLabels[setup.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{setup.duration_hours}h</TableCell>
                  <TableCell>
                    {setup.customer_rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{setup.customer_rating}/5</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(setup.completed_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};