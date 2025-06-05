
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap,
  Clock,
  Target,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Settings
} from "lucide-react";

const TicketsAutomation: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState("rules");

  // Mock data - replace with actual API calls
  const automationRules = [
    {
      id: "1",
      title: "Auto-atribuição por Prioridade",
      description: "Atribui tickets urgentes automaticamente para agentes disponíveis",
      active: true,
      conditions: "Prioridade = Urgente AND Status = Novo",
      actions: "Atribuir para Grupo: Suporte L2",
      runsCount: 47,
      lastRun: "2024-01-15T14:30:00Z"
    },
    {
      id: "2", 
      title: "Escalação por Tempo",
      description: "Escala tickets não respondidos em 2 horas",
      active: true,
      conditions: "Tempo desde criação > 2 horas AND Status = Aberto",
      actions: "Alterar prioridade para Alta, Notificar supervisor",
      runsCount: 23,
      lastRun: "2024-01-15T12:15:00Z"
    },
    {
      id: "3",
      title: "Fechamento Automático",
      description: "Fecha tickets resolvidos após 7 dias sem resposta do cliente",
      active: false,
      conditions: "Status = Resolvido AND Última resposta > 7 dias",
      actions: "Alterar status para Fechado, Adicionar comentário",
      runsCount: 156,
      lastRun: "2024-01-14T09:00:00Z"
    }
  ];

  const slaProfiles = [
    {
      id: "1",
      name: "SLA Padrão",
      description: "Política padrão para todos os tickets",
      active: true,
      metrics: [
        { priority: "Baixa", firstResponse: "24h", resolution: "72h" },
        { priority: "Normal", firstResponse: "8h", resolution: "24h" },
        { priority: "Alta", firstResponse: "4h", resolution: "12h" },
        { priority: "Urgente", firstResponse: "1h", resolution: "4h" }
      ],
      compliance: 94.2
    },
    {
      id: "2",
      name: "SLA Premium", 
      description: "Para clientes VIP e contratos especiais",
      active: true,
      metrics: [
        { priority: "Baixa", firstResponse: "12h", resolution: "36h" },
        { priority: "Normal", firstResponse: "4h", resolution: "12h" },
        { priority: "Alta", firstResponse: "2h", resolution: "6h" },
        { priority: "Urgente", firstResponse: "30min", resolution: "2h" }
      ],
      compliance: 98.7
    }
  ];

  const workflowTemplates = [
    {
      id: "1",
      name: "Onboarding de Cliente",
      description: "Processo completo para novos clientes",
      steps: 8,
      avgTime: "3-5 dias",
      category: "Comercial"
    },
    {
      id: "2",
      name: "Troubleshooting de Conectividade",
      description: "Fluxo padrão para problemas de rede",
      steps: 12,
      avgTime: "2-4 horas",
      category: "Técnico"
    },
    {
      id: "3",
      name: "Análise de Consumo",
      description: "Workflow para relatórios de uso de dados",
      steps: 6,
      avgTime: "1-2 horas", 
      category: "Billing"
    }
  ];

  const macros = [
    {
      id: "1",
      title: "Reset de Configurações",
      description: "Instruções padrão para reset de equipamentos",
      category: "Técnico",
      usageCount: 234,
      template: "Olá! Para resolver seu problema, siga estes passos:\n1. Desligue o equipamento\n2. Aguarde 30 segundos..."
    },
    {
      id: "2",
      title: "Solicitação de Informações",
      description: "Pedido padrão de informações adicionais",
      category: "Geral",
      usageCount: 187,
      template: "Precisamos de mais informações para ajudá-lo..."
    }
  ];

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Agora há pouco";
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return `${Math.floor(diffInHours / 24)}d atrás`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-legal-dark">Automação e Regras</h1>
          <p className="text-muted-foreground">
            Configure regras automáticas, SLAs e workflows
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Regras
          </TabsTrigger>
          <TabsTrigger value="sla" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            SLA
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="macros" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Macros
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Automação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {automationRules.map((rule) => (
                <div 
                  key={rule.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{rule.title}</h3>
                        <Switch checked={rule.active} />
                        <Badge variant={rule.active ? "secondary" : "outline"}>
                          {rule.active ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {rule.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Condições:</span>
                      <p className="text-muted-foreground mt-1">{rule.conditions}</p>
                    </div>
                    <div>
                      <span className="font-medium">Ações:</span>
                      <p className="text-muted-foreground mt-1">{rule.actions}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Executada {rule.runsCount} vezes</span>
                    <span>Última execução: {formatTimeAgo(rule.lastRun)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de SLA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {slaProfiles.map((profile) => (
                <div key={profile.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{profile.name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {profile.compliance}% compliance
                      </Badge>
                      <Switch checked={profile.active} />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Prioridade</th>
                          <th className="text-left p-2">Primeira Resposta</th>
                          <th className="text-left p-2">Resolução</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profile.metrics.map((metric, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{metric.priority}</td>
                            <td className="p-2">{metric.firstResponse}</td>
                            <td className="p-2">{metric.resolution}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workflowTemplates.map((template) => (
                  <div 
                    key={template.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Etapas:</span>
                        <Badge variant="outline">{template.steps}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Tempo médio:</span>
                        <span className="text-muted-foreground">{template.avgTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Categoria:</span>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Usar Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="macros" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Macros e Respostas Automáticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {macros.map((macro) => (
                <div 
                  key={macro.id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{macro.title}</h3>
                      <p className="text-sm text-muted-foreground">{macro.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{macro.category}</Badge>
                      <Badge variant="secondary">{macro.usageCount} usos</Badge>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <span className="font-medium">Template:</span>
                    <p className="mt-1 text-muted-foreground">{macro.template}</p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      Usar Macro
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketsAutomation;
