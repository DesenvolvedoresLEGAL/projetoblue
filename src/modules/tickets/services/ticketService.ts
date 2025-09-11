import api from "@/services/api";

// URL e Token - ajuste conforme necessário
const API_URL = import.meta.env.API_URL;
const API_TOKEN = import.meta.env.API_TOKEN;

// Instância Axios com token
const axiosInstance = api.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
  },
});

export interface SupportTicket {
  id: number;
  assunto: string;
  categoria: string | null;
  nome_solicitante: string;
  prioridade: string;
  status: string;
  tags: string[];
}

export const listTickets = async (): Promise<SupportTicket[]> => {
  try {
    // Monta a URL com o parâmetro lightsail
    const endpoint = `/tickets_suporte/`;

    const response = await axiosInstance.get(endpoint);

    // Retorna o array de tickets
    return response.data as SupportTicket[];
  } catch (error: any) {
    console.error("❌ Erro ao listar os tickets:", error.response?.data || error.message);
    throw error;
  }
};

// Função para criar ticket
const createTicket = async (
  ticketData: {
    nome_solicitante: string;
    email_solicitante: string;
    assunto: string;
    descricao: string;
    categoria_id?: number;
    prioridade?: string;
    status?: string;
    atendente_nome?: string;
    observacoes_internas?: string;
  },
  imageFile?: File
): Promise<any> => {
  try {
    const formData = new FormData();

    // Adiciona os dados do ticket como JSON no campo "data"
    formData.append("data", JSON.stringify(ticketData));

    // Adiciona a imagem, se fornecida
    if (imageFile) {
      formData.append("image", imageFile);
    }

    // Define a URL com ou sem o parâmetro ?lightsail=true
    const endpoint = `/tickets_suporte/`;

    // Envia a requisição
    const response = await axiosInstance.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("✅ Ticket criado com sucesso:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Erro ao criar o ticket:", error.response?.data || error.message);
    throw error;
  }
};

export default createTicket;
