import { Button } from '@/components/ui/button';
import { FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import createTicket from '@modules/tickets/services/ticketService'; // Ajuste o path conforme sua estrutura
import React, { useState } from 'react';

const TicketForm: React.FC = () => {
    const [formData, setFormData] = useState({
        nome_solicitante: '',
        email_solicitante: '',
        assunto: '',
        descricao: '',
        categoria_id: '',
        prioridade: 'media',
        status: 'aberto',
        atendente_nome: '',
        observacoes_internas: ''
    });

    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImage(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            // Conversão de categoria_id para número ou undefined
            const ticketData = {
                ...formData,
                categoria_id: formData.categoria_id ? Number(formData.categoria_id) : undefined
            };

            const response = await createTicket(ticketData, image);
            setMessage(`Ticket criado com sucesso! ID: ${response.ticket_id}`);
            setFormData({
                nome_solicitante: '',
                email_solicitante: '',
                assunto: '',
                descricao: '',
                categoria_id: '',
                prioridade: 'media',
                status: 'aberto',
                atendente_nome: '',
                observacoes_internas: ''
            });
            setImage(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao criar ticket.');
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Criar Novo Ticket</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Nome do Solicitante */}
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Solicitante*</label>
          <Input
            type="text"
            name="nome_solicitante"
            value={formData.nome_solicitante}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email do Solicitante */}
        <div>
          <label className="block text-sm font-medium mb-1">Email do Solicitante*</label>
          <Input
            type="email"
            name="email_solicitante"
            value={formData.email_solicitante}
            onChange={handleChange}
            required
          />
        </div>

        {/* Assunto */}
        <div>
          <label className="block text-sm font-medium mb-1">Assunto*</label>
          <Input
            type="text"
            name="assunto"
            value={formData.assunto}
            onChange={handleChange}
            required
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium mb-1">Descrição*</label>
          <Textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            required
          />
        </div>

        {/* Categoria ID */}
        <div>
          <label className="block text-sm font-medium mb-1">Categoria ID</label>
          <Input
            type="number"
            name="categoria_id"
            value={formData.categoria_id}
            onChange={handleChange}
          />
        </div>

        {/* Prioridade */}
        <div>
          <label className="block text-sm font-medium mb-1">Prioridade</label>
          <Select
            value={formData.prioridade}
            onValueChange={(value) => handleChange({ target: { name: "prioridade", value } } as React.ChangeEvent<HTMLInputElement>) }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange({ target: { name: "prioridade", value } } as React.ChangeEvent<HTMLInputElement>) }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aberto">Aberto</SelectItem>
              <SelectItem value="em andamento">Em andamento</SelectItem>
              <SelectItem value="fechado">Fechado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Atendente */}
        <div>
          <label className="block text-sm font-medium mb-1">Atendente (opcional)</label>
          <Input
            type="text"
            name="atendente_nome"
            value={formData.atendente_nome}
            onChange={handleChange}
          />
        </div>

        {/* Observações Internas */}
        <div>
          <label className="block text-sm font-medium mb-1">Observações Internas</label>
          <Textarea
            name="observacoes_internas"
            value={formData.observacoes_internas}
            onChange={handleChange}
          />
        </div>

        {/* Anexo */}
        <div>
          <label className="block text-sm font-medium mb-1">Anexo (imagem)</label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {/* Botão */}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Enviando..." : "Criar Ticket"}
        </Button>

        {/* Mensagens */}
        {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default TicketForm;
