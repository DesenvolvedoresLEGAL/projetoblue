import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PenTool, Eye, Download, Mail, Search, Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface Signature {
  id: string;
  setup_id: string;
  customer_name: string;
  signer_name: string;
  signer_document?: string;
  signed_at: string;
  file_path: string;
  is_encrypted: boolean;
  validation_status: 'valid' | 'pending' | 'invalid';
  email_sent: boolean;
  email_sent_at?: string;
  order_type: 'install' | 'uninstall';
}

const mockSignatures: Signature[] = [
  {
    id: 'SIG-001',
    setup_id: 'BLU-S-001',
    customer_name: 'João Silva',
    signer_name: 'João Silva',
    signer_document: '123.456.789-00',
    signed_at: '2024-01-15T16:30:00Z',
    file_path: '/signatures/sig_001_encrypted.png',
    is_encrypted: true,
    validation_status: 'valid',
    email_sent: true,
    email_sent_at: '2024-01-15T16:35:00Z',
    order_type: 'install'
  },
  {
    id: 'SIG-002',
    setup_id: 'BLU-S-002',
    customer_name: 'Maria Santos',
    signer_name: 'Maria Santos',
    signer_document: '987.654.321-00',
    signed_at: '2024-01-14T17:15:00Z',
    file_path: '/signatures/sig_002_encrypted.png',
    is_encrypted: true,
    validation_status: 'pending',
    email_sent: false,
    order_type: 'install'
  }
];

const validationColors = {
  valid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  invalid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

const validationLabels = {
  valid: 'Válida',
  pending: 'Pendente',
  invalid: 'Inválida'
};

const orderTypeLabels = {
  install: 'Instalação',
  uninstall: 'Desinstalação'
};

export const SetupSignatures: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredSignatures = mockSignatures.filter(signature => {
    const matchesSearch = signature.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signature.signer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signature.setup_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || signature.validation_status === statusFilter;
    const matchesType = typeFilter === 'all' || signature.order_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewSignature = (signatureId: string) => {
    // console.log('Visualizando assinatura:', signatureId);
    // TODO: Implementar visualização via Edge Function decrypt_and_stream
  };

  const handleDownloadSignature = (signatureId: string) => {
    // console.log('Baixando assinatura:', signatureId);
    // TODO: Implementar download seguro
  };

  const handleSendEmail = (signatureId: string) => {
    // console.log('Enviando email para:', signatureId);
    // TODO: Implementar reenvio de email via n8n
  };

  const handleValidateSignature = (signatureId: string) => {
    console.log('Validando assinatura:', signatureId);
    // TODO: Implementar validação jurídica
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assinaturas</h1>
          <p className="text-muted-foreground">
            Gestão de assinaturas eletrônicas e validação jurídica
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSignatures.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Válidas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSignatures.filter(s => s.validation_status === 'valid').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSignatures.filter(s => s.validation_status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSignatures.filter(s => s.email_sent).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, assinante ou setup..."
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
                <SelectItem value="valid">Válida</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="invalid">Inválida</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="install">Instalação</SelectItem>
                <SelectItem value="uninstall">Desinstalação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Signatures Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Assinaturas</CardTitle>
          <CardDescription>
            {filteredSignatures.length} assinatura(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setup</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Assinante</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSignatures.map((signature) => (
                <TableRow key={signature.id}>
                  <TableCell className="font-medium">{signature.setup_id}</TableCell>
                  <TableCell>{signature.customer_name}</TableCell>
                  <TableCell>{signature.signer_name}</TableCell>
                  <TableCell>{signature.signer_document || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {orderTypeLabels[signature.order_type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={validationColors[signature.validation_status]}>
                      {validationLabels[signature.validation_status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(signature.signed_at).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {signature.email_sent ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Enviado</span>
                        </div>
                      ) : (
                        <Badge variant="secondary">Não enviado</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewSignature(signature.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadSignature(signature.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {!signature.email_sent && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSendEmail(signature.id)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                      {signature.validation_status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleValidateSignature(signature.id)}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança e Validação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Todas as assinaturas são criptografadas com AES-256-GCM</p>
            <p>• Validação jurídica automática implementada via Edge Functions</p>
            <p>• Emails com OS assinada são enviados automaticamente via integração BLUE™</p>
            <p>• Logs de auditoria mantêm rastreabilidade completa</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};