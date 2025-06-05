
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  Target,
  Download,
  Calendar,
  Activity
} from "lucide-react";

const TicketsAnalytics: React.FC = () => {
  // Mock data - replace with actual API calls
  const kpis = {
    totalTickets: 1247,
    solvedTickets: 956,
    avgResolutionTime: "2h 15m",
    firstResponseTime: "45m",
    satisfactionScore: 4.7,
    slaCompliance: 94.2,
    agentUtilization: 87.5,
    escalationRate: 12.3
  };

  const ticketsByStatus = [
    { status: "Novo", count: 23, percentage: 18.4 },
    { status: "Aberto", count: 45, percentage: 36.0 },
    { status: "Pendente", count: 18, percentage: 14.4 },
    { status: "Resolvido", count: 32, percentage: 25.6 },
    { status: "Fechado", count: 7, percentage: 5.6 }
  ];

  const ticketsByPriority = [
    { priority: "Baixa", count: 356, percentage: 28.5 },
    { priority: "Normal", count: 623, percentage: 49.9 },
    { priority: "Alta", count: 189, percentage: 15.2 },
    { priority: "Urgente", count: 79, percentage: 6.3 }
  ];

  const ticketsByChannel = [
    { channel: "Email", count: 487, percentage: 39.1 },
    { channel: "Chat", count: 298, percentage: 23.9 },
    { channel: "WhatsApp", count: 234, percentage: 18.8 },
    { channel: "Web", count: 156, percentage: 12.5 },
    { channel: "Telefone", count: 72, percentage: 5.8 }
  ];

  const agentPerformance = [
    { agent: "Maria Santos", tickets: 89, avgTime: "1h 45m", satisfaction: 4.8, sla: 96.2 },
    { agent: "Pedro Lima", tickets: 76, avgTime: "2h 12m", satisfaction: 4.6, sla: 94.7 },
    { agent: "Lucia Fernandes", tickets: 67, avgTime: "1h 58m", satisfaction: 4.9, sla: 97.1 },
    { agent: "Carlos Silva", tickets: 54, avgTime: "2h 34m", satisfaction: 4.4, sla: 91.8 }
  ];

  const topCategories = [
    { category: "Conectividade", count: 234, trend: "+12%" },
    { category: "Configuração", count: 189, trend: "+8%" },
    { category: "Billing", count: 156, trend: "-5%" },
    { category: "Hardware", count: 123, trend: "+15%" },
    { category: "Software", count: 98, trend: "+3%" }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-legal-dark">Análises & Relatórios</h1>
          <p className="text-muted-foreground">
            Métricas de desempenho e insights de suporte
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Período
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.totalTickets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((kpis.solvedTickets / kpis.totalTickets) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {kpis.solvedTickets} de {kpis.totalTickets} tickets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgResolutionTime}</div>
            <p className="text-xs text-muted-foreground">
              Primeira resposta: {kpis.firstResponseTime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.satisfactionScore}/5</div>
            <p className="text-xs text-muted-foreground">
              SLA: {kpis.slaCompliance}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tickets by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Tickets por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticketsByStatus.map((item) => (
                    <div key={item.status} className="flex items-center">
                      <div className="w-28">
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                          <div 
                            className={`h-full ${
                              item.status === "Novo" ? "bg-purple-500" :
                              item.status === "Aberto" ? "bg-blue-500" :
                              item.status === "Pendente" ? "bg-yellow-500" :
                              item.status === "Resolvido" ? "bg-green-500" :
                              "bg-gray-500"
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.count}</div>
                        <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tickets by Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Tickets por Prioridade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticketsByPriority.map((item) => (
                    <div key={item.priority} className="flex items-center">
                      <div className="w-28">
                        <Badge 
                          variant="outline"
                          className={
                            item.priority === "Baixa" ? "text-green-600 border-green-200" :
                            item.priority === "Normal" ? "text-blue-600 border-blue-200" :
                            item.priority === "Alta" ? "text-orange-600 border-orange-200" :
                            "text-red-600 border-red-200"
                          }
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                          <div 
                            className={
                              item.priority === "Baixa" ? "h-full bg-green-500" :
                              item.priority === "Normal" ? "h-full bg-blue-500" :
                              item.priority === "Alta" ? "h-full bg-orange-500" :
                              "h-full bg-red-500"
                            }
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.count}</div>
                        <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Channel Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Tickets por Canal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticketsByChannel.map((item) => (
                    <div key={item.channel} className="flex items-center">
                      <div className="w-28">
                        <span className="text-sm font-medium">{item.channel}</span>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                          <div 
                            className="h-full bg-[#4d2bfb]"
                            style={{ 
                              width: `${item.percentage}%`,
                              opacity: 0.2 + (item.percentage / 100) * 0.8
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.count}</div>
                        <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas Adicionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Utilização de Agentes</span>
                    <Badge variant="outline">{kpis.agentUtilization}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taxa de Escalação</span>
                    <Badge variant="outline">{kpis.escalationRate}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conformidade SLA</span>
                    <Badge variant="outline">{kpis.slaCompliance}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Satisfação do Cliente</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg 
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(kpis.satisfactionScore) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Performance dos Agentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Agente</th>
                      <th className="text-center p-3">Tickets</th>
                      <th className="text-center p-3">Tempo Médio</th>
                      <th className="text-center p-3">Satisfação</th>
                      <th className="text-center p-3">SLA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentPerformance.map((agent) => (
                      <tr key={agent.agent} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{agent.agent}</div>
                        </td>
                        <td className="p-3 text-center">{agent.tickets}</td>
                        <td className="p-3 text-center">{agent.avgTime}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center">
                            <span className="mr-1">{agent.satisfaction}</span>
                            <svg 
                              className="w-4 h-4 text-yellow-400 fill-yellow-400"
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge 
                            variant="outline" 
                            className={agent.sla >= 95 ? "text-green-600" : "text-orange-600"}
                          >
                            {agent.sla}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Tendências e Padrões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-6">
                <p>Os gráficos e análises de tendências mostrariam padrões de tickets ao longo do tempo.</p>
                <p className="mt-2">(Componente de visualização de dados seria implementado aqui)</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Insights</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Aumento de 23% em tickets relacionados a conectividade 5G</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-red-500 transform rotate-180 mt-0.5" />
                      <span>Queda de 12% em problemas de billing após nova atualização</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                      <span>Redução de 18% no tempo de resposta médio</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Previsões</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                      <span>Esperado aumento de tickets após lançamento de novo produto</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>Meta de SLA para o próximo trimestre: 96%</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCategories.map((category, index) => (
                  <div key={category.category} className="flex items-center">
                    <div className="w-10 text-right pr-3">
                      <span className="text-muted-foreground">#{index + 1}</span>
                    </div>
                    <div className="w-32">
                      <span className="font-medium">{category.category}</span>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                        <div 
                          className="h-full bg-[#4d2bfb]"
                          style={{ 
                            width: `${(category.count / topCategories[0].count) * 100}%`,
                            opacity: 0.5 + ((index + 1) / topCategories.length) * 0.5
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-right">
                      <div className="text-sm font-medium">{category.count}</div>
                    </div>
                    <div className="w-16 text-right">
                      <Badge 
                        variant="outline" 
                        className={category.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}
                      >
                        {category.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Diagnóstico de Problemas Comuns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Análise de problemas recorrentes e sugestões de resolução com base em dados históricos.
                </p>
                
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Conectividade Intermitente</div>
                    <div className="text-sm text-muted-foreground">
                      Causa raiz frequente: Interferência no canal WiFi
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span>234 tickets relacionados</span>
                      <Badge variant="outline">85% taxa de resolução</Badge>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Erro de Configuração APN</div>
                    <div className="text-sm text-muted-foreground">
                      Causa raiz frequente: Configuração manual incorreta
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span>156 tickets relacionados</span>
                      <Badge variant="outline">92% taxa de resolução</Badge>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Dúvidas sobre Cobrança</div>
                    <div className="text-sm text-muted-foreground">
                      Causa raiz frequente: Falta de clareza nas descrições de serviço
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span>132 tickets relacionados</span>
                      <Badge variant="outline">78% taxa de resolução</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketsAnalytics;
