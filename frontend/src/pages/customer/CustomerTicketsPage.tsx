import { useEffect, useMemo, useState } from "react";
import { useCustomerTicketStore } from "../../store/customerTicketStore";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import TicketCard from "../../components/ui/TicketCard";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import TicketDetailModal from "../../components/customer/TicketDetailModal";
import CreateTicketModal from "../../components/customer/CreateTicketModal";
import { PlusCircle, AlertCircle } from "lucide-react";

export default function CustomerTicketsPage() {
  const tickets = useCustomerTicketStore((s) => s.tickets);
  const loading = useCustomerTicketStore((s) => s.loading);
  const error = useCustomerTicketStore((s) => s.error);
  const fetchTickets = useCustomerTicketStore((s) => s.fetchTickets);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const sortedTickets = useMemo(() => {
    const activeFirst = ["WAITING", "ASSIGNED", "IN_PROGRESS"];
    return [...tickets].sort((a, b) => {
      const aActive = activeFirst.includes(a.status) ? 0 : 1;
      const bActive = activeFirst.includes(b.status) ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tickets]);

  if (loading && tickets.length === 0) {
    return <LoadingState text="Loading your requests..." />;
  }

  if (error && tickets.length === 0) {
    return (
      <ErrorState
        title="Couldn't load requests"
        description={error}
        onRetry={fetchTickets}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="My Tickets"
        description="All your support requests in one place."
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <PlusCircle size={18} />
            New Ticket
          </button>
        }
      />

      {tickets.length === 0 ? (
        <Card>
          <EmptyState
            icon={AlertCircle}
            title="You don't have any support requests yet"
            description="Create your first ticket and we'll get you help right away."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create New Ticket
              </button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => setDetailId(ticket.id)}
            />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateTicketModal
          onClose={() => setShowCreate(false)}
          onCreated={fetchTickets}
        />
      )}

      {detailId && (
        <TicketDetailModal
          ticketId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
