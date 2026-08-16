import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { tickets } from "../db/schema/ticketSchema.js";

const insertTicketSchema = createInsertSchema(tickets);

export const createTicketSchema = insertTicketSchema
  .pick({
    title: true,
    description: true,
  })
  .extend({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(255, "Title must be under 255 characters")
      .trim(),
    description: z
      .string()
      .min(10, "Please provide more details in your description")
      .trim(),
  });

export const updateTicketStatusSchema = z.object({
  status: z.enum([
    "WAITING",
    "ASSIGNED",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
    "CANCELLED",
  ]),
});

export const updateTicketPrioritySchema = z.object({
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type UpdateTicketPriorityInput = z.infer<
  typeof updateTicketPrioritySchema
>;
