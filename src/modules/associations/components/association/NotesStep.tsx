
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface NotesStepProps {
  state: any;
  dispatch: any;
}

export const NotesStep: React.FC<NotesStepProps> = ({ state, dispatch }) => {
  const handleNotesChange = (value: string) => {
    dispatch({ type: 'SET_NOTES', payload: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Observações Adicionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Digite observações relevantes sobre esta associação..."
              value={state.notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={5}
              className="mt-2"
            />
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
            <p className="text-sm text-muted-foreground">
              Use este campo para registrar informações importantes como:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 list-disc list-inside space-y-1">
              <li>Detalhes específicos do cliente</li>
              <li>Configurações especiais necessárias</li>
              <li>Observações sobre instalação ou entrega</li>
              <li>Contatos adicionais ou instruções</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
