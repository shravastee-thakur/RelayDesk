import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
    auth: { token },
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const joinTicketRoom = (ticketId: string) => {
  socket?.emit("join_ticket", ticketId);
};

export const leaveTicketRoom = (ticketId: string) => {
  socket?.emit("leave_ticket", ticketId);
};
