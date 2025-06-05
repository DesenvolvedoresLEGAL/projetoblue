
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Clipboard,
  History,
  Filter,
  Download
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const QualityAudit: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("reviews");

  // Mock data - replace with actual API calls
  const qualityReviews = [
    {
      id: "QA-2024-001",
      ticketId: "TK-2024-001",
      agentName: "Maria Santos",
      reviewerName: "João Supervisor",
      score: 92,
      category: "Technical Support",
      createdAt: "2024-01-15T10:30:00Z",
      status: "completed",
      feedback: "Excelente atendimento técnico, boa comunicação e resolução eficiente."
    },
    {
      id: "QA-2024-002",
      ticketId: "TK-2024-002",
      agentName: "Pedro Lima",
      reviewerName: "João Supervisor",
      score: 78,
      category: "Customer Service",
      createdAt: "2024-01-14T14:45:00Z",
      status: "completed",
      feedback: "Comunicação poderia ser mais clara. Tempo de resolução acima do esperado."
    },
    {
      id: "QA-2024-003",
      ticketId: "TK-2024-003",
      agentName: "Lucia Fernandes",
      reviewerName: "João Supervisor",
      score: 88,
      category: "Technical Support",
      createdAt: "2024-01-13T09:15:00Z",
      status: "completed",
      feedback: "Boa explicação técnica e solução adequada. Poderia ter feito follow-up."
    },
    {
      id: "QA-2024-004",
      ticketId: "TK-2024-005",
      agentName: "Carlos Silva",
      reviewerName: "Maria Supervisora",
      score: 0,
      category: "Customer Service",
      createdAt: "2024-01-15T16:20:00Z",
      status: "pending",
      feedback: ""
    }
  ];

  const auditHistory = [
    {
      id: "HIST-001",
      ticketId: "TK-2023-567",
      field: "status",
      oldValue: "open",
      newValue: "solved",
      changedBy: "Maria Santos",
      changedAt: "2024-01-15T14:30:00Z"
    },
    {
      id: "HIST-002",
      ticketId: "TK-2023-567",
      field: "priority",
      oldValue: "normal",
      newValue: "high",
      changedBy: "Pedro Lima",
      changedAt: "2024-01-15T10:15:00Z"
    },
    {
      id: "HIST-003",
      ticketId: "TK-2023-589",
      field: "assignee",
      oldValue: "unassigned",
      newValue: "Lucia Fernandes",
      changedBy: "System",
      changedAt: "2024-01-14T16:45:00Z"
    },
    {
      id: "HIST-004",
      ticketId: "TK-2023-589",
      field: "sla_policy",
      oldValue: "Standard",
      newValue: "Premium",
      changedBy: "João Supervisor",
      changedAt: "2024-01-14T16:50:00Z"
    }
  ];

  const templates = [
    {
      id: "TPL-001",
      name: "Avaliação Técnica",
      description: "Template para avaliação de tickets de suporte técnico",
      criteria: [
        { name: "Identificação do Problema", weight: 20 },
        { name: "Conhecimento Técnico", weight: 25 },
        { name: "Clareza na Comunicação", weight: 20 },
        { name: "Documentação da Solução", weight: 15 },
        { name: "Follow-up", weight: 10 },
        { name: "Tempo de Resolução", weight: 10 }
      ]
    },
    {
      id: "TPL-002",
      name: "Atendimento ao Cliente",
      description: "Template para avaliação de qualidade de atendimento",
      criteria: [
        { name: "Cortesia e Empatia", weight: 25 },
        { name: "Compreensão do Problema", weight: 20 },
        { name: "Resolução Adequada", weight: 25 },
        { name: "Comunicação Clara", weight: 15 },
        { name: "Eficiência", weight: 15 }
      ]
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-legal-dark">Qualidade & Auditoria</h1>
          <p className="text-muted-foreground">
            Avalie a qualidade do atendimento e audite alterações
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Avaliações
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Clipboard className="h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por ID do ticket, agente ou avaliador..."
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quality Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliações de Qualidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {qualityReviews.map((review) => (
                  <div 
                    key={review.id}
                    className={`p-4 border rounded-lg ${review.status === 'pending' ? 'bg-yellow-50' : ''}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{review.id}</h3>
                          <Badge variant="secondary">{review.category}</Badge>
                          {review.status === 'pending' ? (
                            <Badge variant="outline" className="text-yellow-600">Pendente</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600">Concluído</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Ticket: {review.ticketId} • {formatDate(review.createdAt)}
                        </p>
                      </div>
                      
                      {review.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Score:</span>
                          <span 
                            className={`text-2xl font-bold ${getScoreColor(review.score)}`}
                          >
                            {review.score}/100
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Agente</p>
                        <p className="text-sm text-muted-foreground">{review.agentName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Avaliador</p>
                        <p className="text-sm text-muted-foreground">{review.reviewerName}</p>
                      </div>
                    </div>

                    {review.status === 'completed' && (
                      <div>
                        <p className="text-sm font-medium mb-2">Feedback</p>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          {review.feedback}
                        </div>
                      </div>
                    )}

                    {review.status === 'pending' && (
                      <div className="space-y-4 mt-4">
                        <Textarea 
                          placeholder="Adicionar feedback para o agente..."
                          rows={3} 
                        />
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Score:</span>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              className="w-20" 
                              placeholder="0-100"
                            />
                          </div>
                          <Button>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Concluir Avaliação
                          </Button>
                        </div>
                      </div>
                    )}

                    {review.status === 'completed' && (
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" size="sm">
                          Detalhes
                        </Button>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Search for History */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar no histórico de alterações..."
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Audit History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Alterações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">ID</th>
                      <th className="text-left p-3">Ticket</th>
                      <th className="text-left p-3">Campo</th>
                      <th className="text-left p-3">Valor Antigo</th>
                      <th className="text-left p-3">Valor Novo</th>
                      <th className="text-left p-3">Alterado por</th>
                      <th className="text-left p-3">Data/Hora</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditHistory.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{record.id}</td>
                        <td className="p-3">{record.ticketId}</td>
                        <td className="p-3">
                          <Badge variant="outline">{record.field}</Badge>
                        </td>
                        <td className="p-3">
                          <span className="text-red-600">{record.oldValue}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-green-600">{record.newValue}</span>
                        </td>
                        <td className="p-3">{record.changedBy}</td>
                        <td className="p-3">{formatDate(record.changedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total de Alterações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">583</div>
                <p className="text-xs text-muted-foreground">
                  Últimos 30 dias
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Principais Campos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium">245</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Atribuição:</span>
                    <span className="font-medium">182</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prioridade:</span>
                    <span className="font-medium">104</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Maria Santos:</span>
                    <span className="font-medium">145</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pedro Lima:</span>
                    <span className="font-medium">132</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sistema:</span>
                    <span className="font-medium">97</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Templates de Avaliação</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {templates.map((template) => (
                <div 
                  key={template.id}
                  className="p-4 border rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        Usar
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Critérios de Avaliação</h4>
                    <div className="space-y-2">
                      {template.criteria.map((criterion) => (
                        <div key={criterion.name} className="flex items-center justify-between">
                          <span className="text-sm">{criterion.name}</span>
                          <Badge variant="secondary">{criterion.weight}%</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dicas para Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Utilize critérios objetivos de avaliação</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Forneça feedback construtivo e específico</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Analise o contexto completo da interação</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Considere o nível de complexidade do caso</span>
                </p>
                <p className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>Evite avaliações baseadas apenas em métricas numéricas</span>
                </p>
                <p className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>Não compare agentes com diferentes níveis de experiência</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityAudit;
