
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Zap, Plus, Settings, Clock, Filter, Mail, User, Tag, AlertCircle, CheckCircle, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const TicketAutomation = () => {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'Auto-atribuição por Categoria',
      description: 'Atribui automaticamente tickets de conectividade para a equipe de rede',
      active: true,
      trigger: 'Categoria = Conectividade',
      action: 'Atribuir para: Equipe de Rede',
      lastTriggered: '2024-01-15 14:30',
      triggeredCount: 45,
      type: 'assignment'
    },
    {
      id: 2,
      name: 'Notificação de Alta Prioridade',
      description: 'Envia notificação imediata para gerentes quando ticket de alta prioridade é criado',
      active: true,
      trigger: 'Prioridade = Alta',
      action: 'Notificar: Gerentes',
      lastTriggered: '2024-01-15 12:15',
      triggeredCount: 12,
      type: 'notification'
    },
    {
      id: 3,
      name: 'Escalação por Tempo',
      description: 'Escala ticket para supervisor após 24h sem resposta',
      active: true,
      trigger: 'Tempo sem resposta > 24h',
      action: 'Escalar para: Supervisor',
      lastTriggered: '2024-01-14 16:45',
      triggeredCount: 8,
      type: 'escalation'
    },
    {
      id: 4,
      name: 'Fechamento Automático',
      description: 'Fecha automaticamente tickets resolvidos há mais de 7 dias sem resposta do cliente',
      active: false,
      trigger: 'Status = Resolvido AND Tempo > 7 dias',
      action: 'Fechar ticket',
      lastTriggered: '2024-01-10 09:20',
      triggeredCount: 23,
      type: 'closure'
    },
    {
      id: 5,
      name: 'Tag Automática por Cliente',
      description: 'Adiciona tags baseadas no cliente que criou o ticket',
      active: true,
      trigger: 'Cliente = Empresa VIP',
      action: 'Adicionar tag: VIP',
      lastTriggered: '2024-01-15 11:30',
      triggeredCount: 18,
      type: 'tagging'
    }
  ]);

  const workflows = [
    {
      id: 1,
      name: 'Workflow de Suporte Básico',
      description: 'Fluxo padrão para tickets de suporte técnico',
      active: true,
      steps: 5,
      usage: 156,
      lastUsed: '2024-01-15 15:20'
    },
    {
      id: 2,
      name: 'Workflow de Instalação',
      description: 'Processo completo para instalação de equipamentos',
      active: true,
      steps: 8,
      usage: 34,
      lastUsed: '2024-01-15 10:45'
    },
    {
      id: 3,
      name: 'Workflow de Escalação',
      description: 'Processo de escalação para casos complexos',
      active: false,
      steps: 4,
      usage: 12,
      lastUsed: '2024-01-12 14:30'
    }
  ];

  const templates = [
    {
      id: 1,
      name: 'Resposta Automática de Criação',
      description: 'Mensagem enviada automaticamente quando ticket é criado',
      active: true,
      usage: 245,
      lastUsed: '2024-01-15 16:10'
    },
    {
      id: 2,
      name: 'Notificação de Resolução',
      description: 'Mensagem enviada quando ticket é marcado como resolvido',
      active: true,
      usage: 189,
      lastUsed: '2024-01-15 15:45'
    },
    {
      id: 3,
      name: 'Lembrete de Feedback',
      description: 'Solicitação de avaliação enviada após fechamento',
      active: false,
      usage: 78,
      lastUsed: '2024-01-13 12:20'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <User className="h-4 w-4" />;
      case 'notification': return <Mail className="h-4 w-4" />;
      case 'escalation': return <AlertCircle className="h-4 w-4" />;
      case 'closure': return <CheckCircle className="h-4 w-4" />;
      case 'tagging': return <Tag className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-blue-100 text-blue-800';
      case 'notification': return 'bg-green-100 text-green-800';
      case 'escalation': return 'bg-orange-100 text-orange-800';
      case 'closure': return 'bg-gray-100 text-gray-800';
      case 'tagging': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleRule = (ruleId: number) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, active: !rule.active } : rule
    ));
  };

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={Zap}
        title="Automação e Regras"
        description="Configure regras automáticas e workflows para otimizar o processo de tickets"
      >
        <Button className="bg-[#4D2BFB] hover:bg-[#020CBC]">
          <Plus className="h-4 w-4 mr-2" />
          Nova Regra
        </Button>
      </StandardPageHeader>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">Regras Automáticas</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="border-[#4D2BFB]/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[#020CBC] font-neue-haas">Regras de Automação</CardTitle>
                      <CardDescription>Configure regras para automatizar ações nos tickets</CardDescription>
                    </div>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações Globais
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rules.map((rule) => (
                      <Card key={rule.id} className="border-l-4 border-l-[#4D2BFB]">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`p-1 rounded ${getTypeColor(rule.type)}`}>
                                  {getTypeIcon(rule.type)}
                                </div>
                                <h3 className="font-semibold text-[#020CBC]">{rule.name}</h3>
                                <Badge variant={rule.active ? "success" : "secondary"}>
                                  {rule.active ? 'Ativa' : 'Inativa'}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium text-[#020CBC]">Gatilho:</span>
                                  <p className="text-muted-foreground">{rule.trigger}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-[#020CBC]">Ação:</span>
                                  <p className="text-muted-foreground">{rule.action}</p>
                                </div>
                              </div>
                              
                              <Separator className="my-3" />
                              
                              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Última execução: {rule.lastTriggered}</span>
                                </div>
                                <div>
                                  <span>Executada {rule.triggeredCount} vezes</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <Switch
                                checked={rule.active}
                                onCheckedChange={() => toggleRule(rule.id)}
                              />
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar Regra
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Filter className="h-4 w-4 mr-2" />
                                    Testar Regra
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir Regra
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-[#4D2BFB]/20">
                <CardHeader>
                  <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#4D2BFB]">{rules.filter(r => r.active).length}</div>
                    <div className="text-sm text-muted-foreground">Regras Ativas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#4D2BFB]">
                      {rules.reduce((sum, rule) => sum + rule.triggeredCount, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Execuções Totais</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#4D2BFB]">98%</div>
                    <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#4D2BFB]/20">
                <CardHeader>
                  <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Regra
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Filter className="h-4 w-4 mr-2" />
                    Testar Regras
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#020CBC] font-neue-haas">Workflows</CardTitle>
                  <CardDescription>Gerencie fluxos de trabalho automatizados</CardDescription>
                </div>
                <Button className="bg-[#4D2BFB] hover:bg-[#020CBC]">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Workflow
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflows.map((workflow) => (
                  <Card key={workflow.id} className="border-[#4D2BFB]/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-[#020CBC]">{workflow.name}</h3>
                        <Badge variant={workflow.active ? "success" : "secondary"}>
                          {workflow.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">{workflow.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Etapas:</span>
                          <span className="font-medium">{workflow.steps}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Uso:</span>
                          <span className="font-medium">{workflow.usage}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Último uso:</span>
                          <span className="font-medium">{new Date(workflow.lastUsed).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="h-3 w-3 mr-1" />
                          Config
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#020CBC] font-neue-haas">Templates de Mensagem</CardTitle>
                  <CardDescription>Gerencie templates para respostas automáticas</CardDescription>
                </div>
                <Button className="bg-[#4D2BFB] hover:bg-[#020CBC]">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card key={template.id} className="border-l-4 border-l-[#4D2BFB]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Mail className="h-4 w-4 text-[#4D2BFB]" />
                            <h3 className="font-semibold text-[#020CBC]">{template.name}</h3>
                            <Badge variant={template.active ? "success" : "secondary"}>
                              {template.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                          
                          <div className="flex items-center gap-6 text-xs text-muted-foreground">
                            <div>
                              <span>Usado {template.usage} vezes</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Último uso: {template.lastUsed}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Switch checked={template.active} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar Template
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Filter className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir Template
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketAutomation;
