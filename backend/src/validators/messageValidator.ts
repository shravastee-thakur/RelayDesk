import { z } from "zod";

export const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message is too long")
    .trim(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
