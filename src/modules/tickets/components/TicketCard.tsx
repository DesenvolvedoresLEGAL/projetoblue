import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SupportTicket } from "../services/ticketService";

// Funções auxiliares para retornar as variantes dos badges conforme prioridade e status
function getPriorityColor(priority: string): "default" | "destructive" | "warning" | "secondary" {
  switch (priority.toLowerCase()) {
    case "alta":
    case "high":
      return "destructive";
    case "média":
    case "medium":
      return "warning";
    case "baixa":
    case "low":
      return "secondary";
    default:
      return "default";
  }
}

function getStatusColor(status: string): "default" | "destructive" | "warning" | "secondary" | "success" {
  switch (status.toLowerCase()) {
    case "aberto":
    case "open":
      return "warning";
    case "em progresso":
    case "in progress":
      return "secondary";
    case "fechado":
    case "closed":
      return "success";
    case "cancelado":
      return "destructive";
    default:
      return "default";
  }
}

// Ícones simples para status (pode usar ícones do shadcn ou outra lib)
function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "aberto":
    case "open":
      return <span className="text-yellow-500">🟡</span>;
    case "em progresso":
    case "in progress":
      return <span className="text-blue-500">🔵</span>;
    case "fechado":
    case "closed":
      return <span className="text-green-500">✅</span>;
    case "cancelado":
      return <span className="text-red-500">❌</span>;
    default:
      return <span>❔</span>;
  }
}

export const TicketCard = ({ ticket }: { ticket: SupportTicket }) => (
  <Card key={ticket.id} className="border-l-4 border-l-[#4D2BFB] hover:bg-[#4D2BFB]/5 transition-colors cursor-pointer mb-4">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-[#4D2BFB] font-medium">{ticket.id}</span>
          <Badge variant={getPriorityColor(ticket.prioridade)}>{ticket.prioridade}</Badge>
          <div className="flex items-center gap-1">
            {getStatusIcon(ticket.status)}
            <Badge variant={getStatusColor(ticket.status)}>{ticket.status}</Badge>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Abrir
        </Button>
      </div>

      <h3 className="font-semibold text-[#020CBC] mb-2">{ticket.assunto}</h3>
      <p className="text-sm text-muted-foreground mb-3">Solicitante: {ticket.nome_solicitante}</p>

      <div className="flex flex-wrap gap-2">
        {ticket.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="uppercase text-xs">{tag}</Badge>
        ))}
      </div>
    </CardContent>
  </Card>
);