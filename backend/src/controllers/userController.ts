import { Request, Response, NextFunction } from "express";
import * as userService from "../services/userService.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
} from "../validators/authValidator.js";
import logger from "../utils/logger.js";
import { sendAuthResponse } from "../helper/sendAuthResponse.js";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const user = await userService.createUser(validatedData);
   

    return res.status(201).json({
      success: true,
      message: "User registerd successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const createOtpRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await userService.loginVerifyCredentials(validatedData);
    await userService.processLoginOtp(user.email);

    logger.info(`OTP sent to ${user.email}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = verifyOtpSchema.parse(req.body);

    const rawUser = await userService.verifyUserOtp(validatedData);

    const token = await userService.createTokensAndSave(rawUser);

    const safeUser = userService.formatUserResponse(rawUser);

    logger.info(`OTP verified. Login success for ${validatedData.email}`);

    return sendAuthResponse(res, token, safeUser, "Logged in successfully");
  } catch (error) {
    next(error);
  }
};

export const createToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const oldToken = req.cookies?.refreshToken;
    if (!oldToken) throw new ApiError(401, "Refresh token missing");

    const { accessToken, refreshToken, user } =
      await userService.rotateRefreshToken(oldToken);

    return sendAuthResponse(
      res,
      { accessToken, refreshToken },
      user,
      "Token refreshed",
    );
  } catch (error) {
    next(error);
  }
};

export const destroySession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    await userService.logout(userId);

    return res
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      })
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
