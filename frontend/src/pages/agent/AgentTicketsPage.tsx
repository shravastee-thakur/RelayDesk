import { useEffect, useState, useMemo } from "react";
import { useAgentTicketStore } from "../../store/agentTicketStore";
import PageHeader from "../../components/ui/PageHeader";
import AgentTicketCard from "../../components/agent/AgentTicketCard";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { Ticket, CheckCircle2, Search } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import AgentTicketDetailModal from "../../components/agent/AgentTicketDetailModal";
import { formatRelativeTime } from "../../utils/time";
import type { TicketPriority } from "../../types/ticket";

type Tab = "active" | "history";

export default function AgentTicketsPage() {
  const [tab, setTab] = useState<Tab>("active");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "ALL">(
    "ALL",
  );

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

  const filteredTickets = useMemo(() => {
    const source = tab === "active" ? active : history;
    return source.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase());
      const matchesPriority =
        priorityFilter === "ALL" || t.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tab, active, history, search, priorityFilter]);

  if (loading && filteredTickets.length === 0 && !search) {
    return <LoadingState text="Loading tickets..." />;
  }

  if (error && filteredTickets.length === 0 && !search) {
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

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or ticket ID..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value as TicketPriority | "ALL")
          }
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="ALL">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Ticket List */}
      {filteredTickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8">
          <EmptyState
            icon={tab === "active" ? Ticket : CheckCircle2}
            title={
              search || priorityFilter !== "ALL"
                ? "No tickets match your filters"
                : tab === "active"
                  ? "No active tickets"
                  : "No history yet"
            }
            description={
              search || priorityFilter !== "ALL"
                ? "Try adjusting your search or filter criteria."
                : tab === "active"
                  ? "Take a ticket from the queue to get started."
                  : "Resolved and closed tickets will appear here."
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
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
