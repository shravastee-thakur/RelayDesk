import { env } from "../config/env.js";
import * as userRepo from "../repositories/userRepo.js";
import { UserDocument } from "../repositories/userRepo.js";
import { ApiError } from "../utils/apiError.js";
import { LoginInput, RegisterInput } from "../validators/authValidator.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import * as otpService from "./otpService.js";

const formatUserResponse = (user: UserDocument) => {
  const { password, refreshToken, usedRefreshTokens, ...safeUser } = user;
  return safeUser;
};

export const createUser = async (userData: RegisterInput) => {
  const existingUser = await userRepo.findByEmail(userData.email);
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await userRepo.createUser({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
  });

  return formatUserResponse(user);
};

export const loginVerifyCredentials = async (userData: LoginInput) => {
  const user = await userRepo.findByEmail(userData.email);
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(userData.password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  return formatUserResponse(user);
};

const hashedOtp = (otp: string) => {
  return crypto.createHmac("sha256", env.HMAC_SECRET).update(otp).digest("hex");
};

export const processLoginOtp = async (userEmail: string) => {
  const otp = String(crypto.randomInt(100000, 999999));
  await otpService.saveOtp(userEmail, otp);
  return otp;
};

export const verifyUserOtp = async (
  userId: string,
  userEmail: string,
  otp: string,
) => {
  let user = await userRepo.findByEmail(userEmail);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const inputHash = hashedOtp(otp);

  const isValid = await otpService.consumeOtp(user.email, inputHash);
  if (!isValid) {
    throw new ApiError(401, "Invalid or expired OTP");
  }

  if (!user.isVerified) {
    const updatedUser = await userRepo.updateUser(userId, { isVerified: true });
    user = updatedUser;
  }

  return user;
};
