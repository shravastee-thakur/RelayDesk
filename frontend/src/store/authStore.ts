import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "customer" | "agent" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  getDashboardPath: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),
      setAccessToken: (token) => set({ accessToken: token }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),

      getDashboardPath: () => {
        const role = get().user?.role;
        switch (role) {
          case "admin":
            return "/admin/dashboard";
          case "agent":
            return "/agent/dashboard";
          case "customer":
          default:
            return "/customer/dashboard";
        }
      },
    }),
    {
      name: "relaydesk-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

