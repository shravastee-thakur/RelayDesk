import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema/userSchema.js";

export type UserDocument = typeof users.$inferSelect;
export type BaseData = typeof users.$inferInsert;

export type CreateUserData = Pick<BaseData, "name" | "email" | "password"> & {
  role?: "admin" | "customer" | "agent";
};

export type UpdateUserData = Partial<BaseData>;

export const findByEmail = async (
  email: string,
): Promise<UserDocument | null> => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
};

export const findById = async (
  id: string,
): Promise<UserDocument | null> => {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
};

export const createUser = async (
  userData: CreateUserData,
): Promise<UserDocument> => {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
};

export const updateUser = async (
  id: string,
  userData: UpdateUserData,
): Promise<UserDocument | null> => {
  // early return check for empty userData

  if (Object.keys(userData).length === 0) {
    return findById(id);
  }

  const [user] = await db
    .update(users)
    .set(userData)
    .where(eq(users.id, id))
    .returning();

  return user;
};
