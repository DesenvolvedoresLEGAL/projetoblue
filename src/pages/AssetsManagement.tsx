
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, LinkIcon, History, List } from "lucide-react";

const AssetsManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Gestão de Ativos
        </h1>
        <p className="text-muted-foreground">
          Gerencie o cadastro, associação e histórico de ativos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {/* Card Registrar Ativo */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
          onClick={() => navigate('/assets/register')}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <PlusCircle className="h-6 w-6 text-primary" />
              <CardTitle>Registrar Ativo</CardTitle>
            </div>
            <CardDescription>
              Cadastre novos chips e equipamentos no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col flex-1'>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione chips (cartões SIM) e equipamentos (roteadores, switches, etc.)
              ao inventário com todas as informações necessárias.
            </p>
            <Button className="w-full" onClick={() => navigate('/assets/register')}>
              Registrar Novo Ativo
            </Button>
          </CardContent>
        </Card>

        {/* Card Associar Ativo */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
          onClick={() => navigate('/assets/associations')}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <LinkIcon className="h-6 w-6 text-primary" />
              <CardTitle>Associar Ativo</CardTitle>
            </div>
            <CardDescription>
              Vincule ativos existentes a clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie as associações entre ativos e clientes,
              controlando alocações e devoluções.
            </p>           
              <Button className="mt-auto w-full" onClick={() => navigate('/assets/history')}>
              Gerenciar Associações
            </Button>
          </CardContent>
        </Card>

        {/* Card Associar Ativo */}
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
          onClick={() => navigate('/assets/associations-list')}
        >
          <CardHeader>
            <div className="flex items-center space-x-2">
              <List className="h-6 w-6 text-primary" />
              <CardTitle>Listar associações</CardTitle>
            </div>
            <CardDescription>
              Liste clientes e associações.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie as associações entre ativos e clientes,
              controlando alocações e devoluções.
            </p>           
              <Button className="mt-auto w-full" onClick={() => navigate('/assets/history')}>
              Ver Lista de Associações
            </Button>
          </CardContent>
        </Card>

        {/* Card Histórico de Alterações - NOVO */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
          onClick={() => navigate('/assets/history')}>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <History className="h-6 w-6 text-primary" />
              <CardTitle>Histórico de Alterações</CardTitle>
            </div>
            <CardDescription>
              Visualize o histórico completo de movimentações
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col flex-1'>
            <p className="text-sm text-muted-foreground mb-4">
              Acompanhe todas as alterações, associações e mudanças de status
              dos ativos registrados no sistema.
            </p>
            <Button className="mt-auto w-full" onClick={() => navigate('/assets/history')}>
              Ver Histórico Completo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informações adicionais
      <div className="bg-muted/50 rounded-lg p-6 max-w-6xl">
        <h3 className="font-semibold mb-2">Fluxo de Gestão de Ativos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div>
            <h4 className="font-medium text-foreground mb-1">1. Registrar</h4>
            <p>Cadastre novos ativos (chips ou equipamentos) no sistema com todas as informações técnicas necessárias.</p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">2. Associar</h4>
            <p>Vincule os ativos cadastrados aos clientes conforme necessário para controle de alocação.</p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">3. Acompanhar</h4>
            <p>Monitore o histórico completo de movimentações e alterações dos ativos através do histórico detalhado.</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default AssetsManagement;
