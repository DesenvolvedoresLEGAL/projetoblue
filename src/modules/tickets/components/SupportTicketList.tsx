import { useEffect, useState } from "react";
import { listTickets, SupportTicket } from "../services/ticketService";
import { TicketCard } from "./TicketCard";
import { useAuth } from "@/context/AuthContext";

export default function SupportTicketsList() {
  const {user, hasMinimumRole} = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true);
        const userId = user.id;
        if (hasMinimumRole("suporte")) {
          const data = await listTickets();
          setTickets(data);
        } else {
          const data = await listTickets(userId);
          setTickets(data);
        }
      } catch (err) {
        setError("Não foram encontrados tickets para o usuário");
        if (hasMinimumRole("suporte"))
          setError("Erro ao buscar tickets para o usuário");
      } finally {
        setLoading(false);
      }
    }

    fetchTickets();
  }, []);

  if (loading) return <p className="text-center py-10">Carregando tickets...</p>;
  if (error) return <p className="text-center py-10 text-red-600">{error}</p>;
  if (tickets.length === 0) return <p className="text-center py-10">Nenhum ticket encontrado.</p>;

  return (
    <div className="max-w-full mx-auto p-4">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}