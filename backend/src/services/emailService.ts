import sendMail from "../config/sendMail.js";
import logger from "../utils/logger.js";

const sendEmailAsync = (to: string, subject: string, htmlContent: string) => {
  sendMail(to, subject, htmlContent).catch((err) => {
    logger.error(`Background email failed for ${to}: ${err.message}`);
  });
};

export const sendLoginOtpEmail = (userEmail: string, otp: string) => {
  const htmlContent = `
    <h2>Login Verification</h2>
    <p>Your OTP for login is:</p>
    <h2 style="font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${otp}</h2>
    <p>This OTP will expire in 5 minutes.</p>
  `;
  sendEmailAsync(userEmail, "Your 2FA Login OTP", htmlContent);
};
