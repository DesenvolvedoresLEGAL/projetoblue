
import React from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StandardPageHeader } from '@/components/ui/standard-page-header';
import { StandardFiltersCard } from '@/components/ui/standard-filters-card';
import { ClientForm } from '@modules/associations/components/association/ClientForm';
import { Client } from '@/types/client';
import { useClientRegistrationState } from '@modules/clients/hooks/useClientRegistrationState';

const RegisterClient: React.FC = () => {
  const navigate = useNavigate();
  const { clearState } = useClientRegistrationState();

  const handleCancel = () => {
    // Optionally clear state on cancel - uncomment if desired
    // clearState();
    navigate(-1);
  };

  const handleSubmit = (client: Client) => {
    // State is already cleared in ClientForm after successful submission
    navigate('/clients/list');
  };

  return (
    <div className="space-y-6">
      <StandardPageHeader
        icon={Users}
        title="Cadastrar Cliente"
        description="Insira as informações do novo cliente"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#4D2BFB] hover:bg-[#4D2BFB]/10 font-neue-haas"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </StandardPageHeader>
      <StandardFiltersCard title="Dados do Cliente">
        <ClientForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </StandardFiltersCard>
    </div>
  );
};

export default RegisterClient;
