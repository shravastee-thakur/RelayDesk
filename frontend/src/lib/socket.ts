import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let socket: Socket | null = null;

export const getSocket = () => socket;

export const connectSocket = (token: string) => {
  if (socket?.connected) return socket;

  socket = io(API_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => console.log("[Socket] Connected:", socket?.id));
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
};
