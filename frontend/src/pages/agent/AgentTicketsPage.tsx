import { useEffect, useState, useMemo } from "react";
import { useAgentTicketStore } from "../../store/agentTicketStore";
import PageHeader from "../../components/ui/PageHeader";
import AgentTicketCard from "../../components/agent/AgentTicketCard";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { Ticket, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import AgentTicketDetailModal from "../../components/agent/AgentTicketDetailModal";

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

type Tab = "active" | "history";

export default function AgentTicketsPage() {
  const [tab, setTab] = useState<Tab>("active");
  const activeTickets = useAgentTicketStore((s) => s.activeTickets);
  const historyTickets = useAgentTicketStore((s) => s.historyTickets);
  const loading = useAgentTicketStore((s) => s.loading);
  const error = useAgentTicketStore((s) => s.error);
  const fetchActiveTickets = useAgentTicketStore((s) => s.fetchActiveTickets);
  const fetchAgentHistory = useAgentTicketStore((s) => s.fetchAgentHistory);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchActiveTickets();
    fetchAgentHistory();
  }, [fetchActiveTickets, fetchAgentHistory, accessToken]);

  const active = useMemo(
    () =>
      activeTickets.filter((t) =>
        ["ASSIGNED", "IN_PROGRESS"].includes(t.status),
      ),
    [activeTickets],
  );

  const history = useMemo(
    () =>
      historyTickets.filter((t) =>
        ["RESOLVED", "CLOSED", "CANCELLED"].includes(t.status),
      ),
    [historyTickets],
  );

  const tickets = tab === "active" ? active : history;

  if (loading && tickets.length === 0) {
    return <LoadingState text="Loading tickets..." />;
  }

  if (error && tickets.length === 0) {
    return (
      <ErrorState
        title="Couldn't load tickets"
        description={error}
        onRetry={tab === "active" ? fetchActiveTickets : fetchAgentHistory}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title="My Tickets" description="Tickets assigned to you." />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        <button
          onClick={() => setTab("active")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "active"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Active ({active.length})
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "history"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          History ({history.length})
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8">
          <EmptyState
            icon={tab === "active" ? Ticket : CheckCircle2}
            title={tab === "active" ? "No active tickets" : "No history yet"}
            description={
              tab === "active"
                ? "Take a ticket from the queue to get started."
                : "Resolved and closed tickets will appear here."
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <AgentTicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => setDetailId(ticket.id)}
              meta={
                tab === "active"
                  ? ticket.status === "ASSIGNED"
                    ? `Assigned ${formatRelativeTime(ticket.assignedAt || ticket.createdAt)}`
                    : `Started ${formatRelativeTime(ticket.startedAt || ticket.assignedAt)}`
                  : `Resolved ${formatRelativeTime(ticket.resolvedAt || ticket.updatedAt)}`
              }
            />
          ))}
        </div>
      )}

      {detailId && (
        <AgentTicketDetailModal
          ticketId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
