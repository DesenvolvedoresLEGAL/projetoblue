import { useEffect, useState } from "react";
import { listTickets, SupportTicket } from "../services/ticketService";
import { TicketCard } from "./TicketCard";

export default function SupportTicketsList() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true);
        const data = await listTickets();
        setTickets(data);
      } catch (err) {
        setError("Falha ao carregar os tickets");
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
    <div className="max-w-4xl mx-auto p-4">
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}