import express from "express";
import * as ticketController from "../controllers/ticketController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Customer Routes
router.post(
  "/",
  authenticate,
  authorize("customer"),
  ticketController.createTicket,
);
router.get(
  "/my",
  authenticate,
  authorize("customer"),
  ticketController.getCustomerTickets,
);

// Agent/Admin Queue & Assignment
router.get(
  "/queue",
  authenticate,
  authorize("agent", "admin"),
  ticketController.getWaitingTickets,
);
router.post(
  "/assign-next",
  authenticate,
  authorize("agent"),
  ticketController.assignNextTicket,
);

// Agent Dashboard Routes
router.get(
  "/agent/active",
  authenticate,
  authorize("agent"),
  ticketController.getActiveAgentTickets,
);
router.get(
  "/agent/history",
  authenticate,
  authorize("agent"),
  ticketController.getAgentTickets,
); // <-- Added here!

// Get Specific Ticket
router.get(
  "/:id",
  authenticate,
  authorize("customer"),
  ticketController.getCustomerTicketDetails,
);

// Explicit Actions
router.patch(
  "/:id/start",
  authenticate,
  authorize("agent"),
  ticketController.startTicket,
);
router.patch(
  "/:id/resolve",
  authenticate,
  authorize("agent"),
  ticketController.resolveTicket,
);
router.patch(
  "/:id/close",
  authenticate,
  authorize("customer", "agent", "admin"),
  ticketController.closeTicket,
);
router.patch(
  "/:id/cancel",
  authenticate,
  authorize("customer"),
  ticketController.cancelTicket,
);

// Generic Updates
router.patch(
  "/:id/status",
  authenticate,
  authorize("agent", "admin"),
  ticketController.updateTicketStatus,
);
router.patch(
  "/:id/priority",
  authenticate,
  authorize("agent", "admin"),
  ticketController.updateTicketPriority,
);

export default router;
