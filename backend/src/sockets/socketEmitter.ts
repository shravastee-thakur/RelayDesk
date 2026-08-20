import { io } from "./socketServer.js";

export const emitToTicketRoom = (
  ticketId: string,
  event: string,
  data: any,
) => {
  if (io) {
    io.to(`ticket:${ticketId}`).emit(event, data);
  }
};

export const emitToAgentDashboard = (event: string, data: any) => {
  if (io) {
    io.to("agent_dashboard").emit(event, data);
  }
};
