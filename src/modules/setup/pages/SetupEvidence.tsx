import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Download, Eye, Filter, Search, Shield, Upload } from 'lucide-react';

interface Evidence {
  id: string;
  setup_id: string;
  customer_name: string;
  type: 'photo' | 'speed_test' | 'signature';
  file_name: string;
  file_size: string;
  uploaded_at: string;
  is_encrypted: boolean;
  status: 'uploading' | 'uploaded' | 'failed';
}

const mockEvidences: Evidence[] = [
  {
    id: 'EV-001',
    setup_id: 'BLU-S-001',
    customer_name: 'João Silva',
    type: 'photo',
    file_name: 'instalacao_equipamento_001.jpg',
    file_size: '2.4 MB',
    uploaded_at: '2024-01-15T14:30:00Z',
    is_encrypted: true,
    status: 'uploaded'
  },
  {
    id: 'EV-002',
    setup_id: 'BLU-S-001',
    customer_name: 'João Silva',
    type: 'speed_test',
    file_name: 'speed_test_result.json',
    file_size: '1.2 KB',
    uploaded_at: '2024-01-15T15:00:00Z',
    is_encrypted: true,
    status: 'uploaded'
  },
  {
    id: 'EV-003',
    setup_id: 'BLU-S-002',
    customer_name: 'Maria Santos',
    type: 'signature',
    file_name: 'assinatura_cliente.png',
    file_size: '845 KB',
    uploaded_at: '2024-01-14T16:45:00Z',
    is_encrypted: true,
    status: 'uploaded'
  }
];

const typeLabels = {
  photo: 'Foto',
  speed_test: 'Speed Test',
  signature: 'Assinatura'
};

const typeColors = {
  photo: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  speed_test: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  signature: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
};

const statusColors = {
  uploading: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  uploaded: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

const statusLabels = {
  uploading: 'Enviando',
  uploaded: 'Enviado',
  failed: 'Falhou'
};

export const SetupEvidence: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEvidences = mockEvidences.filter(evidence => {
    const matchesSearch = evidence.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evidence.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evidence.setup_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || evidence.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || evidence.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewEvidence = (evidenceId: string) => {
    console.log('Visualizando evidência:', evidenceId);
    // TODO: Implementar visualização segura via Edge Function
  };

  const handleDownloadEvidence = (evidenceId: string) => {
    console.log('Baixando evidência:', evidenceId);
    // TODO: Implementar download via Edge Function decrypt_and_stream
  };

  const totalSize = mockEvidences.reduce((acc, evidence) => {
    const size = parseFloat(evidence.file_size.replace(/[^0-9.]/g, ''));
    return acc + size;
  }, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evidências</h1>
          <p className="text-muted-foreground">
            Upload e visualização segura de fotos, speed tests e assinaturas
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Manual
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Arquivos</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockEvidences.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fotos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockEvidences.filter(e => e.type === 'photo').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinaturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockEvidences.filter(e => e.type === 'signature').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSize.toFixed(1)} MB</div>
            <p className="text-xs text-muted-foreground">
              Criptografado AES-256
            </p>
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
                  placeholder="Buscar por cliente, arquivo ou setup..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="photo">Fotos</SelectItem>
                <SelectItem value="speed_test">Speed Tests</SelectItem>
                <SelectItem value="signature">Assinaturas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="uploaded">Enviado</SelectItem>
                <SelectItem value="uploading">Enviando</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvidences.map((evidence) => (
          <Card key={evidence.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className={typeColors[evidence.type]}>
                  {typeLabels[evidence.type]}
                </Badge>
                <Badge className={statusColors[evidence.status]}>
                  {statusLabels[evidence.status]}
                </Badge>
              </div>
              <CardTitle className="text-base truncate">{evidence.file_name}</CardTitle>
              <CardDescription>
                <div className="space-y-1">
                  <div>Cliente: {evidence.customer_name}</div>
                  <div>Setup: {evidence.setup_id}</div>
                  <div>Tamanho: {evidence.file_size}</div>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Criptografado</span>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Enviado em: {new Date(evidence.uploaded_at).toLocaleString('pt-BR')}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewEvidence(evidence.id)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadEvidence(evidence.id)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Baixar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvidences.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma evidência encontrada</h3>
            <p className="text-muted-foreground">
              Não há evidências que correspondam aos filtros aplicados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};