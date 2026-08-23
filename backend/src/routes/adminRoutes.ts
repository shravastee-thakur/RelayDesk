import express from "express";
import * as adminController from "../controllers/adminController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post(
  "/agents",
  authenticate,
  authorize("admin"),
  adminController.createAgent,
);

router.get(
  "/agents",
  authenticate,
  authorize("admin"),
  adminController.getAgents,
);

router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  adminController.getStats,
);

export default router;
