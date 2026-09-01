import { useEffect } from "react";
import { useAgentTicketStore } from "../../store/agentTicketStore";
import PageHeader from "../../components/ui/PageHeader";
import AgentTicketCard from "../../components/agent/AgentTicketCard";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import ErrorState from "../../components/ui/ErrorState";
import { Inbox, Ticket, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function AgentQueuePage() {
  const queue = useAgentTicketStore((s) => s.queue);
  const activeTickets = useAgentTicketStore((s) => s.activeTickets);
  const loading = useAgentTicketStore((s) => s.loading);
  const error = useAgentTicketStore((s) => s.error);
  const fetchQueue = useAgentTicketStore((s) => s.fetchQueue);
  const takeNextTicket = useAgentTicketStore((s) => s.takeNextTicket);
    const accessToken = useAuthStore((s) => s.accessToken);

  const activeCount = activeTickets.filter((t) =>
    ["ASSIGNED", "IN_PROGRESS"].includes(t.status),
  ).length;
  const canTakeMore = activeCount < 5;

  useEffect(() => {
     if (!accessToken) return;
    fetchQueue();
  }, [fetchQueue, accessToken]);

  const handleTakeNext = async () => {
    try {
      const ticket = await takeNextTicket();
      toast.success(`Ticket #${ticket.id.slice(-4)} assigned to you`);
    } catch {
      // Error in store
    }
  };

  if (loading && queue.length === 0) {
    return <LoadingState text="Loading queue..." />;
  }

  if (error && queue.length === 0) {
    return (
      <ErrorState
        title="Couldn't load queue"
        description={error}
        onRetry={fetchQueue}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        title="Waiting Queue"
        description="Tickets waiting for an agent, ordered by priority."
        action={
          <button
            onClick={handleTakeNext}
            disabled={!canTakeMore || loading}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition-colors ${
              canTakeMore
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "cursor-not-allowed bg-slate-200 text-slate-500"
            }`}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Ticket size={16} />
            )}
            Take Next Ticket
          </button>
        }
      />

      {queue.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8">
          <EmptyState
            icon={Inbox}
            title="No tickets waiting"
            description="The queue is clear. Great job!"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {queue.map((ticket) => (
            <AgentTicketCard
              key={ticket.id}
              ticket={ticket}
              meta={`Waiting since ${formatRelativeTime(ticket.createdAt)}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
