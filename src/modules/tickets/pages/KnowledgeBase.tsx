
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { StandardFiltersCard } from "@/components/ui/standard-filters-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Plus, Eye, ThumbsUp, ThumbsDown, Clock, User, Star, FileText, Video, Link } from "lucide-react";

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todas as Categorias', count: 24 },
    { id: 'conectividade', name: 'Conectividade', count: 8 },
    { id: 'equipamentos', name: 'Equipamentos', count: 6 },
    { id: 'configuracao', name: 'Configuração', count: 5 },
    { id: 'troubleshooting', name: 'Solução de Problemas', count: 5 }
  ];

  const articles = [
    {
      id: 1,
      title: 'Como configurar WiFi em equipamentos da BLUE',
      summary: 'Guia passo-a-passo para configuração de rede WiFi em todos os equipamentos',
      category: 'configuracao',
      type: 'article',
      views: 1250,
      rating: 4.8,
      lastUpdate: '2024-01-10',
      author: 'João Silva',
      readTime: '5 min',
      helpful: 89,
      notHelpful: 12,
      featured: true
    },
    {
      id: 2,
      title: 'Solução para problemas de conectividade intermitente',
      summary: 'Diagnóstico e resolução de problemas de conexão que caem frequentemente',
      category: 'conectividade',
      type: 'article',
      views: 980,
      rating: 4.6,
      lastUpdate: '2024-01-08',
      author: 'Maria Santos',
      readTime: '8 min',
      helpful: 67,
      notHelpful: 8,
      featured: true
    },
    {
      id: 3,
      title: 'Configuração de SSID personalizada',
      summary: 'Como personalizar o nome da rede WiFi e configurações avançadas',
      category: 'configuracao',
      type: 'video',
      views: 756,
      rating: 4.7,
      lastUpdate: '2024-01-05',
      author: 'Pedro Costa',
      readTime: '12 min',
      helpful: 45,
      notHelpful: 3,
      featured: false
    },
    {
      id: 4,
      title: 'Guia de instalação de equipamentos BLUE',
      summary: 'Procedimentos completos para instalação física e configuração inicial',
      category: 'equipamentos',
      type: 'article',
      views: 1100,
      rating: 4.9,
      lastUpdate: '2024-01-12',
      author: 'Ana Lima',
      readTime: '15 min',
      helpful: 78,
      notHelpful: 4,
      featured: true
    },
    {
      id: 5,
      title: 'Resolução de problemas de autenticação',
      summary: 'Como resolver erros de login e autenticação em dispositivos',
      category: 'troubleshooting',
      type: 'article',
      views: 632,
      rating: 4.5,
      lastUpdate: '2024-01-03',
      author: 'Carlos Oliveira',
      readTime: '6 min',
      helpful: 56,
      notHelpful: 9,
      featured: false
    },
    {
      id: 6,
      title: 'Atualização de firmware - Procedimentos',
      summary: 'Como atualizar o firmware de equipamentos de forma segura',
      category: 'equipamentos',
      type: 'video',
      views: 445,
      rating: 4.4,
      lastUpdate: '2024-01-01',
      author: 'Fernanda Rocha',
      readTime: '10 min',
      helpful: 34,
      notHelpful: 5,
      featured: false
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'link': return <Link className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'link': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredArticles = articles.filter(article => article.featured);
  const popularArticles = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);
  const recentArticles = [...articles].sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()).slice(0, 5);

  const ArticleCard = ({ article }: { article: typeof articles[0] }) => (
    <Card className="border-[#4D2BFB]/20 hover:bg-[#4D2BFB]/5 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded ${getTypeColor(article.type)}`}>
              {getTypeIcon(article.type)}
            </div>
            {article.featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Star className="h-3 w-3 mr-1" />
                Destaque
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="h-3 w-3" />
            {article.views}
          </div>
        </div>
        
        <h3 className="font-semibold text-[#020CBC] mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.summary}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {article.author}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTime}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {article.rating}
            </div>
          </div>
          <span>{new Date(article.lastUpdate).toLocaleDateString('pt-BR')}</span>
        </div>
        
        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
          <div className="flex items-center gap-1 text-green-600">
            <ThumbsUp className="h-3 w-3" />
            <span className="text-xs">{article.helpful}</span>
          </div>
          <div className="flex items-center gap-1 text-red-600">
            <ThumbsDown className="h-3 w-3" />
            <span className="text-xs">{article.notHelpful}</span>
          </div>
          <Button variant="outline" size="sm" className="ml-auto">
            Ler Artigo
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={BookOpen}
        title="Base de Conhecimento"
        description="Acesse artigos, guias e soluções para problemas comuns"
      >
        <Button className="bg-[#4D2BFB] hover:bg-[#020CBC]">
          <Plus className="h-4 w-4 mr-2" />
          Novo Artigo
        </Button>
      </StandardPageHeader>

      <StandardFiltersCard>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artigos, guias e soluções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {categories.slice(0, 4).map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-[#4D2BFB] hover:bg-[#020CBC]" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </StandardFiltersCard>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({filteredArticles.length})</TabsTrigger>
          <TabsTrigger value="featured">Destaques ({featuredArticles.length})</TabsTrigger>
          <TabsTrigger value="popular">Populares ({popularArticles.length})</TabsTrigger>
          <TabsTrigger value="recent">Recentes ({recentArticles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="border-[#4D2BFB]/20">
                <CardHeader>
                  <CardTitle className="text-[#020CBC] font-neue-haas">
                    Todos os Artigos
                  </CardTitle>
                  <CardDescription>
                    {filteredArticles.length === articles.length 
                      ? `${articles.length} artigos disponíveis`
                      : `${filteredArticles.length} de ${articles.length} artigos`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {filteredArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                  
                  {filteredArticles.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        Nenhum artigo encontrado
                      </h3>
                      <p className="text-muted-foreground">
                        Tente ajustar os filtros ou termos de busca.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-[#4D2BFB]/20">
                <CardHeader>
                  <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className={`w-full justify-between ${
                          selectedCategory === category.id ? "bg-[#4D2BFB] hover:bg-[#020CBC]" : ""
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <span>{category.name}</span>
                        <Badge variant="secondary">{category.count}</Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#4D2BFB]/20">
                <CardHeader>
                  <CardTitle className="text-[#020CBC] font-neue-haas text-lg">Estatísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#4D2BFB]">{articles.length}</div>
                    <div className="text-sm text-muted-foreground">Artigos Totais</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#4D2BFB]">
                      {articles.reduce((sum, article) => sum + article.views, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Visualizações</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#4D2BFB]">4.6</div>
                    <div className="text-sm text-muted-foreground">Avaliação Média</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <CardTitle className="text-[#020CBC] font-neue-haas">Artigos em Destaque</CardTitle>
              <CardDescription>Conteúdo mais importante e frequentemente acessado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {featuredArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular" className="space-y-4">
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <CardTitle className="text-[#020CBC] font-neue-haas">Artigos Populares</CardTitle>
              <CardDescription>Conteúdo com maior número de visualizações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {popularArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card className="border-[#4D2BFB]/20">
            <CardHeader>
              <CardTitle className="text-[#020CBC] font-neue-haas">Artigos Recentes</CardTitle>
              <CardDescription>Conteúdo adicionado ou atualizado recentemente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recentArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgeBase;
