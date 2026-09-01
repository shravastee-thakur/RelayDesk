import { useEffect } from "react";
import { connectSocket, disconnectSocket } from "../lib/socket";
import {
  setupTicketSocketListeners,
  teardownTicketSocketListeners,
} from "../lib/ticketSocket";

export const useSocketInit = (token: string | null) => {
  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    if (socket.connected) {
      setupTicketSocketListeners();
    } else {
      socket.once("connect", setupTicketSocketListeners);
    }

    return () => {
      teardownTicketSocketListeners();
      disconnectSocket();
    };
  }, [token]);
};
