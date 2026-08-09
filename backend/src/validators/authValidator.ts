import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../db/schema/userSchema.js";

const insertUserSchema = createInsertSchema(users);

export const registerSchema = insertUserSchema
  .pick({
    name: true,
    email: true,
    password: true,
  })
  .extend({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(255, "Name must be under 255 characters")
      .trim(),
    email: z
      .string()
      .email("Invalid email format")
      .max(255, "Email must be under 255 characters")
      .trim(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password must be under 128 characters")
      .trim(),
  });

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
