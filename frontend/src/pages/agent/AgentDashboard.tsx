import React, { useEffect, useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import { useAgentTicketStore } from "../../store/agentTicketStore";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import QueueSection from "../../components/agent/QueueSection";
import { Ticket, Loader2, AlertTriangle, Inbox } from "lucide-react";
import toast from "react-hot-toast";

const MAX_ACTIVE = 5;

const CircularProgress = React.memo(function CircularProgress({
  current,
  max,
  color,
}: {
  current: number;
  max: number;
  color: string;
}) {
  const radius = 44;
  const stroke = 7;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = Math.min(current / max, 1);
  const dashoffset = circumference - progress * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          stroke="#e2e8f0"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold text-slate-900">
          {current}
        </span>
        <span className="text-xs font-medium text-slate-400">/ {max}</span>
      </div>
    </div>
  );
});

function getWorkloadTheme(count: number) {
  if (count >= MAX_ACTIVE) {
    return {
      color: "#ef4444",
      cardBg: "bg-red-50/60 border-red-100",
      textAccent: "text-red-700",
      buttonBg: "bg-red-100 text-red-700 border-red-200",
    };
  }
  if (count >= 3) {
    return {
      color: "#f59e0b",
      cardBg: "bg-amber-50/60 border-amber-100",
      textAccent: "text-amber-700",
      buttonBg: "bg-amber-100 text-amber-700 border-amber-200",
    };
  }
  return {
    color: "#2563eb",
    cardBg: "bg-white border-slate-200",
    textAccent: "text-blue-700",
    buttonBg: "bg-blue-600 text-white hover:bg-blue-700",
  };
}

export default function AgentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const activeTickets = useAgentTicketStore((s) => s.activeTickets);
  const loading = useAgentTicketStore((s) => s.loading);
  const error = useAgentTicketStore((s) => s.error);
  const fetchActiveTickets = useAgentTicketStore((s) => s.fetchActiveTickets);
  const takeNextTicket = useAgentTicketStore((s) => s.takeNextTicket);

  useEffect(() => {
    fetchActiveTickets();
  }, [fetchActiveTickets]);

  const activeCount = activeTickets.length;
  const canTakeMore = activeCount < MAX_ACTIVE;
  const remaining = MAX_ACTIVE - activeCount;

  const theme = useMemo(() => getWorkloadTheme(activeCount), [activeCount]);

  const handleTakeNext = async () => {
    const ticket = await takeNextTicket();
    toast.success(`Ticket #${ticket.id.slice(-4)} assigned to you`);
  };

  if (loading && activeTickets.length === 0) {
    return <LoadingState text="Loading your workload..." />;
  }

  if (error && activeTickets.length === 0) {
    return (
      <ErrorState
        title="Couldn't load workload"
        description={error}
        onRetry={fetchActiveTickets}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your assigned tickets and help customers resolve their issues.
        </p>
      </div>

      {/* Workload Card */}
      <div
        className={`rounded-2xl border p-6 shadow-sm transition-colors sm:p-8 ${theme.cardBg}`}
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="shrink-0">
            <CircularProgress
              current={activeCount}
              max={MAX_ACTIVE}
              color={theme.color}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-bold text-slate-900">Active Tickets</h2>
            <p className="mt-1 text-sm text-slate-600">
              You're handling {activeCount} of {MAX_ACTIVE} slots
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {canTakeMore ? (
                <>
                  You can take{" "}
                  <span className={`font-semibold ${theme.textAccent}`}>
                    {remaining} more
                  </span>{" "}
                  tickets.
                </>
              ) : (
                <span className="flex items-center justify-center gap-1.5 font-semibold text-red-600 sm:justify-start">
                  <AlertTriangle size={14} />
                  You have reached the maximum of {MAX_ACTIVE} active tickets.
                </span>
              )}
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleTakeNext}
              disabled={!canTakeMore || loading}
              className={`inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold shadow-sm transition-colors sm:w-auto ${theme.buttonBg} ${
                !canTakeMore
                  ? "cursor-not-allowed opacity-100"
                  : "hover:shadow-md"
              }`}
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : canTakeMore ? (
                <Ticket size={18} />
              ) : (
                <AlertTriangle size={18} />
              )}
              {canTakeMore ? "Take Next Ticket" : "At Capacity"}
            </button>
          </div>
        </div>
      </div>

      {/* Queue Section */}
      {/* <div className="mt-8">
        <QueueSection />
      </div> */}
    </div>
  );
}
