
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useReferrals } from '../hooks/useBits';

interface ReferralFormData {
  referred_name: string;
  referred_email: string;
  referred_phone?: string;
  referred_company?: string;
}

interface ReferralFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const ReferralForm: React.FC<ReferralFormProps> = ({ onSuccess, className = '' }) => {
  const { createReferral, isCreating } = useReferrals();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReferralFormData>();

  const onSubmit = async (data: ReferralFormData) => {
    createReferral(data, {
      onSuccess: () => {
        reset();
        if (onSuccess) onSuccess();
      }
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Indicar um amigo</CardTitle>
        <CardDescription>
          Indique um amigo para usar nossos serviços e ganhe pontos quando ele se tornar cliente.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="referred_name">Nome completo</Label>
            <Input 
              id="referred_name"
              placeholder="Nome da pessoa indicada"
              {...register('referred_name', { required: 'Nome é obrigatório' })}
            />
            {errors.referred_name && (
              <span className="text-sm text-red-500">{errors.referred_name.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referred_email">Email</Label>
            <Input
              id="referred_email"
              type="email"
              placeholder="email@exemplo.com"
              {...register('referred_email', { 
                required: 'Email é obrigatório',
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Email inválido'
                }
              })}
            />
            {errors.referred_email && (
              <span className="text-sm text-red-500">{errors.referred_email.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referred_phone">Telefone (opcional)</Label>
            <Input
              id="referred_phone"
              placeholder="(00) 00000-0000"
              {...register('referred_phone')}
            />
            {errors.referred_phone && (
              <span className="text-sm text-red-500">{errors.referred_phone.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referred_company">Empresa (opcional)</Label>
            <Input
              id="referred_company"
              placeholder="Nome da empresa"
              {...register('referred_company')}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Enviando...' : 'Enviar indicação'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
