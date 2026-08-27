import { create } from "zustand";
import api from "../utils/api";
import type { Ticket, TicketHistoryItem } from "../types/ticket";
import toast from "react-hot-toast";

interface CustomerTicketState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  history: TicketHistoryItem[];
  loading: boolean;
  error: string | null;

  fetchTickets: () => Promise<void>;
  fetchTicketDetails: (id: string) => Promise<void>;
  fetchHistory: (id: string) => Promise<void>;
  cancelTicket: (id: string) => Promise<void>;
  clearSelected: () => void;
}

export const useCustomerTicketStore = create<CustomerTicketState>(
  (set, get) => ({
    tickets: [],
    selectedTicket: null,
    history: [],
    loading: false,
    error: null,

    fetchTickets: async () => {
      set({ loading: true, error: null });
      try {
        const res = await api.get("api/tickets/my");

        set({ tickets: res.data.data, loading: false });
      } catch (err: any) {
        set({
          error: err.response?.data?.message || "Failed to load your requests",
          loading: false,
        });
      }
    },

    fetchTicketDetails: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const res = await api.get(`api/tickets/${id}`);
        set({ selectedTicket: res.data.data, loading: false });
      } catch (err: any) {
        set({
          error: err.response?.data?.message || "Failed to load ticket details",
          loading: false,
        });
      }
    },

    fetchHistory: async (id: string) => {
      try {
        const res = await api.get(`api/tickets/${id}/history`);
        set({ history: res.data.data });
      } catch (err: any) {
        set({ error: err.response?.data?.message || "Failed to load history" });
      }
    },

    cancelTicket: async (id: string) => {
      set({ loading: true, error: null });
      try {
        const res = await api.patch(`api/tickets/${id}/cancel`);
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

        // Show error toast so user knows what went wrong
        toast.error(errorMessage);

        set({
          error: errorMessage,
          loading: false, // Add this
        });
      }
    },

    clearSelected: () =>
      set({ selectedTicket: null, history: [], error: null }),
  }),
);
