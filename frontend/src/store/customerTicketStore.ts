import { create } from "zustand";
import api from "../utils/api";
import {
  connectSocket,
  disconnectSocket as disconnectSocketIO,
  joinTicketRoom,
  leaveTicketRoom,
} from "../lib/socket";
import type {
  Tickets,
  TicketHistoryItem,
  TicketMessage,
} from "../types/ticket";
import toast from "react-hot-toast";

interface CustomerTicketState {
  tickets: Tickets[];
  selectedTicket: Tickets | null;
  history: TicketHistoryItem[];
  messages: TicketMessage[];
  loading: boolean;
  error: string | null;

  fetchTickets: () => Promise<void>;
  fetchTicketDetails: (id: string) => Promise<void>;
  fetchHistory: (id: string) => Promise<void>;
  fetchMessages: (id: string) => Promise<void>;
  cancelTicket: (id: string) => Promise<void>;
  sendMessage: (ticketId: string, content: string) => Promise<void>;
  clearSelected: () => void;
  initSocket: (token: string) => void;
  disconnectSocket: () => void;
}

export const useCustomerTicketStore = create<CustomerTicketState>(
  (set, get) => ({
    tickets: [],
    selectedTicket: null,
    history: [],
    messages: [],
    loading: false,
    error: null,

    fetchTickets: async () => {
      set({ loading: true, error: null });
      try {
        const res = await api.get("/api/tickets/my");
        set({ tickets: res.data.data, loading: false });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to load your requests";
        toast.error(errorMessage, {
          style: {
            borderRadius: "10px",
            background: "#25671E",
            color: "#fff",
          },
        });
        set({ error: errorMessage, loading: false });
      }
    },

    fetchTicketDetails: async (id: string) => {
      const prevId = get().selectedTicket?.id;
      if (prevId && prevId !== id) leaveTicketRoom(prevId);

      set({ loading: true, error: null });
      try {
        const res = await api.get(`/api/tickets/${id}`);
        set({ selectedTicket: res.data.data, loading: false });
        joinTicketRoom(id);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to load ticket details";
        toast.error(errorMessage, {
          style: {
            borderRadius: "10px",
            background: "#25671E",
            color: "#fff",
          },
        });
        set({ error: errorMessage, loading: false });
      }
    },

    fetchHistory: async (id: string) => {
      try {
        const res = await api.get(`/api/tickets/${id}/history`);
        set({ history: res.data.data });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to load history";
        toast.error(errorMessage, {
          style: {
            borderRadius: "10px",
            background: "#25671E",
            color: "#fff",
          },
        });
        set({ error: errorMessage });
      }
    },

    fetchMessages: async (id: string) => {
      try {
        const res = await api.get(`/api/tickets/${id}/messages`);
        set({ messages: res.data.data });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to load messages";
        toast.error(errorMessage, {
          style: {
            borderRadius: "10px",
            background: "#25671E",
            color: "#fff",
          },
        });
        set({ error: errorMessage });
      }
    },

    cancelTicket: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const res = await api.patch(`/api/tickets/${id}/cancel`);
        if (res.data.success) {
          toast.success(res.data.message, {
            style: {
              borderRadius: "10px",
              background: "#25671E",
              color: "#fff",
            },
          });
          const tickets = get().tickets.map((t) =>
            t.id === id ? { ...t, status: "CANCELLED" as const } : t,
          );
          set({ tickets, loading: false });
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to cancel ticket";
        toast.error(errorMessage, {
          style: {
            borderRadius: "10px",
            background: "#25671E",
            color: "#fff",
          },
        });
        set({ error: errorMessage, loading: false });
      }
    },

    sendMessage: async (ticketId: string, content: string) => {
      try {
        await api.post(`/api/tickets/${ticketId}/messages`, {
          message: content,
        });
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || "Failed to send message";
        toast.error(errorMessage, {
          style: {
            borderRadius: "10px",
            background: "#25671E",
            color: "#fff",
          },
        });
        set({ error: errorMessage });
      }
    },

    clearSelected: () => {
      const ticketId = get().selectedTicket?.id;
      if (ticketId) leaveTicketRoom(ticketId);
      set({ selectedTicket: null, history: [], messages: [], error: null });
    },

    initSocket: (token: string) => {
      const socket = connectSocket(token);
      if (!socket) return;

      if ((socket as any)._customerListenersAttached) return;
      (socket as any)._customerListenersAttached = true;

      socket.on("ticket_status_updated", (ticket: Tickets) => {
        console.log(
          "🔥 [Customer Store] RECEIVED ticket_status_updated:",
          ticket,
        );
        set((state) => {
          const next: Partial<CustomerTicketState> = {};

          if (state.tickets.some((t) => t.id === ticket.id)) {
            next.tickets = state.tickets.map((t) =>
              t.id === ticket.id ? ticket : t,
            );
          }

          if (state.selectedTicket?.id === ticket.id) {
            next.selectedTicket = ticket;
            setTimeout(() => get().fetchHistory(ticket.id), 100);
          }

          return next;
        });
      });

      socket.on("ticket_assigned", (ticket: Tickets) => {
        console.log("🔥 [Customer Store] RECEIVED ticket_assigned:", ticket);
        set((state) => {
          const next: Partial<CustomerTicketState> = {};

          if (state.tickets.some((t) => t.id === ticket.id)) {
            next.tickets = state.tickets.map((t) =>
              t.id === ticket.id ? ticket : t,
            );
          }

          if (state.selectedTicket?.id === ticket.id) {
            next.selectedTicket = ticket;
            setTimeout(() => get().fetchHistory(ticket.id), 100);
          }

          return next;
        });
      });
    },

    disconnectSocket: () => {
      disconnectSocketIO();
    },
  }),
);
