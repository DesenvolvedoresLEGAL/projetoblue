import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShieldCheck, Eye, CheckCircle, XCircle, Search, Filter, Download, Clock, User, MapPin } from 'lucide-react';

interface SetupForApproval {
  id: string;
  order_id: string;
  technician_name: string;
  customer_name: string;
  address: string;
  type: 'install' | 'uninstall';
  completed_at: string;
  duration_hours: number;
  region: string;
  evidences: {
    photos_count: number;
    has_speed_test: boolean;
    has_signature: boolean;
  };
  status: 'completed' | 'approved' | 'rejected';
  rejection_reason?: string;
}

const mockSetupsForApproval: SetupForApproval[] = [
  {
    id: 'BLU-S-001',
    order_id: 'BLU-O-001',
    technician_name: 'Carlos Oliveira',
    customer_name: 'João Silva',
    address: 'Rua das Flores, 123 - São Paulo',
    type: 'install',
    completed_at: '2024-01-15T16:30:00Z',
    duration_hours: 2.5,
    region: 'São Paulo - Norte',
    evidences: {
      photos_count: 8,
      has_speed_test: true,
      has_signature: true
    },
    status: 'completed'
  },
  {
    id: 'BLU-S-002',
    order_id: 'BLU-O-002',
    technician_name: 'Maria Santos',
    customer_name: 'Pedro Costa',
    address: 'Av. Paulista, 456 - São Paulo',
    type: 'install',
    completed_at: '2024-01-14T11:15:00Z',
    duration_hours: 2.25,
    region: 'São Paulo - Centro',
    evidences: {
      photos_count: 6,
      has_speed_test: true,
      has_signature: true
    },
    status: 'approved'
  },
  {
    id: 'BLU-S-003',
    order_id: 'BLU-O-003',
    technician_name: 'Roberto Lima',
    customer_name: 'Ana Paula',
    address: 'Rua dos Jardins, 789 - São Paulo',
    type: 'uninstall',
    completed_at: '2024-01-13T14:00:00Z',
    duration_hours: 1.0,
    region: 'São Paulo - Sul',
    evidences: {
      photos_count: 3,
      has_speed_test: false,
      has_signature: true
    },
    status: 'rejected',
    rejection_reason: 'Fotos insuficientes do equipamento retirado'
  }
];

const statusColors = {
  completed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

const statusLabels = {
  completed: 'Aguardando',
  approved: 'Aprovado',
  rejected: 'Rejeitado'
};

const typeLabels = {
  install: 'Instalação',
  uninstall: 'Desinstalação'
};

export const SetupSupervision: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('completed');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [selectedSetup, setSelectedSetup] = useState<SetupForApproval | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);

  const filteredSetups = mockSetupsForApproval.filter(setup => {
    const matchesSearch = setup.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setup.technician_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setup.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || setup.status === statusFilter;
    const matchesRegion = regionFilter === 'all' || setup.region === regionFilter;
    
    return matchesSearch && matchesStatus && matchesRegion;
  });

  const handleViewDetails = (setup: SetupForApproval) => {
    setSelectedSetup(setup);
    console.log('Visualizando detalhes do setup:', setup.id);
    // TODO: Abrir modal ou navegar para página de detalhes
  };

  const handleApprove = (setup: SetupForApproval) => {
    setSelectedSetup(setup);
    setIsApprovalDialogOpen(true);
  };

  const handleReject = (setup: SetupForApproval) => {
    setSelectedSetup(setup);
    setIsRejectionDialogOpen(true);
  };

  const confirmApproval = () => {
    if (selectedSetup) {
      console.log('Aprovando setup:', selectedSetup.id);
      // TODO: Implementar aprovação via API
      setIsApprovalDialogOpen(false);
      setSelectedSetup(null);
    }
  };

  const confirmRejection = () => {
    if (selectedSetup && rejectionReason.trim()) {
      console.log('Rejeitando setup:', selectedSetup.id, 'Motivo:', rejectionReason);
      // TODO: Implementar rejeição via API
      setIsRejectionDialogOpen(false);
      setSelectedSetup(null);
      setRejectionReason('');
    }
  };

  const handleExportCSV = () => {
    console.log('Exportando dados para CSV');
    // TODO: Implementar export CSV
  };

  const regions = [...new Set(mockSetupsForApproval.map(s => s.region))];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Supervisão</h1>
          <p className="text-muted-foreground">
            Aprovação e reprovação de setups concluídos
          </p>
        </div>
        <Button onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Aprovação</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSetupsForApproval.filter(s => s.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSetupsForApproval.filter(s => s.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSetupsForApproval.filter(s => s.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Aprovação</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((mockSetupsForApproval.filter(s => s.status === 'approved').length / 
                          mockSetupsForApproval.filter(s => s.status !== 'completed').length) * 100)}%
            </div>
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
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, técnico ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="completed">Aguardando</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Regiões</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Setups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Setups para Supervisão</CardTitle>
          <CardDescription>
            {filteredSetups.length} setup(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setup</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Evidências</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSetups.map((setup) => (
                <TableRow key={setup.id}>
                  <TableCell className="font-medium">{setup.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {setup.technician_name}
                    </div>
                  </TableCell>
                  <TableCell>{setup.customer_name}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {setup.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {typeLabels[setup.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>📷 {setup.evidences.photos_count} fotos</div>
                      <div>⚡ {setup.evidences.has_speed_test ? '✅' : '❌'} Speed test</div>
                      <div>✍️ {setup.evidences.has_signature ? '✅' : '❌'} Assinatura</div>
                    </div>
                  </TableCell>
                  <TableCell>{setup.duration_hours}h</TableCell>
                  <TableCell>
                    <Badge className={statusColors[setup.status]}>
                      {statusLabels[setup.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(setup)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {setup.status === 'completed' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleApprove(setup)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReject(setup)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Setup</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja aprovar o setup {selectedSetup?.id} do técnico {selectedSetup?.technician_name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmApproval}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Setup</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição do setup {selectedSetup?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Descreva o motivo da rejeição..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRejection}
              disabled={!rejectionReason.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};