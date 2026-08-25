import { Server as SocketIOServer, Socket } from "socket.io";
import http from "http";
import { env } from "../config/env.js";
import { socketAuth } from "./socketAuth.js";
import { registerTicketSocketEvents } from "./ticketSocket.js";
import {
  markAgentOffline,
  markAgentOnline,
  refreshAgentPresence,
} from "../services/redisPresenceService.js";

// We export the io instance so our future socketEmitter can use it
export let io: SocketIOServer;

export const initializeSocket = (server: http.Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authenticate every incoming connection
  io.use(socketAuth);

  // Handle the connection and attach event listeners
  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    if (user.role === "agent" || user.role === "admin") {
      socket.join("agent_dashboard");
    }

    console.log(
      `[Socket.IO] New connection: ${socket.id} for User: ${user.id}`,
    );

    // Track agent presence in Redis
    let presenceInterval: NodeJS.Timeout | null = null;

    if (user.role === "agent") {
      markAgentOnline(user.id);

      // Refresh presence every 40 seconds
      presenceInterval = setInterval(() => {
        refreshAgentPresence(user.id);
      }, 40000);
    }

    registerTicketSocketEvents(socket);

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Disconnected: ${socket.id}`);

      if (presenceInterval) {
        clearInterval(presenceInterval);
      }

      if (user.role === "agent") {
        markAgentOffline(user.id);
      }
    });
  });
};
