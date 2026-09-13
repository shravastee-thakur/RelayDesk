import React, { useEffect } from "react";
import { X, Loader2, Lock } from "lucide-react";
import { useAdminStore } from "../../store/adminStore";
import StatusBadge from "../ui/StatusBadge";
import PriorityBadge from "../ui/PriorityBadge";
import { getHistoryLabel } from "../../utils/historyLabels";
import type { TicketMessage, TicketHistoryItem } from "../../types/ticket";

interface AdminTicketDetailModalProps {
  ticketId: string;
  onClose: () => void;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default React.memo(function AdminTicketDetailModal({
  ticketId,
  onClose,
}: AdminTicketDetailModalProps) {
  const ticket = useAdminStore((s) => s.selectedTicket);
  const messages = useAdminStore((s) => s.messages);
  const history = useAdminStore((s) => s.history);
  const loading = useAdminStore((s) => s.loading);

  const fetchDetails = useAdminStore((s) => s.fetchTicketDetails);
  const fetchMessages = useAdminStore((s) => s.fetchMessages);
  const fetchHistory = useAdminStore((s) => s.fetchHistory);
  const clearSelected = useAdminStore((s) => s.clearSelected);

  useEffect(() => {
    fetchDetails(ticketId);
    fetchMessages(ticketId);
    fetchHistory(ticketId);
  }, [ticketId, fetchDetails, fetchMessages, fetchHistory]);

  useEffect(() => {
    return () => clearSelected();
  }, [clearSelected]);

  const agentName = (ticket as any)?.agent?.name;
  const agentEmail = (ticket as any)?.agent?.email;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-slate-400">
              #{ticketId.slice(-4)}
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              {ticket?.title}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {ticket && <StatusBadge status={ticket.status} />}
            {ticket && <PriorityBadge priority={ticket.priority} />}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && !ticket ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
              {/* Main Column */}
              <div className="space-y-6 p-5 lg:col-span-2">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Description
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {ticket?.description}
                  </p>
                </div>

                {/* Read-only Conversation */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Conversation
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      <Lock size={10} /> Read-only
                    </span>
                  </div>
                  <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
                    {messages.length === 0 && (
                      <p className="text-sm text-slate-400">No messages yet.</p>
                    )}
                    {messages.map((msg: TicketMessage) => {
                      const isAgent = msg.senderId === ticket?.agentId;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isAgent ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                              isAgent
                                ? "bg-blue-600 text-white"
                                : "bg-white text-slate-900 shadow-sm"
                            }`}
                          >
                            <p className="mb-0.5 text-xs font-medium opacity-75">
                              {msg.senderName ||
                                (isAgent ? "Agent" : "Customer")}
                            </p>
                            <p>{msg.message}</p>
                            <p
                              className={`mt-1 text-[10px] ${isAgent ? "text-blue-100" : "text-slate-400"}`}
                            >
                              {formatDateTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Activity Timeline */}
                {history.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">
                      Activity Timeline
                    </h3>
                    <div className="space-y-0">
                      {history.map((h: TicketHistoryItem, idx: number) => (
                        <div key={h.id} className="flex gap-3">
                          <div className="relative flex flex-col items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            {idx !== history.length - 1 && (
                              <div className="mt-1 h-full w-px bg-slate-200" />
                            )}
                          </div>
                          <div className="pb-5">
                            <p className="text-sm font-medium text-slate-900">
                              {getHistoryLabel(h)}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatDateTime(h.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="border-t border-slate-100 bg-slate-50/50 p-5 lg:border-l lg:border-t-0">
                <div className="space-y-6 text-sm">
                  {/* Customer Information */}
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Customer Information
                    </h3>
                    <p className="font-semibold text-slate-900">
                      {ticket?.customer?.name || "Unknown"}
                    </p>
                  </div>

                  {/* Assigned Agent */}
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Assigned Agent
                    </h3>
                    {ticket?.agentId ? (
                      <>
                        <p className="font-semibold text-slate-900">
                          {agentName || "Agent"}
                        </p>
                        {agentEmail && (
                          <p className="text-xs text-slate-500">{agentEmail}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-500">Unassigned</p>
                    )}
                  </div>

                  {/* Ticket Information */}
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Ticket Information
                    </h3>
                    <div className="space-y-2">
                      {ticket?.createdAt && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Created</span>
                          <span className="font-medium text-slate-900">
                            {formatDateTime(ticket.createdAt)}
                          </span>
                        </div>
                      )}
                      {ticket?.assignedAt && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Assigned</span>
                          <span className="font-medium text-slate-900">
                            {formatDateTime(ticket.assignedAt)}
                          </span>
                        </div>
                      )}
                      {ticket?.startedAt && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Started</span>
                          <span className="font-medium text-slate-900">
                            {formatDateTime(ticket.startedAt)}
                          </span>
                        </div>
                      )}
                      {ticket?.resolvedAt && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Resolved</span>
                          <span className="font-medium text-slate-900">
                            {formatDateTime(ticket.resolvedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
