
import React from 'react';
import { AlertTriangle, RefreshCw, Home, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AssetsErrorProps {
  error: Error;
  refetch: () => void;
}

const AssetsError = ({ error, refetch }: AssetsErrorProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-legal-primary/5 p-6">
      <div className="container mx-auto max-w-2xl">
        <Card className="border-red-200 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Ícone de Erro */}
              <div className="flex items-center justify-center">
                <div className="p-4 bg-red-100 rounded-full">
                  <AlertTriangle className="h-12 w-12 text-red-600" />
                </div>
              </div>

              {/* Título */}
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-legal-dark font-neue-haas">
                  Ops! Algo deu errado
                </h1>
                <p className="text-legal-primary font-bold font-neue-haas text-lg">
                  Não foi possível carregar o inventário
                </p>
              </div>

              {/* Descrição do Erro */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-800 font-neue-haas mb-2 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Detalhes do Problema:
                </h3>
                <p className="text-red-700 text-sm font-neue-haas break-words">
                  {error.message || 'Erro desconhecido ao carregar os dados'}
                </p>
              </div>

              {/* Sugestões */}
              <div className="bg-legal-primary/5 border border-legal-primary/20 rounded-lg p-4">
                <h3 className="font-bold text-legal-dark font-neue-haas mb-3">
                  💡 O que você pode fazer:
                </h3>
                <ul className="text-left space-y-2 text-sm text-gray-700 font-neue-haas">
                  <li className="flex items-start gap-2">
                    <span className="text-legal-primary">•</span>
                    Verifique sua conexão com a internet
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-legal-primary">•</span>
                    Tente recarregar a página usando o botão abaixo
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-legal-primary">•</span>
                    Se o problema persistir, entre em contato com o suporte
                  </li>
                </ul>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={refetch}
                  className="bg-legal-primary hover:bg-legal-dark text-white font-bold font-neue-haas transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="border-legal-secondary text-legal-secondary hover:bg-legal-secondary hover:text-white font-bold font-neue-haas transition-all duration-200 flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Voltar ao Início
                </Button>
              </div>

              {/* Informações de Suporte */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 font-neue-haas">
                  Se você continuar enfrentando problemas, nossa equipe de suporte está pronta para ajudar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetsError;
