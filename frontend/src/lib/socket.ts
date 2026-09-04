import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let socket: Socket | null = null;
let onConnectCallback: (() => void) | null = null;
const joinedRooms: Set<string> = new Set();

export const getSocket = () => socket;

export const setOnConnectCallback = (callback: () => void) => {
  onConnectCallback = callback;
};

export const connectSocket = (token: string) => {
  if (socket?.connected) return socket;

  socket = io(API_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket?.id);

    // Rejoin all previously joined rooms
    joinedRooms.forEach((ticketId) => {
      console.log("[Socket] Rejoining room:", ticketId);
      socket?.emit("join_ticket", ticketId);
    });

    if (onConnectCallback) {
      onConnectCallback();
    }
  });

  socket.on("disconnect", (reason) =>
    console.log("[Socket] Disconnected:", reason),
  );

  socket.on("connect_error", (err) =>
    console.error("[Socket] Error:", err.message),
  );

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
  onConnectCallback = null;
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
