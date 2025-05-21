
import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, Upload } from "lucide-react";

const AssetsHeader = () => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight">Inventário de Ativos</h1>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Importar
        </Button>
        <Button size="sm">
          <PlusCircle className="w-4 h-4 mr-2" />
          <a href="/assets/register">Novo Ativo</a>
        </Button>
      </div>
    </div>
  );
};

export default AssetsHeader;
