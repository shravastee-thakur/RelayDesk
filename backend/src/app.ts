import { env } from "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import userRoute from "./routes/userRoutes.js";
import ticketRoute from "./routes/ticketRoutes.js";
import messageRoute from "./routes/messageRoutes.js";

import { errorHandler } from "./middlewares/errorMiddleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Routes
app.use("/api/users", userRoute);
// http://localhost:3000/api/users/

app.use("/api/tickets", ticketRoute);
// http://localhost:3000/api/tickets/

app.use("/api/tickets", messageRoute);
// http://localhost:3000/api/tickets/:ticketId/messages

app.use(errorHandler);

export default app;
