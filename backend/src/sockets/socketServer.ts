import { Server as SocketIOServer, Socket } from "socket.io";
import http from "http";
import { env } from "../config/env.js";
import { socketAuth } from "./socketAuth.js";
import logger from "../utils/logger.js";

// We export the io instance so our future socketEmitter can use it
export let io: SocketIOServer;

export const initializeSocket = (server: http.Server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authenticate every incoming connection
  io.use(socketAuth);

  // Handle the connection and attach event listeners
  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;
    console.log(
      `[Socket.IO] New connection: ${socket.id} for User: ${user.id}`,
    );

    socket.on("join_tickets", (ticketId: string) => {
      const room = `ticket:${ticketId}`;
      socket.join(room);
      logger.info(`[Socket.IO] User ${user.id} joined room ${room}`);
    });

    socket.on("leave_tickets", (ticketId: string) => {
      const room = `ticket:${ticketId}`;
      socket.leave(room);
      console.log(`[Socket.IO] User ${user.id} left room ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket.IO] Disconnected: ${socket.id}`);
    });
  });
};
