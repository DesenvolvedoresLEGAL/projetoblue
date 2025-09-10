import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Clock, QrCode, Filter, Search, RefreshCw } from 'lucide-react';
import { useSetupList } from '../hooks/useSetupData';
import type { SetupStatus } from '../types';
import { formatRelativeTime } from '@/utils/dashboardUtils';
import { Link } from 'react-router-dom';

interface TechnicianDashboardProps {
  technicianId: string;
}

export const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ technicianId }) => {
  const [statusFilter, setStatusFilter] = useState<SetupStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: setups = [], isLoading, refetch } = useSetupList(
    technicianId,
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  );

  const filteredSetups = setups.filter(setup => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        setup.id.toLowerCase().includes(searchLower) ||
        setup.customer_id.toLowerCase().includes(searchLower) ||
        setup.region?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const getStatusBadgeVariant = (status: SetupStatus) => {
    switch (status) {
      case 'scheduled': return 'outline';
      case 'in_progress': return 'default';
      case 'completed': return 'secondary';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: SetupStatus) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'in_progress': return 'Em Progresso';
      case 'completed': return 'Concluído';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  const statusCounts = setups.reduce((acc, setup) => {
    acc[setup.status] = (acc[setup.status] || 0) + 1;
    return acc;
  }, {} as Record<SetupStatus, number>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Técnico</h1>
          <p className="text-muted-foreground">Gerencie suas instalações e desinstalações</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Link to="/setup/scan">
            <Button>
              <QrCode className="h-4 w-4 mr-2" />
              Escanear QR
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Agendados</span>
            </div>
            <p className="text-2xl font-bold mt-2">{statusCounts.scheduled || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Em Progresso</span>
            </div>
            <p className="text-2xl font-bold mt-2">{statusCounts.in_progress || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="h-4 w-4 bg-green-500" />
              <span className="text-sm font-medium">Concluídos</span>
            </div>
            <p className="text-2xl font-bold mt-2">{statusCounts.completed || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Badge className="h-4 w-4 bg-blue-500" />
              <span className="text-sm font-medium">Aprovados</span>
            </div>
            <p className="text-2xl font-bold mt-2">{statusCounts.approved || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, cliente ou região..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SetupStatus | 'all')}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Setups List */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Instalações ({filteredSetups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredSetups.length > 0 ? (
            <div className="space-y-4">
              {filteredSetups.map((setup) => (
                <div key={setup.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(setup.status)}>
                        {getStatusLabel(setup.status)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">#{setup.id.substring(0, 8)}</span>
                    </div>
                    <Link to={`/setup/${setup.id}`}>
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{setup.region || 'Região não definida'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatRelativeTime(new Date(setup.created_at))}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{setup.order_type === 'install' ? 'Instalação' : 'Desinstalação'}</span>
                    </div>
                  </div>

                  {setup.asset_serials && setup.asset_serials.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span>Ativos: {setup.asset_serials.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma instalação encontrada</h3>
              <p className="mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Escaneie um QR Code para começar uma nova instalação.'
                }
              </p>
              <Link to="/setup/scan">
                <Button>
                  <QrCode className="h-4 w-4 mr-2" />
                  Escanear QR Code
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};