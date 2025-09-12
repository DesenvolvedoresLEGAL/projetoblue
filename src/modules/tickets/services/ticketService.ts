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

// Interface para Categoria
export interface Category {
  id: number;
  nome: string;
  descricao: string;
}

// Função para resolver um ticket
export const resolveTicket = async (ticketId: number, ): Promise<any> => {
  try {
    const endpoint = `/tickets_suporte/${ticketId}/resolve`;

    const response = await axiosInstance.patch(endpoint);

    return response.data;
  } catch (error: any) {
    console.error(`❌ Erro ao resolver o ticket ${ticketId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Função para restaurar um ticket
export const restoreTicket = async (ticketId: number): Promise<any> => {
  try {
    const endpoint = `/tickets_suporte/${ticketId}/restore`;

    const response = await axiosInstance.patch(endpoint);

    return response.data;
  } catch (error: any) {
    console.error(`❌ Erro ao restaurar o ticket ID ${ticketId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Função para listar categorias
export const listCategories = async (): Promise<Category[]> => {
  try {
    const endpoint = `/tickets_suporte/categorias`;

    const response = await axiosInstance.get(endpoint);

    return response.data as Category[];
  } catch (error: any) {
    console.error("❌ Erro ao listar as categorias:", error.response?.data || error.message);
    throw error;
  }
};

export const listTickets = async (userid?: string): Promise<SupportTicket[]> => {
  try {
    // Monta a URL dinamicamente, adicionando uuid_solicitante só se userid existir
    let endpoint = `/tickets_suporte`;
    if (userid) {
      endpoint += `?uuid_solicitante=${encodeURIComponent(userid)}`;
    }

    const response = await axiosInstance.get(endpoint);

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
    uuid_solicitante: string;
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

    // console.log(ticketData);

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
