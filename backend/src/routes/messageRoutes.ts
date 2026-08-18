import express from "express";
import * as messageController from "../controllers/ticketMessageController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/:id/messages",
  authenticate,
  authorize("customer", "agent", "admin"),
  messageController.sendMessage,
);

router.get(
  "/:id/messages",
  authenticate,
  authorize("customer", "agent", "admin"),
  messageController.getTicketMessages,
);

export default router;
