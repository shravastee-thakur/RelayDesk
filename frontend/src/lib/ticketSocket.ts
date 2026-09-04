import { getSocket, setOnConnectCallback } from "./socket";
import { useAgentTicketStore } from "../store/agentTicketStore";
import { useCustomerTicketStore } from "../store/customerTicketStore";
import type { TicketMessage, TicketStatus } from "../types/ticket";

let isSetup = false;

const registerListeners = () => {
  const s = getSocket();
  if (!s || isSetup) return;
  isSetup = true;

  console.log("[Socket Listeners] Registering listeners");

  // ── Real-time messages for BOTH stores ──
  s.on("new_message", (msg: TicketMessage) => {
    console.log("[Socket] new_message received:", msg);

    // Update agent store
    const agentState = useAgentTicketStore.getState();
    if (agentState.selectedTicket?.id === msg.ticketId) {
      if (!agentState.messages.find((m) => m.id === msg.id)) {
        console.log("[Socket] Adding message to agent store");
        useAgentTicketStore.setState({
          messages: [...agentState.messages, msg],
        });
      }
    }

    // Update customer store
    const customerState = useCustomerTicketStore.getState();
    if (customerState.selectedTicket?.id === msg.ticketId) {
      if (!customerState.messages.find((m) => m.id === msg.id)) {
        console.log("[Socket] Adding message to customer store");
        useCustomerTicketStore.setState({
          messages: [...customerState.messages, msg],
        });
      }
    }
  });

  // ── Status updates ──
  s.on(
    "ticket_status_updated",
    (data: { ticketId: string; status: TicketStatus; ticket?: any }) => {
      const state = useAgentTicketStore.getState();
      const patch: Partial<typeof state> = {};

      if (state.activeTickets.some((t) => t.id === data.ticketId)) {
        patch.activeTickets = state.activeTickets.map((t) =>
          t.id === data.ticketId
            ? { ...t, status: data.status, ...(data.ticket || {}) }
            : t,
        );
      }

      if (state.queue.some((t) => t.id === data.ticketId)) {
        patch.queue = state.queue.map((t) =>
          t.id === data.ticketId
            ? { ...t, status: data.status, ...(data.ticket || {}) }
            : t,
        );
      }

      if (state.selectedTicket?.id === data.ticketId) {
        patch.selectedTicket = {
          ...state.selectedTicket,
          status: data.status,
          ...(data.ticket || {}),
        };
      }

      if (Object.keys(patch).length) {
        useAgentTicketStore.setState(patch);
      }
    },
  );

  // ── Assignment updates ──
  s.on(
    "ticket_assigned",
    (data: { ticketId: string; agentId: string; ticket?: any }) => {
      const state = useAgentTicketStore.getState();

      if (state.queue.some((t) => t.id === data.ticketId)) {
        useAgentTicketStore.setState({
          queue: state.queue.filter((t) => t.id !== data.ticketId),
        });
      }

      if (state.selectedTicket?.id === data.ticketId && data.ticket) {
        useAgentTicketStore.setState({
          selectedTicket: { ...state.selectedTicket, ...data.ticket },
        });
      }

      if (state.activeTickets.length > 0) {
        state.fetchActiveTickets();
      }
    },
  );
};

export const setupTicketSocketListeners = () => {
  const s = getSocket();

  // If socket is already connected, register immediately
  if (s?.connected) {
    registerListeners();
    return;
  }

  // Otherwise, wait for connection
  setOnConnectCallback(registerListeners);
};

export const teardownTicketSocketListeners = () => {
  const s = getSocket();
  if (!s) return;
  s.off("new_message");
  s.off("ticket_status_updated");
  s.off("ticket_assigned");
  isSetup = false;
};
