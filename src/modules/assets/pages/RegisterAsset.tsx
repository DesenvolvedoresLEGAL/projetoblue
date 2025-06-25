
import React from 'react';
import RegisterAssetForm from './assets/register/RegisterAssetForm';

const RegisterAsset = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registrar Ativo</h1>
        <p className="text-muted-foreground">
          Registre um novo ativo no sistema
        </p>
      </div>
      
      <RegisterAssetForm />
    </div>
  );
};

export default RegisterAsset;
