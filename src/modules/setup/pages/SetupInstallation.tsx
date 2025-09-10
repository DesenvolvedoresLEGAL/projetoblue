import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InstallationStepper } from '../components/InstallationStepper';
import { useSetupDetails } from '../hooks/useSetupData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const SetupInstallation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: setup, isLoading, error } = useSetupDetails(id!);

  const handleComplete = () => {
    navigate('/setup');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !setup) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/setup')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Setup não encontrado</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Não foi possível carregar os dados do setup.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <InstallationStepper 
      setup={setup} 
      onComplete={handleComplete}
    />
  );
};