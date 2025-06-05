
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  Sparkles,
  MessageSquare,
  History,
  Zap,
  BookOpen,
  CircleCheck,
  CircleAlert,
  ThumbsUp,
  ThumbsDown,
  Send,
  Copy,
  Lightbulb,
  Archive,
  Bot
} from "lucide-react";

const AgentCopilot: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for AI suggestions
  const suggestions = [
    {
      id: "sugg-1",
      text: "O problema pode ser causado por interferência no sinal WiFi. Peça ao cliente para verificar se há outros dispositivos próximos que possam estar causando interferência.",
      type: "diagnostic"
    },
    {
      id: "sugg-2",
      text: "Recomendo reiniciar o roteador e esperar 2 minutos antes de reconectar os dispositivos.",
      type: "troubleshooting"
    },
    {
      id: "sugg-3",
      text: "Com base nos logs, parece que o firmware do dispositivo está desatualizado. Vamos orientar o cliente a atualizá-lo para a versão 2.1.5.",
      type: "solution"
    }
  ];

  // Mock data for conversation history
  const conversationHistory = [
    {
      id: "msg-1",
      sender: "customer",
      message: "Bom dia, estou com problemas de conectividade no meu roteador 5G. Ele conecta e desconecta a cada poucos minutos.",
      timestamp: "09:45"
    },
    {
      id: "msg-2",
      sender: "agent",
      message: "Bom dia! Lamento pelo inconveniente. Vamos resolver isso juntos. Você poderia me informar o modelo do seu roteador e há quanto tempo está enfrentando esse problema?",
      timestamp: "09:47",
      aiAssisted: true
    },
    {
      id: "msg-3",
      sender: "customer",
      message: "É um Speedy 5G-X200, comprei há cerca de 2 meses. O problema começou ontem à noite.",
      timestamp: "09:50"
    }
  ];

  // Mock data for saved responses (macros)
  const savedResponses = [
    {
      id: "macro-1",
      title: "Solicitação de informações adicionais",
      text: "Para que possamos analisar melhor o seu caso, por favor nos informe: 1) Modelo exato do dispositivo; 2) Quando o problema começou; 3) Se fez alguma alteração recente nas configurações.",
      usageCount: 234
    },
    {
      id: "macro-2",
      title: "Instrução de reset de fábrica",
      text: "Por favor, siga estas etapas para realizar um reset de fábrica:\n1. Desligue o equipamento\n2. Localize o botão de reset (geralmente um pequeno orifício na parte traseira)\n3. Pressione o botão por 10 segundos enquanto liga o dispositivo\n4. Aguarde o reinício completo\n\nAtenção: Isso apagará todas as configurações personalizadas.",
      usageCount: 187
    },
    {
      id: "macro-3",
      title: "Fechamento positivo",
      text: "Fico feliz em ter ajudado a resolver seu problema! Se precisar de qualquer outro suporte, não hesite em nos contatar. Sua satisfação é nossa prioridade. Tenha um excelente dia!",
      usageCount: 356
    }
  ];

  // Mock sentiment analysis
  const sentimentAnalysis = {
    overall: "neutral",
    trend: "improving",
    keywords: ["problema", "conectividade", "roteador", "desconecta"],
    emotions: {
      frustration: 0.45,
      concern: 0.35,
      urgency: 0.2
    }
  };

  const handleGenerateResponse = () => {
    setIsGenerating(true);
    // Simulate AI response generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-600";
      case "negative": return "text-red-600";
      case "neutral": return "text-blue-600";
      default: return "";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <ThumbsUp className="h-4 w-4" />;
      case "negative": return <ThumbsDown className="h-4 w-4" />;
      case "neutral": return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-legal-dark">Copiloto do Agente (IA)</h1>
          <p className="text-muted-foreground">
            Assistente de IA para suporte e atendimento ao cliente
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <History className="h-4 w-4 mr-2" />
            Histórico
          </Button>
          <Button variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            Configurações IA
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Ticket Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>Contexto do Ticket</span>
                  <Badge>TK-2024-001</Badge>
                </div>
                <Button variant="outline" size="sm">
                  Ver Ticket Completo
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Cliente</p>
                    <p className="text-sm">João Silva (Empresa XYZ)</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Assunto</p>
                    <p className="text-sm">Problema de conectividade com roteador 5G</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Prioridade / Status</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-orange-600">Alta</Badge>
                      <Badge variant="outline" className="text-blue-600">Aberto</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Dispositivo</p>
                    <p className="text-sm">Speedy 5G-X200 (SN: 123456789)</p>
                  </div>
                </div>

                {/* Conversation History */}
                <div className="space-y-3 mt-4">
                  <h3 className="text-sm font-medium">Histórico da Conversa</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {conversationHistory.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`p-3 rounded-lg text-sm ${
                          msg.sender === 'customer' 
                            ? 'bg-gray-100 border-l-4 border-gray-300' 
                            : 'bg-blue-50 border-l-4 border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium">
                            {msg.sender === 'customer' ? 'Cliente' : 'Agente'}
                            {msg.aiAssisted && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                <Bot className="h-3 w-3 mr-1" />
                                AI Assistida
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{msg.timestamp}</div>
                        </div>
                        <p>{msg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Response Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Gerador de Respostas com IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea 
                  placeholder="Descreva o que você precisa, por exemplo: 'Gere uma resposta explicando como resolver o problema de conexão intermitente do cliente'"
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />

                <div className="flex justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span>A IA analisará o contexto do ticket e o histórico de conversas</span>
                  </div>
                  <Button 
                    onClick={handleGenerateResponse}
                    disabled={!prompt || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="spinner h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Gerar Resposta
                      </>
                    )}
                  </Button>
                </div>

                {/* AI Suggestions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Sugestões da IA</h3>
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {suggestion.type === 'diagnostic' && (
                              <Badge variant="outline" className="text-blue-600">
                                Diagnóstico
                              </Badge>
                            )}
                            {suggestion.type === 'troubleshooting' && (
                              <Badge variant="outline" className="text-orange-600">
                                Troubleshooting
                              </Badge>
                            )}
                            {suggestion.type === 'solution' && (
                              <Badge variant="outline" className="text-green-600">
                                Solução
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{suggestion.text}</p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sentiment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-5 w-5" />
                Análise de Sentimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sentimento Geral:</span>
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 ${getSentimentColor(sentimentAnalysis.overall)}`}
                  >
                    {getSentimentIcon(sentimentAnalysis.overall)}
                    {sentimentAnalysis.overall.capitalize()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tendência:</span>
                  <Badge 
                    variant={sentimentAnalysis.trend === "improving" ? "secondary" : "outline"}
                  >
                    {sentimentAnalysis.trend === "improving" ? "Melhorando" : 
                     sentimentAnalysis.trend === "declining" ? "Piorando" : "Estável"}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm mb-2">Emoções Detectadas:</p>
                  <div className="space-y-2">
                    {Object.entries(sentimentAnalysis.emotions).map(([emotion, value]) => (
                      <div key={emotion} className="flex items-center">
                        <span className="text-xs w-24">{emotion.capitalize()}:</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              emotion === "frustration" ? "bg-red-400" :
                              emotion === "concern" ? "bg-orange-400" :
                              "bg-blue-400"
                            }`}
                            style={{ width: `${value * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs ml-2">{Math.round(value * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm mb-2">Palavras-chave:</p>
                  <div className="flex flex-wrap gap-1">
                    {sentimentAnalysis.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Knowledge Base Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-5 w-5" />
                Artigos Relacionados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                <CircleCheck className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Troubleshooting de Conectividade 5G</p>
                  <p className="text-xs text-muted-foreground">Guia completo para resolução de problemas</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                <CircleCheck className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Atualização de Firmware Speedy 5G-X200</p>
                  <p className="text-xs text-muted-foreground">Passo a passo para atualizar</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                <CircleAlert className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Problemas Conhecidos Versão 2.1.4</p>
                  <p className="text-xs text-muted-foreground">Falhas reportadas e soluções</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Responses / Macros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Archive className="h-5 w-5" />
                Respostas Salvas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar macros..."
                  className="pl-10"
                />
              </div>
              
              {savedResponses.map((response) => (
                <div 
                  key={response.id}
                  className="p-2 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{response.title}</p>
                    <Badge variant="outline" className="text-xs">
                      {response.usageCount}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {response.text.substring(0, 60)}...
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentCopilot;
