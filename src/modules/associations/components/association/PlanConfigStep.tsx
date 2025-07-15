
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PlanConfigStepProps {
  state: any;
  dispatch: any;
}

export const PlanConfigStep: React.FC<PlanConfigStepProps> = ({ state, dispatch }) => {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('deleted_at', null)
        .order('nome');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    }
  };

  const handlePlanChange = (value: string) => {
    const planId = parseInt(value);
    const selectedPlan = plans.find(plan => plan.id === planId);
    
    dispatch({ 
      type: 'SET_PLAN', 
      payload: { 
        planId: planId,
        planGb: selectedPlan?.tamanho_gb || state.planGb || 0
      } 
    });
  };

  const handleGbChange = (value: string) => {
    const gb = parseInt(value) || 0;
    dispatch({ 
      type: 'SET_PLAN', 
      payload: { 
        planId: state.planId,
        planGb: gb
      } 
    });
  };

  const selectedPlan = plans.find(plan => plan.id === state.planId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Configuração do Plano
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="plan-select">Plano (opcional)</Label>
            <Select value={state.planId?.toString() || ''} onValueChange={handlePlanChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um plano..." />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()}>
                    {plan.nome} {plan.tamanho_gb && `(${plan.tamanho_gb} GB)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="plan-gb">Quantidade de GB</Label>
            <Input
              id="plan-gb"
              type="number"
              min="0"
              placeholder="0"
              value={state.planGb || ''}
              onChange={(e) => handleGbChange(e.target.value)}
            />
            {selectedPlan && selectedPlan.tamanho_gb && (
              <p className="text-sm text-muted-foreground mt-1">
                Plano padrão: {selectedPlan.tamanho_gb} GB
              </p>
            )}
          </div>

          {state.planId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm">
                <strong>Plano selecionado:</strong> {selectedPlan?.nome}
              </p>
              <p className="text-sm text-muted-foreground">
                GB configurados: {state.planGb || 0} GB
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
