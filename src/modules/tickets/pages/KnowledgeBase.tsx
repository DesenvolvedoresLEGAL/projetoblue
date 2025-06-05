
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  BookOpen,
  Star,
  ThumbsUp,
  Eye,
  Plus,
  Filter,
  TrendingUp
} from "lucide-react";

const KnowledgeBase: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock data - replace with actual API calls
  const categories = [
    { id: "all", name: "Todos", count: 24 },
    { id: "connectivity", name: "Conectividade", count: 8 },
    { id: "devices", name: "Dispositivos", count: 6 },
    { id: "billing", name: "Faturamento", count: 4 },
    { id: "troubleshooting", name: "Solução de Problemas", count: 6 }
  ];

  const featuredArticles = [
    {
      id: "1",
      title: "Como configurar rede WiFi empresarial",
      summary: "Guia completo para configuração de redes WiFi em ambiente corporativo",
      category: "Conectividade",
      views: 2341,
      likes: 89,
      rating: 4.8,
      featured: true,
      tags: ["wifi", "configuração", "empresa"]
    },
    {
      id: "2",
      title: "Troubleshooting de problemas de conectividade",
      summary: "Passo a passo para diagnosticar e resolver problemas de conexão",
      category: "Solução de Problemas",
      views: 1876,
      likes: 67,
      rating: 4.6,
      featured: true,
      tags: ["troubleshooting", "conectividade", "diagnóstico"]
    },
    {
      id: "3",
      title: "Configuração de APN para dispositivos móveis",
      summary: "Como configurar corretamente as configurações APN",
      category: "Dispositivos",
      views: 1523,
      likes: 45,
      rating: 4.7,
      featured: true,
      tags: ["apn", "móvel", "configuração"]
    }
  ];

  const popularArticles = [
    {
      id: "4",
      title: "Reset de fábrica em roteadores",
      category: "Dispositivos",
      views: 987,
      likes: 34,
      rating: 4.5
    },
    {
      id: "5", 
      title: "Como interpretar relatórios de consumo",
      category: "Faturamento",
      views: 756,
      likes: 28,
      rating: 4.3
    },
    {
      id: "6",
      title: "Configuração de firewall básico",
      category: "Conectividade",
      views: 654,
      likes: 22,
      rating: 4.4
    }
  ];

  const recentArticles = [
    {
      id: "7",
      title: "Atualização de firmware para dispositivos 5G",
      category: "Dispositivos",
      publishedAt: "2024-01-15",
      author: "Maria Santos",
      isNew: true
    },
    {
      id: "8",
      title: "Novos recursos do painel administrativo",
      category: "Conectividade", 
      publishedAt: "2024-01-12",
      author: "Pedro Lima",
      isNew: true
    }
  ];

  const filteredArticles = selectedCategory === "all" 
    ? [...featuredArticles, ...popularArticles]
    : [...featuredArticles, ...popularArticles].filter(
        article => article.category.toLowerCase() === categories.find(c => c.id === selectedCategory)?.name.toLowerCase()
      );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-legal-dark">Base de Conhecimento</h1>
          <p className="text-muted-foreground">
            Artigos e guias para ajudar clientes e agentes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Artigo
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar artigos, guias, FAQs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Categorias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span>{category.name}</span>
                  <Badge variant="secondary">{category.count}</Badge>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Total de Artigos</span>
                <Badge variant="secondary">24</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Visualizações Hoje</span>
                <Badge variant="secondary">1,234</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avaliação Média</span>
                <Badge variant="secondary">4.6/5</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Featured Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Artigos em Destaque
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredArticles.map((article) => (
                <div 
                  key={article.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {article.summary}
                      </p>
                    </div>
                    <Badge variant="outline">{article.category}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {article.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {article.rating}
                    </div>
                  </div>

                  <div className="flex gap-1 mt-3">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Popular Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Artigos Populares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularArticles.map((article) => (
                  <div 
                    key={article.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <h4 className="font-medium">{article.title}</h4>
                      <p className="text-sm text-muted-foreground">{article.category}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {article.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {article.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Articles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Artigos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentArticles.map((article) => (
                  <div 
                    key={article.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{article.title}</h4>
                        {article.isNew && (
                          <Badge variant="secondary" className="text-xs">
                            Novo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {article.category} • Por {article.author}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(article.publishedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;
