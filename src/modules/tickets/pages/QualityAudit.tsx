import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Shield, CheckCircle, AlertTriangle, BarChart3, Clock, CheckCircle2, XCircle,
  User, MessageCircle, FileText, Filter, Plus, Edit, Download
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const QualityAudit = () => {
  const [timeRange, setTimeRange] = useState('week');

  // Mock data para demonstração
  const audits = [
    {
      id: 'AUD-001',
      ticketId: 'T-2024-001',
      agent: 'João Silva',
      customer: 'TechCorp Ltda',
      date: '2024-01-15',
      category: 'Técnico',
      score: 92,
      status: 'Aprovado'
    },
    {
      id: 'AUD-002',
      ticketId: 'T-2024-007',
      agent: 'Maria Santos',
      customer: 'SecureNet',
      date: '2024-01-14',
      category: 'Atendimento',
      score: 78,
      status: 'Aprovado com Observações'
    },
    {
      id: 'AUD-003',
      ticketId: 'T-2024-012',
      agent: 'Pedro Costa',
      customer: 'FastGrowth Inc',
      date: '2024-01-13',
      category: 'Técnico',
      score: 88,
      status: 'Aprovado'
    },
    {
      id: 'AUD-004',
      ticketId: 'T-2024-015',
      agent: 'Ana Lima',
      customer: 'DigitalSoft',
      date: '2024-01-12',
      category: 'Processo',
      score: 65,
      status: 'Requer Atenção'
    },
    {
      id: 'AUD-005',
      ticketId: 'T-2024-022',
      agent: 'Carlos Oliveira',
      customer: 'QuickBiz',
      date: '2024-01-11',
      category: 'Atendimento',
      score: 95,
      status: 'Aprovado'
    }
  ];

  const criteriaScores = [
    { name: 'Resolução Técnica', score: 87 },
    { name: 'Tempo de Resposta', score: 92 },
    { name: 'Comunicação com Cliente', score: 85 },
    { name: 'Documentação', score: 78 },
    { name: 'Seguimento de Procedimentos', score: 82 }
  ];

  const qualityTrends = [
    { month: 'Jan', overall: 82 },
    { month: 'Fev', overall: 84 },
    { month: 'Mar', overall: 83 },
    { month: 'Abr', overall: 86 },
    { month: 'Mai', overall: 88 },
    { month: 'Jun', overall: 87 },
    { month: 'Jul', overall: 89 },
    { month: 'Ago', overall: 86 },
    { month: 'Set', overall: 90 },
    { month: 'Out', overall: 91 },
    { month: 'Nov', overall: 92 },
    { month: 'Dez', overall: 90 }
  ];

  const feedbackItems = [
    {
      id: 1,
      agent: 'Maria Santos',
      feedback: 'Excelente trabalho na explicação técnica para o cliente. Linguagem clara e acessível.',
      ticketId: 'T-2024-007',
      category: 'Positivo',
      date: '2024-01-14'
    },
    {
      id: 2,
      agent: 'Ana Lima',
      feedback: 'Necessita melhorar a documentação da resolução. Informações importantes não foram registradas.',
      ticketId: 'T-2024-015',
      category: 'Melhoria',
      date: '2024-01-12'
    },
    {
      id: 3,
      agent: 'João Silva',
      feedback: 'Resolução técnica excelente, mas poderia ter sido mais rápido na primeira resposta.',
      ticketId: 'T-2024-001',
      category: 'Misto',
      date: '2024-01-15'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 75) return 'bg-amber-600';
    return 'bg-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'Aprovado com Observações':
        return <Badge className="bg-amber-100 text-amber-800">Com Observações</Badge>;
      case 'Requer Atenção':
        return <Badge className="bg-red-100 text-red-800">Requer Atenção</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getFeedbackBadge = (category: string) => {
    switch (category) {
      case 'Positivo':
        return <Badge className="bg-green-100 text-green-800">Positivo</Badge>;
      case 'Melhoria':
        return <Badge className="bg-red-100 text-red-800">Melhoria</Badge>;
      case 'Misto':
        return <Badge className="bg-amber-100 text-amber-800">Misto</Badge>;
      default:
        return <Badge>{category}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={Shield}
        title="Qualidade & Auditoria"
        description="Monitore e avalie a qualidade do atendimento aos tickets"
      >
        <div className="flex items-center gap-2">
          <Button className="bg-[#4D2BFB] hover:bg-[#020CBC]">
            <Plus className="h-4 w-4 mr-2" />
            Nova Auditoria
          </Button>
        </div>
      </StandardPageHeader>

      {/* Quality Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Qualidade Geral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="relative h-36 w-36 flex items-center justify-center">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-[#4D2BFB]"
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 * (1 - 88/100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                </svg>
                <span className="absolute text-3xl font-bold text-[#020CBC]">88%</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center px-2 text-sm">
              <span className="text-muted-foreground">Este mês</span>
              <div className="flex items-center gap-1">
                <span className="text-green-600">+2%</span>
                <span className="text-muted-foreground">vs. último mês</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Critérios de Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criteriaScores.map(criterion => (
                <div key={criterion.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{criterion.name}</span>
                    <span className={`text-sm font-medium ${getScoreColor(criterion.score)}`}>
                      {criterion.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getScoreProgressColor(criterion.score)}`}
                      style={{ width: `${criterion.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#4D2BFB]/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-bold text-green-600">73%</span>
                </div>
                <span className="text-xs text-muted-foreground">Auditorias aprovadas</span>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="text-lg font-bold text-amber-600">18%</span>
                </div>
                <span className="text-xs text-muted-foreground">Com observações</span>
              </div>
              
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-lg font-bold text-red-600">9%</span>
                </div>
                <span className="text-xs text-muted-foreground">Requer atenção</span>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-bold text-blue-600">98%</span>
                </div>
                <span className="text-xs text-muted-foreground">Conclusão de ações</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audits" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audits">Auditorias</TabsTrigger>
          <TabsTrigger value="feedback">Feedbacks</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        <TabsContent value="audits" className="space-y-4">
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#020CBC] font-neue-haas">Auditorias Recentes</CardTitle>
                  <CardDescription>Últimas avaliações de qualidade realizadas</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Ticket</TableHead>
                    <TableHead>Agente</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map(audit => (
                    <TableRow key={audit.id}>
                      <TableCell className="font-medium">{audit.id}</TableCell>
                      <TableCell>{audit.ticketId}</TableCell>
                      <TableCell>{audit.agent}</TableCell>
                      <TableCell>{audit.customer}</TableCell>
                      <TableCell>{audit.category}</TableCell>
                      <TableCell>{audit.date}</TableCell>
                      <TableCell>
                        <span className={getScoreColor(audit.score)}>{audit.score}%</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(audit.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                              >
                                <path
                                  d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Auditoria
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Adicionar Feedback
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#020CBC] font-neue-haas">Feedbacks de Qualidade</CardTitle>
                  <CardDescription>Comentários e sugestões das auditorias</CardDescription>
                </div>
                <Button className="bg-[#4D2BFB] hover:bg-[#020CBC]">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Feedback
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbackItems.map(item => (
                  <Card key={item.id} className="border-l-4 border-l-[#4D2BFB]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#4D2BFB]" />
                          <span className="font-medium">{item.agent}</span>
                          {getFeedbackBadge(item.category)}
                        </div>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                      
                      <p className="text-sm mb-3">{item.feedback}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Ticket: {item.ticketId}</span>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#020CBC] font-neue-haas">Tendências de Qualidade</CardTitle>
                  <CardDescription>Evolução dos indicadores ao longo do tempo</CardDescription>
                </div>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Mais Análises
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              {/* In a real application, add a chart library component here */}
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-10 w-10 mx-auto text-[#4D2BFB] mb-2" />
                  <h3 className="text-lg font-medium text-[#020CBC] mb-1">Gráficos de Tendências</h3>
                  <p className="text-sm text-muted-foreground">
                    Aqui seria exibido um gráfico detalhado das tendências de qualidade ao longo do tempo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-[#4D2BFB]/20">
              <CardHeader>
                <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Áreas de Melhoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Documentação</span>
                    <span className="text-red-600">22% das falhas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tempo de Resposta</span>
                    <span className="text-amber-600">18% das falhas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comunicação Técnica</span>
                    <span className="text-amber-600">15% das falhas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Seguimento de Procedimentos</span>
                    <span className="text-amber-600">12% das falhas</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#4D2BFB]/20">
              <CardHeader>
                <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Pontos de Excelência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Cordialidade</span>
                    <span className="text-green-600">97% aprovação</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resolução Técnica</span>
                    <span className="text-green-600">92% aprovação</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conhecimento do Produto</span>
                    <span className="text-green-600">90% aprovação</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Satisfação do Cliente</span>
                    <span className="text-green-600">89% aprovação</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityAudit;
