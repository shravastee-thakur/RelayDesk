import express from "express";
import * as userController from "../controllers/userController.js";
import { rateLimiterMiddleware } from "../middlewares/rateLimiter.js";
import { securityMiddleware } from "../middlewares/securityMiddleware.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Register
router.post("/", rateLimiterMiddleware(3, 60), userController.createUser);

// Login step one
router.post(
  "/otp-requests",
  securityMiddleware,
  rateLimiterMiddleware(3, 60),
  userController.createOtpRequest,
);

// Verify otp (Login)
router.post(
  "/sessions",
  securityMiddleware,
  rateLimiterMiddleware(5, 60),
  userController.createSession,
);

// Refresh
router.post("/tokens", userController.createToken);

// Logout
router.delete("/sessions", authenticate, userController.destroySession);

export default router;
