import React from "react";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardPageHeader } from "@/components/ui/standard-page-header";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/useIsMobile";
import { RegisterAssetForm } from "@modules/assets/pages/assets/register";

export default function RegisterAsset() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className={`container mx-auto space-y-4 md:space-y-8 ${isMobile ? 'px-4' : ''}`}> 
      <StandardPageHeader
        icon={PackagePlus}
        title="Cadastrar Novo Ativo"
        description="Adicione CHIPs ou equipamentos ao inventário da empresa"
      >
        <Button
          variant="ghost"
          size={isMobile ? 'sm' : 'sm'}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#4D2BFB] hover:bg-[#4D2BFB]/10 font-neue-haas"
        >
          <ArrowLeft className="h-4 w-4" />
          {!isMobile && 'Voltar'}
        </Button>
      </StandardPageHeader>
      <RegisterAssetForm />
    </div>
  );
}
