import express from "express";
import * as ticketController from "../controllers/ticketController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();
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

router.get(
  "/:id",
  authenticate,
  authorize("customer"),
  ticketController.getCustomerTicketDetails,
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("agent", "customer", "admin"),
  ticketController.updateTicketStatus,
);

router.patch(
  "/:ticketId/cancel",
  authenticate,
  authorize("customer"),
  ticketController.cancelTicket,
);

router.patch(
  "/:id/priority",
  authenticate,
  authorize("agent", "admin"),
  ticketController.updateTicketPriority,
);

export default router;
