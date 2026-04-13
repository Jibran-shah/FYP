import User from "../../models/User.model.js";
import crypto from "crypto";

import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  parseExpiresToSeconds
} from "../../utils/auth.tokens.js";

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
  resetOtpAttempts
 } from "../../utils/otp.utils.js";
import { 
  setPasswordResetOtp,
  getPasswordResetOtp
 } from "../../utils/passwordResetOtp.js";
import {
  verifyResetToken,
  generateResetToken
} from "../../utils/passwordReset.tokens.js";

import { emailService } from "../email/email.service.js";

import {
  setEmailVerificationToken,
  getEmailVerificationToken,
  deleteEmailVerificationToken,
  assertEmailVerified,
  checkEmailVerificationCooldown,
  setEmailVerificationCooldown
} from "../../utils/auth.email.utils.js";
import { logger } from "../../config/logger.js";



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

  const ttl = parseExpiresToSeconds(process.env.JWT_REFRESH_EXPIRES);
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
  await saveSession(user._id.toString(), sessionId, refreshToken, ttl);

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
  const ttl = parseExpiresToSeconds(process.env.JWT_REFRESH_EXPIRES);
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



/**
 * Start forgot password flow
 */
export const forgotPasswordService = async (email) => {
  if (!email) throw new BadRequestError("Email is required");

  // 1. check user exists
  const user = await User.findOne({ email });
  if (!user) return; // prevent email enumeration attack

  // 2. rate limit OTP requests
  await checkOtpRequestLimit(email);

  // 3. generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 4. store OTP in Redis (5 min expiry handled inside function)
  await setPasswordResetOtp(email, otp);

  await emailService.sendForgotPasswordEmail({to:email,otp,userName:user.userName,userId:user._id});

  return true;
};



/**
 * Verify OTP and issue reset token
 */
export const verifyResetOtpService = async (email, otp) => {
  if (!email || !otp) throw new Error("Email and OTP required");

  // 1. check attempt limit first
  await checkOtpAttempts(email);

  // 2. get stored OTP
  const storedOtp = await getPasswordResetOtp(email);

  if (!storedOtp) {
    throw new BadRequestError("OTP expired");
  }

  // 3. validate OTP
  if (storedOtp !== otp) {
    await increaseOtpAttempts(email);
    throw new UnauthorizedError("Invalid OTP");
  }

  // 4. success → cleanup attempts + otp
  await resetOtpAttempts(email);

  // 5. generate reset token (JWT)
  const user = await User.findOne({ email });

  if (!user) throw new NotFoundError("User not found");

  const resetToken = generateResetToken(user._id, email);

  return { resetToken };
};




/**
 * Reset user password
 */
export const resetPasswordService = async (resetToken, newPassword) => {
  if (!resetToken || !newPassword) {
    throw new BadRequestError("Token and new password required");
  }

  // 1. verify reset token
  const decoded = verifyResetToken(resetToken);

  const { userId } = decoded;

  // 2. find user
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  user.password = newPassword;
  await user.save();

  // 4. SECURITY: invalidate all sessions
  await deleteAllSessions(userId);

  return true;
};


/**
 * Resend OTP
 */
export const resendResetOtpService = async (email) => {
  if (!email) throw new Error("Email required");

  const user = await User.findOne({ email });
  if (!user) return;

  // same rate limiter as forgot password
  await checkOtpRequestLimit(email);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await setPasswordResetOtp(email, otp);

  await emailService.sendForgotPasswordEmail({to:email,otp,userName:user.userName,userId:user._id})

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



export const sendVerifyEmailService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) throw new NotFoundError("User not found");
  if (user.isEmailVerified) return;

  await checkEmailVerificationCooldown(userId);

  const token = crypto.randomBytes(32).toString("hex");

  await setEmailVerificationToken(userId, token, 1800);

  await setEmailVerificationCooldown(userId, 60);

  const link = `${process.env.FRONTEND_URL}/api/auth/verify-email?userId=${userId}&token=${token}`;

  await emailService.sendVerificationEmail({
    to: user.email,
    userName: user.userName,
    link
  });
};





export const resendVerifyEmailService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) return;
  if (user.isEmailVerified) return;

  await checkEmailVerificationCooldown(userId);

  const token = crypto.randomBytes(32).toString("hex");

  await setEmailVerificationToken(userId, token, 1800);
  await setEmailVerificationCooldown(userId, 60);

  const link = `${process.env.FRONTEND_URL}/verify-email?userId=${userId}&token=${token}`;

  await emailService.sendVerificationEmail({
    to: user.email,
    userName: user.userName,
    link
  });
};