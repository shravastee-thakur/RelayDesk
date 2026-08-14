import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { tickets } from "../db/schema/ticketSchema.js";

const insertTicketSchema = createInsertSchema(tickets);

export const createTicketSchema = insertTicketSchema
  .pick({
    customerId: true,
    title: true,
    description: true,
    priority: true,
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

export const updateTicketSchema = insertTicketSchema
  .pick({
    status: true,
    priority: true,
    agentId: true,
  })
  .partial(); // .partial() makes all these fields optional

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
