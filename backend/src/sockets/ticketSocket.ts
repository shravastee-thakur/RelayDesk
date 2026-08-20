import { Socket } from "socket.io";
import * as messageService from "../services/ticketMessageService.js";
import logger from "../utils/logger.js";
import { io } from "./socketServer.js";
import { verifyTicketAccess } from "../utils/ticketAccess.js";

export const registerTicketSocketEvents = (socket: Socket) => {
  const user = socket.data.user;

  socket.on("join_ticket", async (ticketId: string) => {
    try {
      await verifyTicketAccess(ticketId, user.id, user.role);

      const room = `ticket:${ticketId}`;
      socket.join(room);
      logger.info(`[Socket.IO] User ${user.id} joined room ${room}`);
    } catch (error) {
      logger.error(
        `[Socket.IO] Cannot join ticket: ${(error as Error).message}`,
      );
      socket.emit("socket_error", {
        message: "Cannot join ticket",
      });
    }
  });

  socket.on("leave_ticket", (ticketId: string) => {
    const room = `ticket:${ticketId}`;
    socket.leave(room);
    logger.info(`[Socket.IO] User ${user.id} left room ${room}`);
  });

  socket.on("send_message", async (data) => {
    try {
      const { ticketId, message } = data;

      if (
        !ticketId ||
        !message ||
        message.trim().length === 0 ||
        message.length > 1000
      ) {
        socket.emit("socket_error", { message: "Invalid message" });
        return;
      }

      const savedMessage = await messageService.sendMessage(
        ticketId,
        user.id,
        user.role,
        { message },
      );

      const room = `ticket:${ticketId}`;

      // Customer gets confirmation
      socket.emit("message_sent", savedMessage);

      socket.to(room).emit("new_message", savedMessage);
      logger.info(`[Socket.IO] Message broadcasted to ${room}`);
    } catch (error: any) {
      logger.error(
        `[Socket.IO] send_message error: ${(error as Error).message}`,
      );
      socket.emit("error", {
        message: error.message || "Failed to send message",
      });
    }
  });
};
