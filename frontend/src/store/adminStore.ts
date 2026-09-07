import { create } from "zustand";
import api from "../utils/api";
import { connectSocket, getSocket } from "../lib/socket";
import type { Tickets } from "../types/ticket";
import type { AdminStats, AdminAgent } from "../types/admin";
import toast from "react-hot-toast";

interface AdminState {
  stats: AdminStats | null;
  tickets: Tickets[];
  agents: AdminAgent[];
  loading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
  fetchTickets: () => Promise<void>;
  fetchAgents: () => Promise<void>;
  createAgent: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;

  initSocket: (token: string) => void;
  disconnectSocket: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: null,
  tickets: [],
  agents: [],
  loading: false,
  error: null,

  fetchStats: async () => {
    try {
      const res = await api.get("/api/admin/stats");
      set({ stats: res.data.data });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load stats";
      toast.error(errorMessage, {
        style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
      });
      set({ error: errorMessage, loading: false });
    }
  },

  fetchTickets: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/api/tickets/admin");
      set({ tickets: res.data.data, loading: false });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load tickets";
      toast.error(errorMessage, {
        style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
      });
      set({ error: errorMessage, loading: false });
    }
  },

  fetchAgents: async () => {
    try {
      const res = await api.get("/api/admin/agents");
      set({ agents: res.data.data });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to load agents";
      toast.error(errorMessage, {
        style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
      });
      set({ error: errorMessage, loading: false });
    }
  },

  createAgent: async (data) => {
    try {
      await api.post("/api/admin/agents", data);
      toast.success("Agent created successfully", {
        style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
      });
      get().fetchStats();
      get().fetchAgents();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to create agent";
      toast.error(errorMessage, {
        style: { borderRadius: "10px", background: "#25671E", color: "#fff" },
      });
      set({ error: errorMessage, loading: false });
    }
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
      get().fetchAgents(); // Refresh workload bars
    });

    socket.on("ticket_status_updated", (ticket: Tickets) => {
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === ticket.id ? ticket : t)),
      }));
      get().fetchStats();
      get().fetchAgents(); // Refresh workload bars
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
  },
}));
