import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/components/ui/use-toast"
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
import { useSolutionsData } from '@modules/solutions/hooks/useSolutionsData';
import { useManufacturersData } from '@modules/manufacturers/hooks/useManufacturersData';
import { useAssetStatusesData } from '@modules/assets/hooks/useAssetStatusesData';
import { usePlansData } from '@modules/plans/hooks/usePlansData';
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
  const [assetType, setAssetType] = useState<'CHIP' | 'EQUIPMENT'>('EQUIPMENT');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { solutions, isLoading: isLoadingSolutions } = useSolutionsData();
  const { manufacturers, isLoading: isLoadingManufacturers } = useManufacturersData();
  const { assetStatuses, isLoading: isLoadingAssetStatuses } = useAssetStatusesData();
  const { plans, isLoading: isLoadingPlans } = usePlansData();

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
      toast({
        title: "Sucesso",
        description: "Ativo criado com sucesso!",
      });
      navigate('/assets');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Erro ao criar ativo.",
      });
    }
  };

  const handleSolutionChange = (solutionId: string) => {
    const newSolutionId = parseInt(solutionId);
    setSolution(newSolutionId);
    setFormData(prev => ({ ...prev, solution_id: newSolutionId }));
    
    // Determinar o tipo baseado na solução selecionada
    const selectedSol = solutions.find(s => s.id === newSolutionId);
    let newType: 'CHIP' | 'EQUIPMENT' = 'EQUIPMENT';
    
    if (selectedSol?.solution.toLowerCase().includes('chip') || 
        selectedSol?.solution.toLowerCase() === 'vivo') {
      newType = 'CHIP';
    }
    
    setAssetType(newType);
    console.log('Tipo de ativo determinado:', newType, 'para solução:', selectedSol?.solution);
  };

  const setFormData = (updater: (prevState: z.infer<typeof formSchema>) => z.infer<typeof formSchema>) => {
    form.setValue("solution_id", updater(form.getValues()).solution_id);
    form.setValue("status_id", updater(form.getValues()).status_id);
    form.setValue("manufacturer_id", updater(form.getValues()).manufacturer_id);
    form.setValue("plan_id", updater(form.getValues()).plan_id);
    form.setValue("iccid", updater(form.getValues()).iccid);
    form.setValue("line_number", updater(form.getValues()).line_number);
    form.setValue("serial_number", updater(form.getValues()).serial_number);
    form.setValue("model", updater(form.getValues()).model);
    form.setValue("admin_pass", updater(form.getValues()).admin_pass);
    form.setValue("radio", updater(form.getValues()).radio);
    form.setValue("admin_user", updater(form.getValues()).admin_user);
    form.setValue("rented_days", updater(form.getValues()).rented_days);
    form.setValue("notes", updater(form.getValues()).notes);
    form.setValue("ssid_atual", updater(form.getValues()).ssid_atual);
    form.setValue("pass_atual", updater(form.getValues()).pass_atual);
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

            <FormField
              control={form.control}
              name="plan_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plano</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {plans?.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.nome}
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
                      <Input placeholder="Número da linha" type="number" {...field} />
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
