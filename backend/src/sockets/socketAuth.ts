import { Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";
import logger from "../utils/logger.js";

export const socketAuth = (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.query.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      logger.warn(
        `Socket connection rejected: Missing token (IP: ${socket.handshake.address})`,
      );
      return next(new Error("Authentication token missing"));
    }

    const user = verifyAccessToken(token);

    socket.data.user = user;

    next();
  } catch (error) {
    logger.error(
      `Socket auth failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    next(new Error("Invalid authentication token"));
  }
};
