import User from "../../models/User.model.js";
import crypto from "crypto";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  parseExpiresToSeconds,
  verifyResetToken,
  generateResetToken,
  storeResetToken,
  verifyStoredResetToken,
  deleteResetToken
} from "../../utils/token.utils.js";
import {
  generateSessionId,
  saveSession,
  getSession,
  deleteAllSessions,
  deleteSession
} from "../../utils/session.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError
} from "../../errors/index.js";
import { 
  checkOtpRequestLimit,
  increaseOtpAttempts,
  checkOtpAttempts,
  resetOtpAttempts,
  generateOtp
 } from "../../utils/otp.utils.js";

 import {
  setOtp,
  verifyOtp,
  deleteOtp
} from "../../utils/otp.utils.js";

import { emailService } from "../email/email.service.js";
import {
  setEmailVerificationToken,
  getEmailVerificationToken,
  deleteEmailVerificationToken,
  assertEmailVerified,
  checkEmailVerificationCooldown,
  setEmailVerificationCooldown,
  generateToken,
  generateVerificationLink
} from "../../utils/email.utils.js";
import { logger } from "../../config/logger.js";
import { AUTH_CONFIG } from "../../config/auth.config.js";
import { emailConfig } from "../../utils/config.utils.js";

/**
 * Register a new user and create session
 * @param {string} email
 * @param {string} password
 * @returns {object} { user, accessToken, refreshToken, sessionId }
 */
export const register = async (userName, email, password) => {
  let user;

  try {
    user = await User.create({
      userName,
      email,
      password,
      profileStatus: "INCOMPLETE"
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new ConflictError("Email or username already exists");
    }
    throw err;
  }

  const sessionId = generateSessionId();

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role, sessionId);

  const ttl = parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY);
  await saveSession(user._id.toString(), sessionId, refreshToken, ttl);

  // ✅ non-blocking email
  sendVerifyEmailService(user._id)
  .catch(err => logger.error("Verification email failed:",err));

  return { user, accessToken, refreshToken, sessionId };
};


/**
 * Login a user
 * @param {string} email
 * @param {string} password
 * @returns {Object} { user, accessToken, refreshToken, sessionId }
 */
export const login = async (userName,email, password) => {

  if(!email&&!userName) throw new UnauthorizedError("must provide either userName or email")

  let user;

  if (email) {
    user = await User.findOne({ email }).select("+password");
  } else if (userName) {
    user = await User.findOne({ userName }).select("+password");
  }
  if (!user) throw new UnauthorizedError("Invalid credentials");

  assertEmailVerified(user);

  // 2️⃣ Compare password

  const isMatch = await user.comparePassword(password);

  if (!isMatch) throw new UnauthorizedError("Invalid credentials");

  const sessionId = generateSessionId();
  // 3️⃣ Generate access token
  const accessToken = generateAccessToken( user._id, user.role,user.profileStatus );
  // 4️⃣ Generate refresh token
  const refreshToken = generateRefreshToken( user._id,user.role, sessionId,user.profileStatus);

  // 5️⃣ Store refresh token in Redis with TTL
  const ttl = parseExpiresToSeconds(process.env.JWT_REFRESH_EXPIRES);
  await saveSession(user._id, sessionId, refreshToken, ttl);

  // 6️⃣ Return data
  return { user, accessToken, refreshToken};
};




/**
 * Refresh Token Service
 * @param {string} refreshTokenCookie
 * @returns {Object} { accessToken, refreshToken, sessionId, userId }
 */
export const refreshTokenService = async (refreshTokenCookie) => {
if (!refreshTokenCookie)
    throw new UnauthorizedError(
      "Refresh token missing"
    );

  // 1️⃣ Verify refresh token
  const { userId, role, sessionId,profileStatus } = verifyRefreshToken(refreshTokenCookie);

  // 2️⃣ Check Redis for valid session
  const storedToken = await getSession(userId, sessionId);


  if (!storedToken)
    throw new UnauthorizedError(
      "Session expired"
    );

  if (storedToken !== refreshTokenCookie)
    throw new UnauthorizedError(
      "Invalid session"
    );

  // 3️⃣ Generate new tokens
  const newAccessToken = generateAccessToken(userId,role,profileStatus); // add role if needed
  const newRefreshToken = generateRefreshToken(userId,role, sessionId,profileStatus );

  // 4️⃣ Store new refresh token in Redis (rotate token)
  const ttl = parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY);
  await saveSession(userId, sessionId, newRefreshToken, ttl);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};



/**
 * Logout from current session
 * @param {string} refreshTokenCookie
 */
export const logoutService = async (refreshTokenCookie) => {
  if (!refreshTokenCookie)
      throw new UnauthorizedError(
        "Refresh token missing"
      );
  const payload = verifyRefreshToken(refreshTokenCookie);
  const {userId,sessionId} = payload;
  await deleteSession(userId, sessionId);
};

/**
 * Logout from all sessions
 * @param {string} refreshTokenCookie
 */
export const logoutAllService = async (refreshTokenCookie) => {
  if (!refreshTokenCookie)
    throw new UnauthorizedError(
      "Refresh token missing"
    );
  const {userId} = verifyRefreshToken(refreshTokenCookie);
  await deleteAllSessions(userId);
};
export const forgotPasswordService = async (email) => {
  if (!email) throw new BadRequestError("Email is required");

  const user = await User.findOne({ email });
  if (!user) return;

  const userId = user._id.toString();

  await checkOtpRequestLimit(userId);

  const otp = generateOtp();

  await setOtp(userId, otp);

  await emailService.sendForgotPasswordEmail({
    to: email,
    otp,
    userName: user.userName,
    userId,
  });

  return true;
};

export const verifyResetOtpService = async (email, otp) => {
  if (!email || !otp)
    throw new BadRequestError("Email and OTP required");

  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("User not found");

  const userId = user._id.toString();

  await checkOtpAttempts(userId);

  const isValid = await verifyOtp(userId, otp);

  if (!isValid) {
    await increaseOtpAttempts(userId);
    throw new UnauthorizedError("Invalid OTP");
  }

  await deleteOtp(userId);
  await resetOtpAttempts(userId);

  const { token } = generateResetToken(userId, email);

  await storeResetToken(userId, token);

  return { resetToken: token };
};

export const resetPasswordService = async (resetToken, newPassword) => {
  if (!resetToken || !newPassword) {
    throw new BadRequestError("Token and password required");
  }

  const decoded = verifyResetToken(resetToken);

  if (!decoded || !decoded.userId) {
    throw new UnauthorizedError("Invalid reset token payload");
  }

  const userId = decoded.userId.toString();
  const isValid = await verifyStoredResetToken(userId, resetToken);

  if (!isValid) {
    throw new UnauthorizedError("Invalid or expired reset token");
  }

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  user.password = newPassword;
  await user.save();

  await deleteResetToken(userId);
  await deleteAllSessions(userId);

  return true;
};

export const resendResetOtpService = async (email) => {
  if (!email) throw new BadRequestError("Email required");

  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("Email not registerred with any account");

  const userId = user._id.toString();

  await deleteOtp(userId);

  await checkOtpRequestLimit(userId);

  const otp = generateOtp();

  await setOtp(userId, otp);

  await emailService.sendForgotPasswordEmail({
    to: email,
    otp,
    userName: user.userName,
    userId,
  });

  return true;
};


export const verifyEmailService = async (userId, token) => {
  if (!userId || !token)
    throw new BadRequestError("Missing verification data");

  const storedToken = await getEmailVerificationToken(userId);

  if (!storedToken)
    throw new UnauthorizedError("Token expired or invalid");

  if (storedToken !== token)
    throw new UnauthorizedError("Invalid token");

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  user.isEmailVerified = true;
  await user.save();

  await deleteEmailVerificationToken(userId);

  return true;
};


export const resendVerifyEmailService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) return;
  if (user.isEmailVerified) return;

  await checkEmailVerificationCooldown(userId);

  const token = generateToken();

  await setEmailVerificationToken(userId, token, emailVerifyTTL());
  
  await setEmailVerificationCooldown(userId, emailVerifyCooldown());

  const link = generateVerificationLink(userId,token);

  await emailService.sendVerificationEmail({
    to: user.email,
    userName: user.userName,
    link
  });
};