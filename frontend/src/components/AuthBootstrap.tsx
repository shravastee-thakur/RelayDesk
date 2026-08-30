// components/AuthBootstrap.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../store/authStore";
import LoadingState from "./ui/LoadingState";

interface AuthBootstrapProps {
  children: React.ReactNode;
}

export default function AuthBootstrap({ children }: AuthBootstrapProps) {
  const [checking, setChecking] = useState(true);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const restoreSession = async () => {
      if (!isAuthenticated || accessToken) {
        setChecking(false);
        return;
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/tokens`,
          {},
          {
            withCredentials: true,
          },
        );

        setAccessToken(res.data.accessToken);
      } catch {
        logout();
      } finally {
        setChecking(false);
      }
    };

    restoreSession();
  }, [isAuthenticated, accessToken, setAccessToken, logout]);

  if (checking) {
    return <LoadingState text="Restoring your session..." />;
  }

  return <>{children}</>;
}
