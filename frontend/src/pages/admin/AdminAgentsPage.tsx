import React, { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "../../store/adminStore";
import PageHeader from "../../components/ui/PageHeader";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import CreateAgentModal from "../../components/admin/CreateAgentModal";
import { Users, Wifi, UserCheck, Battery, UserPlus, Inbox } from "lucide-react";
import type { AdminAgent } from "../../types/admin";
import { formatRelativeTime } from "../../utils/time";

const MAX_CAPACITY = 5;

const StatCard = React.memo(function StatCard({
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
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{count}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
});

const AgentCard = React.memo(function AgentCard({
  agent,
}: {
  agent: AdminAgent;
}) {
  const workloadPercent = (agent.activeTickets / MAX_CAPACITY) * 100;
  const isAtCapacity = agent.activeTickets >= MAX_CAPACITY;

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {agent.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {agent.email}
          </p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${
            agent.isOnline
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-50 text-slate-600 border-slate-200"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              agent.isOnline ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {agent.isOnline ? "Online" : "Offline"}
        </span>
      </div>

      {/* Workload Bar */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Workload</span>
          <span
            className={
              isAtCapacity ? "font-semibold text-red-600" : "text-slate-700"
            }
          >
            {agent.activeTickets} / {MAX_CAPACITY}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAtCapacity
                ? "bg-red-500"
                : agent.activeTickets >= 3
                  ? "bg-amber-500"
                  : "bg-blue-500"
            }`}
            style={{ width: `${Math.min(workloadPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="text-xs text-slate-500">
          Joined {formatRelativeTime(agent.createdAt)}
        </span>
      </div>
    </div>
  );
});

export default function AdminAgentsPage() {
  const agents = useAdminStore((s) => s.agents);
  const loading = useAdminStore((s) => s.loading);
  const error = useAdminStore((s) => s.error);
  const fetchAgents = useAdminStore((s) => s.fetchAgents);

  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Derive stats directly from the agents array to guarantee 100% accuracy
  const stats = useMemo(() => {
    const totalAgents = agents.length;
    const onlineAgents = agents.filter((a) => a.isOnline).length;
    const handlingTickets = agents.filter((a) => a.activeTickets > 0).length;
    const usedCapacity = agents.reduce((sum, a) => sum + a.activeTickets, 0);
    const availableCapacity = totalAgents * MAX_CAPACITY - usedCapacity;

    return {
      totalAgents,
      onlineAgents,
      handlingTickets,
      availableCapacity,
    };
  }, [agents]);

  if (loading && agents.length === 0) {
    return <LoadingState text="Loading agents..." />;
  }

  if (error && agents.length === 0) {
    return (
      <ErrorState
        title="Couldn't load agents"
        description={error}
        onRetry={fetchAgents}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Agents"
        description="Manage support staff and monitor workload distribution."
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <UserPlus size={16} />
            Create Agent
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total Agents"
          count={stats.totalAgents}
          icon={Users}
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Online Now"
          count={stats.onlineAgents}
          icon={Wifi}
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="Handling Tickets"
          count={stats.handlingTickets}
          icon={UserCheck}
          colorClass="bg-amber-100 text-amber-600"
        />
        <StatCard
          label="Available Slots"
          count={stats.availableCapacity}
          icon={Battery}
          colorClass="bg-indigo-100 text-indigo-600"
        />
      </div>

      {/* Agents Grid */}
      {agents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8">
          <EmptyState
            icon={Inbox}
            title="No agents yet"
            description="Create your first agent to start handling support tickets."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Agent
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateAgentModal
          onClose={() => {
            setShowCreate(false);
            fetchAgents(); // Refresh list after creating
          }}
        />
      )}
    </div>
  );
}
