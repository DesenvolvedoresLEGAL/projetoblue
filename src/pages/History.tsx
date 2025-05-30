
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function History() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/assets');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#020CBC]">Histórico de Ativos</h1>
          <p className="text-muted-foreground mt-1">
            Visualize o histórico completo de movimentações dos ativos
          </p>
        </div>
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-[#4D2BFB] hover:bg-[#4D2BFB]/10 rounded-lg transition-colors"
          title="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Movimentações</CardTitle>
          <CardDescription>
            Aqui será exibido o histórico detalhado de todas as movimentações dos ativos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Funcionalidade em desenvolvimento
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
