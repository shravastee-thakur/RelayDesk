import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCustomerTicketStore } from "../../store/customerTicketStore";
import Card from "../../components/ui/Card";
import TicketCard from "../../components/ui/TicketCard";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import CreateTicketModal from "../../components/customer/CreateTicketModal";
import TicketDetailModal from "../../components/customer/TicketDetailModal";
import {
  Ticket,
  Clock,
  CheckCircle2,
  Inbox,
  PlusCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

function SummaryCard({
  label,
  count,
  icon: Icon,
  colorClass,
}: {
  label: string;
  count: number;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{count}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </Card>
  );
}

export default function CustomerDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const tickets = useCustomerTicketStore((s) => s.tickets);
  const loading = useCustomerTicketStore((s) => s.loading);
  const error = useCustomerTicketStore((s) => s.error);
  const accessToken = useAuthStore((s) => s.accessToken);
  const fetchTickets = useCustomerTicketStore((s) => s.fetchTickets);

  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchTickets();
  }, [fetchTickets, accessToken]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const waiting = tickets.filter((t) => t.status === "WAITING").length;
    const active = tickets.filter((t) =>
      ["ASSIGNED", "IN_PROGRESS"].includes(t.status),
    ).length;
    const resolved = tickets.filter((t) =>
      ["RESOLVED", "CLOSED", "CANCELLED"].includes(t.status),
    ).length;
    return { total, waiting, active, resolved };
  }, [tickets]);

  const recentTickets = useMemo(() => {
    const activeFirst = ["WAITING", "ASSIGNED", "IN_PROGRESS"];
    const sorted = [...tickets].sort((a, b) => {
      const aActive = activeFirst.includes(a.status) ? 0 : 1;
      const bActive = activeFirst.includes(b.status) ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return sorted.slice(0, 3);
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
      {/* Welcome */}
      <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Need help? Create a support ticket and our team will assist you.
        </p>
        <button
          onClick={() => setShowCreate(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          <PlusCircle size={18} />
          Create New Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryCard
          label="Total"
          count={stats.total}
          icon={Inbox}
          colorClass="bg-blue-100 text-blue-600"
        />
        <SummaryCard
          label="Waiting"
          count={stats.waiting}
          icon={Clock}
          colorClass="bg-amber-100 text-amber-600"
        />
        <SummaryCard
          label="Active"
          count={stats.active}
          icon={Ticket}
          colorClass="bg-indigo-100 text-indigo-600"
        />
        <SummaryCard
          label="Resolved"
          count={stats.resolved}
          icon={CheckCircle2}
          colorClass="bg-emerald-100 text-emerald-600"
        />
      </div>

      {/* Recent Tickets */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Recent Requests
        </h2>

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
          <>
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onClick={() => setDetailId(ticket.id)}
                />
              ))}
            </div>

            {tickets.length > 3 && (
              <div className="mt-5 text-center">
                <Link
                  to="/customer/tickets"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  View all tickets <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </>
        )}
      </div>

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
