import { create } from "zustand";
import api from "../utils/api";
import {
  connectSocket,
  disconnectSocket as disconnectSocketIO,
  getSocket,
  joinTicketRoom,
  leaveTicketRoom,
} from "../lib/socket";
import type {
  Tickets,
  TicketMessage,
  TicketPriority,
  TicketHistoryItem,
  TicketStatus,
} from "../types/ticket";
import type { AdminStats, AdminAgent } from "../types/admin";
import toast from "react-hot-toast";

interface AdminState {
  stats: AdminStats | null;
  tickets: Tickets[];
  selectedTicket: Tickets | null;
  agents: AdminAgent[];
  messages: TicketMessage[];
  history: TicketHistoryItem[];
  loading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchTickets: () => Promise<void>;
  createAgent: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  fetchAgents: () => Promise<void>;
  fetchTicketDetails: (id: string) => Promise<void>;
  fetchMessages: (id: string) => Promise<void>;
  fetchHistory: (id: string) => Promise<void>;
  updateStatus: (id: string, status: TicketStatus) => Promise<void>;
  updatePriority: (id: string, priority: TicketPriority) => Promise<void>;
  closeTicket: (id: string) => Promise<void>;
  sendMessage: (ticketId: string, content: string) => Promise<void>;
  clearSelected: () => void;

  initSocket: (token: string) => void;
  disconnectSocket: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  tickets: [],
  agents: [],
  selectedTicket: null,
  messages: [],
  history: [],
  loading: false,
  error: null,

  fetchStats: async () => {
    try {
      const res = await api.get("/api/admin/stats");
      set({ stats: res.data.data });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load stats");
    }
  },

  fetchTickets: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/tickets/admin");
      set({ tickets: res.data.data, loading: false });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load tickets";
      toast.error(msg);
      set({ error: msg, loading: false });
    }
  },

  createAgent: async (data) => {
    try {
      await api.post("/api/admin/agents", data);
      toast.success("Agent created successfully");
      get().fetchStats();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create agent");
      throw err;
    }
  },

  fetchAgents: async () => {
    try {
      const res = await api.get("/api/admin/agents");
      console.log(res.data);

      set({ agents: res.data.data });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load agents");
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
      const msg = err.response?.data?.message || "Failed to load ticket";
      toast.error(msg);
      set({ error: msg, loading: false });
    }
  },

  fetchMessages: async (id: string) => {
    try {
      const res = await api.get(`/api/tickets/${id}/messages`);
      set({ messages: res.data.data });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load messages");
    }
  },

  fetchHistory: async (id: string) => {
    try {
      const res = await api.get(`/api/tickets/${id}/history`);
      set({ history: res.data.data });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load history");
    }
  },

  updateStatus: async (id: string, status: TicketStatus) => {
    try {
      const res = await api.patch(`/api/tickets/${id}/status`, { status });
      const updated = res.data.data;
      set((state) => ({
        selectedTicket:
          state.selectedTicket?.id === id ? updated : state.selectedTicket,
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
      }));
      toast.success(`Status updated to ${status.replace("_", " ")}`);
      if (get().selectedTicket?.id === id) get().fetchHistory(id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  },

  updatePriority: async (id: string, priority: TicketPriority) => {
    try {
      const res = await api.patch(`/api/tickets/${id}/priority`, { priority });
      const updated = res.data.data;
      set((state) => ({
        selectedTicket:
          state.selectedTicket?.id === id ? updated : state.selectedTicket,
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
      }));
      toast.success(`Priority updated to ${priority}`);
      if (get().selectedTicket?.id === id) get().fetchHistory(id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update priority");
    }
  },

  closeTicket: async (id: string) => {
    try {
      const res = await api.patch(`/api/tickets/${id}/close`);
      const updated = res.data.data;
      set((state) => ({
        selectedTicket:
          state.selectedTicket?.id === id ? updated : state.selectedTicket,
        tickets: state.tickets.map((t) => (t.id === id ? updated : t)),
      }));
      toast.success("Ticket closed");
      if (get().selectedTicket?.id === id) get().fetchHistory(id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to close ticket");
    }
  },

  sendMessage: async (ticketId: string, content: string) => {
    try {
      await api.post(`/api/tickets/${ticketId}/messages`, { message: content });
      get().fetchMessages(ticketId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  },

  clearSelected: () => {
    const ticketId = get().selectedTicket?.id;
    if (ticketId) leaveTicketRoom(ticketId);
    set({ selectedTicket: null, messages: [], history: [], error: null });
  },

  initSocket: (token) => {
    const socket = connectSocket(token);
    if (!socket) return;
    if ((socket as any)._adminListeners) return;
    (socket as any)._adminListeners = true;

    socket.on("ticket_created", (ticket: Tickets) => {
      set((state) => {
        if (state.tickets.find((t) => t.id === ticket.id)) return state;
        return { tickets: [ticket, ...state.tickets] };
      });
      get().fetchStats();
    });

    socket.on("ticket_assigned", (ticket: Tickets) => {
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === ticket.id ? ticket : t)),
      }));
      get().fetchStats();
    });

    socket.on("ticket_status_updated", (ticket: Tickets) => {
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === ticket.id ? ticket : t)),
        selectedTicket:
          state.selectedTicket?.id === ticket.id
            ? ticket
            : state.selectedTicket,
      }));
      get().fetchStats();
    });
  },

  disconnectSocket: () => {
    const socket = getSocket();
    if (socket && (socket as any)._adminListeners) {
      socket.off("ticket_created");
      socket.off("ticket_assigned");
      socket.off("ticket_status_updated");
      (socket as any)._adminListeners = false;
    }
    disconnectSocketIO();
  },
}));
