import { env } from "../config/env.js";
import * as userRepo from "../repositories/userRepo.js";
import { UserDocument } from "../repositories/userRepo.js";
import { ApiError } from "../utils/apiError.js";
import {
  CreateAgentInput,
  LoginInput,
  RegisterInput,
  VerifyOtpInput,
} from "../validators/authValidator.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import * as otpService from "./otpService.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import * as emailService from "./emailService.js";

export type SafeUser = Omit<
  UserDocument,
  "password" | "refreshToken" | "usedRefreshTokens"
>;

export const formatUserResponse = (user: UserDocument): SafeUser => {
  const { password, refreshToken, usedRefreshTokens, ...safeUser } = user;
  return safeUser;
};

export const createUser = async (
  userData: RegisterInput,
): Promise<SafeUser> => {
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

export const createAgent = async (
  agentData: CreateAgentInput,
): Promise<SafeUser> => {
  const existingUser = await userRepo.findByEmail(agentData.email);
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(agentData.password, 10);

  const user = await userRepo.createUser({
    name: agentData.name,
    email: agentData.email,
    password: hashedPassword,
    role: "agent",
  });

  return formatUserResponse(user);
};

export const loginVerifyCredentials = async (
  userData: LoginInput,
): Promise<UserDocument> => {
  const user = await userRepo.findByEmail(userData.email);
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(userData.password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  return user;
};

const hashedOtp = (otp: string) => {
  return crypto.createHmac("sha256", env.HMAC_SECRET).update(otp).digest("hex");
};

export const processLoginOtp = async (userEmail: string) => {
  const otp = String(crypto.randomInt(100000, 999999));
  await otpService.saveOtp(userEmail, hashedOtp(otp));
  emailService.sendLoginOtpEmail(userEmail, otp);
};

export const verifyUserOtp = async (
  verifyData: VerifyOtpInput,
): Promise<UserDocument> => {
  let user = await userRepo.findByEmail(verifyData.email);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const inputHash = hashedOtp(verifyData.otp);

  const isValid = await otpService.consumeOtp(user.email, inputHash);
  if (!isValid) {
    throw new ApiError(401, "Invalid or expired OTP");
  }

  if (!user.isVerified) {
    const updatedUser = await userRepo.updateUser(user.id, {
      isVerified: true,
    });

    if (!updatedUser) {
      throw new ApiError(500, "Failed to update user verification status");
    }
    user = updatedUser;
  }

  return user;
};

export const createTokensAndSave = async (
  user: UserDocument,
  oldHashedToken?: string,
) => {
  let tokenPayload = {
    id: user.id,
    role: user.role,
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  const hashedNewRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const updateQuery: any = {
    refreshToken: hashedNewRefreshToken,
  };

  if (oldHashedToken) {
    updateQuery.usedRefreshTokens = [
      ...(user.usedRefreshTokens || []),
      oldHashedToken,
    ];
  }

  await userRepo.updateUser(user.id, updateQuery);

  return { accessToken, refreshToken };
};

export const rotateRefreshToken = async (oldToken: string) => {
  let decoded;

  try {
    decoded = verifyRefreshToken(oldToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await userRepo.findById(decoded.id);
  if (!user) throw new ApiError(404, "User not found");

  const hashedIncomingToken = crypto
    .createHash("sha256")
    .update(oldToken)
    .digest("hex");

  if (
    user.usedRefreshTokens &&
    user.usedRefreshTokens.includes(hashedIncomingToken)
  ) {
    await userRepo.updateUser(user.id, {
      refreshToken: "",
      usedRefreshTokens: [],
    });
    throw new ApiError(
      403,
      "Security Alert: Token reuse detected. Please log in again.",
    );
  }

  const storedBuffer = Buffer.from(user.refreshToken || "", "hex");
  const hashBuffer = Buffer.from(hashedIncomingToken, "hex");

  const isMatch =
    storedBuffer.length === hashBuffer.length &&
    crypto.timingSafeEqual(storedBuffer, hashBuffer);

  if (!isMatch) {
    throw new ApiError(401, "Refresh token mismatch");
  }

  const { accessToken, refreshToken } = await createTokensAndSave(
    user,
    hashedIncomingToken,
  );

  return { accessToken, refreshToken, user: formatUserResponse(user) };
};

export const logout = async (userId: string) => {
  if (!userId) return;

  await userRepo.updateUser(userId, { refreshToken: "" });
};

export const getAllAgents = async () => {
  return userRepo.findAllAgents();
};
