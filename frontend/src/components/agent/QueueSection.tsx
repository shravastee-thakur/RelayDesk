import React, { useEffect } from "react";
import { useAgentTicketStore } from "../../store/agentTicketStore";
import { Clock, RefreshCw, Inbox } from "lucide-react";
import PriorityBadge from "../ui/PriorityBadge";
import EmptyState from "../ui/EmptyState";
import type { Ticket } from "../../types/ticket";

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

const QueueItem = React.memo(function QueueItem({
  ticket,
}: {
  ticket: Ticket;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mt-0.5 shrink-0">
        <PriorityBadge priority={ticket.priority} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{ticket.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Waiting since {formatRelativeTime(ticket.createdAt)}
          </span>
          <span>•</span>
          <span className="font-mono">#{ticket.id.slice(-4)}</span>
        </div>
      </div>
    </div>
  );
});

export default function QueueSection() {
  const queue = useAgentTicketStore((s) => s.queue);
  const loading = useAgentTicketStore((s) => s.loading);
  const fetchQueue = useAgentTicketStore((s) => s.fetchQueue);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900">Waiting Queue</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            {queue.length}
          </span>
        </div>
        <button
          onClick={fetchQueue}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {queue.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8">
          <EmptyState
            icon={Inbox}
            title="No tickets waiting"
            description="The queue is clear. Great job!"
          />
        </div>
      ) : (
        <div className="space-y-2">
          {queue.map((ticket) => (
            <QueueItem key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
