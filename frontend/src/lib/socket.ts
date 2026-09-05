import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

let socket: Socket | null = null;
const joinedRooms: Set<string> = new Set();

export const getSocket = () => socket;

export const connectSocket = (token: string) => {
  if (socket) return socket;

  socket = io(API_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id);
    joinedRooms.forEach((ticketId) => {
      socket?.emit("join_ticket", ticketId);
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  // Cleanup socket when Vite hot-reloads the module
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      disconnectSocket();
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  joinedRooms.clear();
};

export const joinTicketRoom = (ticketId: string) => {
  joinedRooms.add(ticketId);
  socket?.emit("join_ticket", ticketId);
};

export const leaveTicketRoom = (ticketId: string) => {
  joinedRooms.delete(ticketId);
  socket?.emit("leave_ticket", ticketId);
};
