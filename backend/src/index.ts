import { env } from "./config/env.js";
import app from "./app.js";
import http from "http";
import { initializeSocket } from "./sockets/socketServer.js";
import logger from "./utils/logger.js";

const server = http.createServer(app);

initializeSocket(server);

const Port = Number(env.PORT);
server.listen(Port, "0.0.0.0", () => {
  logger.info(`Server and Socket.IO running on port: http://localhost:${Port}`);
});
