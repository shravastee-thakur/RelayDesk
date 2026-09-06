import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAdminStore } from "../../store/adminStore";
import Card from "../../components/ui/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import PriorityBadge from "../../components/ui/PriorityBadge";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import AgentTicketDetailModal from "../../components/agent/AgentTicketDetailModal";
import CreateAgentModal from "../../components/admin/CreateAgentModal";
import {
  Users,
  Ticket,
  Clock,
  CheckCircle2,
  Inbox,
  UserPlus,
  ArrowRight,
  Activity,
} from "lucide-react";
import { formatRelativeTime } from "../../utils/time";
import AdminTicketDetailModal from "../../components/admin/AdminTicketDetailModal";

function StatCard({
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

const RecentTicketRow = React.memo(function RecentTicketRow({
  ticket,
  onClick,
}: {
  ticket: any;
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
      <td className="max-w-[150px] truncate px-4 py-3 text-sm text-slate-700">
        {ticket.title}
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

export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const stats = useAdminStore((s) => s.stats);
  const tickets = useAdminStore((s) => s.tickets);
  const loading = useAdminStore((s) => s.loading);
  const error = useAdminStore((s) => s.error);
  const fetchStats = useAdminStore((s) => s.fetchStats);
  const fetchTickets = useAdminStore((s) => s.fetchTickets);
  const initSocket = useAdminStore((s) => s.initSocket);
  const disconnectSocket = useAdminStore((s) => s.disconnectSocket);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [showCreateAgent, setShowCreateAgent] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchTickets();
  }, [fetchStats, fetchTickets]);

  useEffect(() => {
    const token = useAuthStore.getState().accessToken;
    if (token) initSocket(token);
    return () => disconnectSocket();
  }, [initSocket, disconnectSocket]);

  const activeCount = useMemo(() => {
    if (!stats) return 0;
    return (stats.assigned || 0) + (stats.inProgress || 0);
  }, [stats]);

  // Show only the 5 most recent tickets on the dashboard
  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);
  }, [tickets]);

  if (loading && tickets.length === 0) {
    return <LoadingState text="Loading dashboard..." />;
  }

  if (error && tickets.length === 0) {
    return (
      <ErrorState
        title="Couldn't load dashboard"
        description={error}
        onRetry={fetchTickets}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor system health, manage agents, and oversee support operations.
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Total Tickets"
            count={stats.totalTickets}
            icon={Inbox}
            colorClass="bg-blue-100 text-blue-600"
          />
          <StatCard
            label="Waiting"
            count={stats.waiting}
            icon={Clock}
            colorClass="bg-amber-100 text-amber-600"
          />
          <StatCard
            label="Active"
            count={activeCount}
            icon={Ticket}
            colorClass="bg-indigo-100 text-indigo-600"
          />
          <StatCard
            label="Resolved"
            count={stats.resolved}
            icon={CheckCircle2}
            colorClass="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            label="Total Agents"
            count={stats.totalAgents}
            icon={Users}
            colorClass="bg-slate-100 text-slate-600"
          />
        </div>
      )}

      {/* Main Content Grid: Recent Tickets + Agent Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Recent Tickets (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Recent Activity
            </h2>
            <Link
              to="/admin/tickets"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View all tickets <ArrowRight size={16} />
            </Link>
          </div>

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
                {recentTickets.map((ticket) => (
                  <RecentTicketRow
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => setDetailId(ticket.id)}
                  />
                ))}
                {recentTickets.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Agent Overview (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Agent Overview</h2>
            <Link
              to="/admin/agents"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Manage <ArrowRight size={16} />
            </Link>
          </div>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  System Capacity
                </p>
                <p className="text-xs text-slate-500">
                  {stats?.totalAgents || 0} agents registered
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Agents</span>
                <span className="font-semibold text-slate-900">
                  {stats?.totalAgents || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Tickets</span>
                <span className="font-semibold text-slate-900">
                  {activeCount}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waiting Queue</span>
                <span className="font-semibold text-amber-600">
                  {stats?.waiting || 0}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowCreateAgent(true)}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <UserPlus size={16} />
              Create New Agent
            </button>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {detailId && (
        <AdminTicketDetailModal
          ticketId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
      {showCreateAgent && (
        <CreateAgentModal onClose={() => setShowCreateAgent(false)} />
      )}
    </div>
  );
}
