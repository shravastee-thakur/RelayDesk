import React, { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../../store/adminStore";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import PriorityBadge from "../../components/ui/PriorityBadge";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import { Inbox, Search } from "lucide-react";
import type { Tickets, TicketStatus, TicketPriority } from "../../types/ticket";
import { formatRelativeTime } from "../../utils/time";
import AdminTicketDetailModal from "../../components/admin/AdminTicketDetailModal";

const AdminTicketRow = React.memo(function AdminTicketRow({
  ticket,
  onClick,
}: {
  ticket: Tickets;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50"
    >
      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
        #{ticket.id.slice(-4)}
      </td>
      <td className="max-w-[200px] truncate px-4 py-3 text-sm text-slate-700">
        {ticket.title}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
        {ticket.customer?.name || "Customer"}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <StatusBadge status={ticket.status} />
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <PriorityBadge priority={ticket.priority} />
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
        {formatRelativeTime(ticket.createdAt)}
      </td>
    </tr>
  );
});

export default function AdminTicketsPage() {
  const tickets = useAdminStore((s) => s.tickets);
  const loading = useAdminStore((s) => s.loading);
  const error = useAdminStore((s) => s.error);
  const fetchTickets = useAdminStore((s) => s.fetchTickets);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "ALL">(
    "ALL",
  );

  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Memoized filtering prevents table rerenders on every keystroke
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
      const matchesPriority =
        priorityFilter === "ALL" || t.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  if (loading && tickets.length === 0) {
    return <LoadingState text="Loading all tickets..." />;
  }

  if (error && tickets.length === 0) {
    return (
      <ErrorState
        title="Couldn't load tickets"
        description={error}
        onRetry={fetchTickets}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="All Tickets"
        description="Monitor, investigate, and manage all support requests across the system."
      />

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
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as TicketStatus | "ALL")
          }
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="ALL">All Statuses</option>
          <option value="WAITING">Waiting</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
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

      {/* Table */}
      {filteredTickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8">
          <EmptyState
            icon={Inbox}
            title="No tickets match your filters"
            description="Try adjusting your search or filter criteria."
          />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Ticket
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <AdminTicketRow
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => setDetailId(ticket.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailId && (
        <AdminTicketDetailModal
          ticketId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
