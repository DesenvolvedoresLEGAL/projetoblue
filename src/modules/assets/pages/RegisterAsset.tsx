
import React from 'react';
import { RegisterAssetForm } from './assets/register/RegisterAssetForm';
import { StandardPageHeader } from '@/components/ui/standard-page-header';
import { ArrowLeft, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const RegisterAsset = () => {

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <StandardPageHeader
              icon={PackagePlus}
              title="Cadastrar Novo Ativo"
              description="Adicione CHIPs ou equipamentos ao inventário da empresa"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/assets')}
                className="flex items-center gap-2 text-[#4D2BFB] hover:bg-[#4D2BFB]/10 font-neue-haas"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </StandardPageHeader>
      
      <RegisterAssetForm />
    </div>
  );
};

export default RegisterAsset;
