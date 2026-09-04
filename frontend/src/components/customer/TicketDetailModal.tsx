import React, { useEffect, useState } from "react";
import { X, Loader2, Clock, XCircle, Send } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCustomerTicketStore } from "../../store/customerTicketStore";
import StatusBadge from "../ui/StatusBadge";
import PriorityBadge from "../ui/PriorityBadge";
import type { TicketHistoryItem } from "../../types/ticket";
import toast from "react-hot-toast";
import { getHistoryLabel } from "../../utils/historyLabels";

interface TicketDetailModalProps {
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

// ─── Isolated Composer ───
const MessageComposer = React.memo(function MessageComposer({
  ticketId,
}: {
  ticketId: string;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const sendMessage = useCustomerTicketStore((s) => s.sendMessage);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    await sendMessage(ticketId, text.trim());
    setSending(false);
    setText("");
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type a message..."
        className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
      <button
        onClick={handleSend}
        disabled={sending || !text.trim()}
        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {sending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Send size={14} />
        )}
        Send
      </button>
    </div>
  );
});

export default React.memo(function TicketDetailModal({
  ticketId,
  onClose,
}: TicketDetailModalProps) {
  const user = useAuthStore((s) => s.user);
  const ticket = useCustomerTicketStore((s) => s.selectedTicket);
  const history = useCustomerTicketStore((s) => s.history);
  const messages = useCustomerTicketStore((s) => s.messages);
  const loading = useCustomerTicketStore((s) => s.loading);
  const fetchDetails = useCustomerTicketStore((s) => s.fetchTicketDetails);
  const fetchHistory = useCustomerTicketStore((s) => s.fetchHistory);
  const fetchMessages = useCustomerTicketStore((s) => s.fetchMessages);
  const cancelTicket = useCustomerTicketStore((s) => s.cancelTicket);
  const clearSelected = useCustomerTicketStore((s) => s.clearSelected);

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchDetails(ticketId);
    fetchHistory(ticketId);
    fetchMessages(ticketId);
  }, [ticketId, fetchDetails, fetchHistory, fetchMessages]);

  useEffect(() => {
    return () => clearSelected();
  }, [clearSelected]);

  const handleCancel = async () => {
    setCancelling(true);
    await cancelTicket(ticketId);
    setCancelling(false);

    if (!useCustomerTicketStore.getState().error) {
      toast.success("Request cancelled");
      onClose();
    } else {
      setConfirmCancel(false);
    }
  };

  const canCancel = ticket?.status === "WAITING";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              #{ticketId.slice(-4)} {ticket?.title}
            </h2>
            <div className="mt-1 flex gap-2">
              {ticket && <StatusBadge status={ticket.status} />}
              {ticket && <PriorityBadge priority={ticket.priority} />}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && !ticket ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Description
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  {ticket?.description}
                </p>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>
                    Created {ticket && formatDateTime(ticket.createdAt)}
                  </span>
                </div>
                {ticket?.assignedAt && (
                  <span className="text-blue-600">
                    Assigned {formatDateTime(ticket.assignedAt)}
                  </span>
                )}
              </div>

              {/* Conversation */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Conversation
                </h3>
                <div className="space-y-3">
                  {messages.length === 0 && (
                    <p className="text-sm text-slate-400">No messages yet.</p>
                  )}
                  {messages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                            isMe
                              ? "bg-blue-600 text-white"
                              : "bg-white text-slate-900 shadow-sm"
                          }`}
                        >
                          <p className="mb-0.5 text-xs font-medium opacity-75">
                            {isMe ? "You" : msg.senderName || "Support Agent"}
                          </p>
                          <p>{msg.message}</p>
                          <p
                            className={`mt-1 text-[10px] ${
                              isMe ? "text-blue-100" : "text-slate-400"
                            }`}
                          >
                            {formatDateTime(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <MessageComposer ticketId={ticketId} />
                </div>
              </div>

              {/* Activity Timeline */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Activity
                </h3>
                <div className="space-y-0">
                  {history.length === 0 && (
                    <p className="text-sm text-slate-400">No activity yet</p>
                  )}
                  {history.map((h, idx) => (
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
            </div>
          )}
        </div>

        {/* Footer */}
        {canCancel && (
          <div className="border-t border-slate-100 p-5">
            {!confirmCancel ? (
              <button
                onClick={() => setConfirmCancel(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                <XCircle size={16} />
                Cancel Request
              </button>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="text-sm font-medium text-slate-700">
                  Are you sure you want to cancel this request?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {cancelling && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Yes, cancel
                  </button>
                  <button
                    onClick={() => setConfirmCancel(false)}
                    disabled={cancelling}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Keep it
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
