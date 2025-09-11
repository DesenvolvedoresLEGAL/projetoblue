import { useCallback, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resolveTicket, restoreTicket, SupportTicket } from "../services/ticketService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/utils/toast";

// Reutilizando funções auxiliares
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

export const TicketDetailsModal = ({
    ticket,
    onStatusChange,
}: {
    ticket: SupportTicket;
    onStatusChange: (ticketId: number, newStatus: string) => void;
}) => {
    const { hasMinimumRole } = useAuth();
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState(ticket.status);

    const handleMarkResolved = () => {
        if (hasMinimumRole("suporte")) {
            resolveTicket(ticket.id);
            setStatus('resolvido');
        } else {
            return toast.info("Parece que você não possui o cargo necessário para a ação!")
        }

        if (onStatusChange) {
            onStatusChange(ticket.id, "resolvido");
        }
    };

    const handleRestore = () => {
        if (hasMinimumRole("suporte")) {
            restoreTicket(ticket.id);
            setStatus('aberto');
        } else {
            return toast.info("Parece que você não possui o cargo necessário para a ação!")
        }
        if (onStatusChange) {
            onStatusChange(ticket.id, "aberto");
        }
    };

    useCallback(() => {
        setStatus(ticket.status);
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Abrir
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-[#020CBC]">{ticket.assunto}</DialogTitle>
                    <DialogDescription>ID do Ticket: <span className="font-mono text-sm">{ticket.id}</span></DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(ticket.prioridade)}>{ticket.prioridade}</Badge>
                        <div className="flex items-center gap-1">
                            {getStatusIcon(status)}
                            <Badge variant={getStatusColor(status)}>{status}</Badge>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        <strong>Solicitante:</strong> {ticket.nome_solicitante}
                    </p>

                    {ticket.categoria && (
                        <p className="text-sm text-muted-foreground">
                            <strong>Categoria:</strong> {ticket.categoria}
                        </p>
                    )}

                    <div>
                        <strong className="text-sm">Tags:</strong>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {ticket.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="uppercase text-xs">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-4">
                    <Button
                        variant="default"
                        onClick={handleMarkResolved}
                        disabled={status.toLowerCase() === "fechado"}
                    >
                        Marcar como resolvido
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleRestore}
                        disabled={status.toLowerCase() === "aberto"}
                    >
                        Restaurar ticket
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
