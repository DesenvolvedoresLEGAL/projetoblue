import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from "@/utils/toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAssetSolutions, useManufacturers, useStatusRecords } from '@modules/assets/hooks/useAssetManagement';
import { CreateAssetData } from '@modules/assets/services/asset/types';
import { assetService } from '@modules/assets/services/assetService';
import { AssetType } from '@/types/asset';

const formSchema = z.object({
  solution_id: z.string().min(1, {
    message: "Selecione uma solução.",
  }),
  status_id: z.string().min(1, {
    message: "Selecione um status.",
  }),
  manufacturer_id: z.string().optional(),
  plan_id: z.string().optional(),
  iccid: z.string().optional(),
  line_number: z.string().optional(),
  serial_number: z.string().optional(),
  model: z.string().optional(),
  admin_pass: z.string().optional(),
  radio: z.string().optional(),
  admin_user: z.string().optional(),
  rented_days: z.string().optional(),
  notes: z.string().optional(),
  ssid_atual: z.string().optional(),
  pass_atual: z.string().optional(),
});

const RegisterAssetForm: React.FC = () => {
  const [solution, setSolution] = useState<number | null>(null);
  const [assetType, setAssetType] = useState<'CHIP' | 'ROTEADOR'>('ROTEADOR');
  const navigate = useNavigate();
  const { data: solutions, isLoading: isLoadingSolutions } = useAssetSolutions();
  const { data: manufacturers, isLoading: isLoadingManufacturers } = useManufacturers();
  const { data: assetStatuses, isLoading: isLoadingAssetStatuses } = useStatusRecords();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      solution_id: "",
      status_id: "",
      manufacturer_id: "",
      plan_id: "",
      iccid: "",
      line_number: "",
      serial_number: "",
      model: "",
      admin_pass: "",
      radio: "",
      admin_user: "",
      rented_days: "0",
      notes: "",
      ssid_atual: "",
      pass_atual: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const assetData: CreateAssetData = {
        solution_id: parseInt(values.solution_id),
        status_id: parseInt(values.status_id),
        manufacturer_id: values.manufacturer_id ? parseInt(values.manufacturer_id) : undefined,
        plan_id: values.plan_id ? parseInt(values.plan_id) : undefined,
        iccid: values.iccid,
        line_number: values.line_number ? parseInt(values.line_number) : undefined,
        serial_number: values.serial_number,
        model: values.model,
        admin_pass: values.admin_pass,
        radio: values.radio,
        admin_user: values.admin_user,
        rented_days: values.rented_days ? parseInt(values.rented_days) : 0,
        notes: values.notes,
        ssid_atual: values.ssid_atual,
        pass_atual: values.pass_atual,
      };

      await assetService.createAsset(assetData);
      toast.success('Ativo criado com sucesso!');
      navigate('/assets');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar ativo.');
    }
  };

  const handleSolutionChange = (solutionId: string) => {
    const newSolutionId = parseInt(solutionId);
    setSolution(newSolutionId);
    
    // Determinar o tipo baseado na solução selecionada
    const selectedSol = solutions?.find(s => s.id === newSolutionId);
    let newType: 'CHIP' | 'ROTEADOR' = 'ROTEADOR';
    
    if (selectedSol?.solution.toLowerCase().includes('chip') || 
        selectedSol?.solution.toLowerCase() === 'vivo') {
      newType = 'CHIP';
    }
    
    setAssetType(newType);
    console.log('Tipo de ativo determinado:', newType, 'para solução:', selectedSol?.solution);
  };

  return (
    <div className="container mx-auto py-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="solution_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solução</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    handleSolutionChange(value);
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma solução" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {solutions?.map((solution) => (
                        <SelectItem key={solution.id} value={solution.id.toString()}>
                          {solution.solution}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assetStatuses?.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {status.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manufacturer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabricante</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um fabricante" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {manufacturers?.map((manufacturer) => (
                        <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                          {manufacturer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {assetType === 'CHIP' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="iccid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ICCID</FormLabel>
                    <FormControl>
                      <Input placeholder="ICCID do chip" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="line_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Linha</FormLabel>
                    <FormControl>
                      <Input placeholder="Número da linha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serial_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Série</FormLabel>
                    <FormControl>
                      <Input placeholder="Número de série" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="radio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rádio</FormLabel>
                    <FormControl>
                      <Input placeholder="Rádio" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Modelo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="admin_user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuário Admin</FormLabel>
                  <FormControl>
                    <Input placeholder="Usuário administrador" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="admin_pass"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha Admin</FormLabel>
                  <FormControl>
                    <Input placeholder="Senha administrador" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rented_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias Alugados</FormLabel>
                  <FormControl>
                    <Input placeholder="Dias alugados" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ssid_atual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SSID Atual</FormLabel>
                  <FormControl>
                    <Input placeholder="SSID atual" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pass_atual"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha Atual</FormLabel>
                  <FormControl>
                    <Input placeholder="Senha atual" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observações sobre o ativo"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Cadastrar Ativo</Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterAssetForm;
