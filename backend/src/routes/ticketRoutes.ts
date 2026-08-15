import express from "express";
import * as ticketController from "../controllers/ticketController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// create ticket
router.post(
  "/",
  authenticate,
  authorize("customer"),
  ticketController.createTicket,
);

// get Customer Tickets
router.post(
  "/my",
  authenticate,
  authorize("customer"),
  ticketController.getCustomerTickets,
);

router.get(
  "/queue",
  authenticate,
  authorize("agent"),
  ticketController.getWaitingTickets,
);

router.post(
  "/assign-next",
  authenticate,
  authorize("agent"),
  ticketController.assignNextTicket,
);

router.patch(
  "/:ticketId/status",
  authenticate,
  authorize("agent", "admin"),
  ticketController.updateTicketStatus,
);

router.patch(
  "/:ticketId/priority",
  authenticate,
  authorize("agent"),
  ticketController.updateTicketPriority,
);

export default router;
