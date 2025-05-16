
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Link as LinkIcon, PackageSearch } from "lucide-react";

export function QuickActionButtons() {
  const navigate = useNavigate();
  
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 border-dashed text-[#4D2BFB] hover:text-white" onClick={() => navigate('/assets/register')}>
          <PlusCircle className="h-6 w-6" />
          <div className="text-sm font-medium">Cadastrar Novo Ativo</div>
        </Button>

        <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 border-dashed text-[#4D2BFB] hover:text-white" onClick={() => navigate('/link-asset')}>
          <LinkIcon className="h-6 w-6" />
          <div className="text-sm font-medium">Vincular Ativo a Cliente</div>
        </Button>

        <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2 border-dashed text-[#4D2BFB] hover:text-white" onClick={() => navigate('/assets/inventory')}>
          <PackageSearch className="h-6 w-6" />
          <div className="text-sm font-medium">Ver Inventário Completo</div>
        </Button>
      </CardContent>
    </Card>
  );
}
