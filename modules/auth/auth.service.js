import User from "../../models/User.model.js";
import crypto from "crypto";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  parseExpiresToSeconds,
  verifyResetToken,
  generateResetToken,
  resetTokenStore,
  generateToken
} from "../../utils/token.utils.js";
import {
  refreshSessionSystem
} from "../../utils/session.utils.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError
} from "../../errors/index.js";
import { 
  generateOtp,
  otpAttempts,
  otpRequests,
  otpStore
 } from "../../utils/otp.utils.js";

import { emailService } from "../email/email.service.js";
import {
  emailVerificationStore
} from "../../utils/email.utils.js";
import { logger } from "../../config/logger.js";
import { AUTH_CONFIG } from "../../config/auth.config.js";
import { USER_PROFILE_STATUS } from "../../constants/user.constants.js";
import { OtpRequestLimitError, OtpTooManyAttemptsError } from "../../errors/Otp.error.js";
import { parseMongoDuplicateError } from "../../utils/errorHandling.utils.js";

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
      password
    });
  } catch (err) {
    const error = parseMongoDuplicateError(err);
    if(error){
      throw new ConflictError(`${error.field} already exists`, [
      {
        field:error.field,
        message:error.message,
      },
    ]);
    }else{
      throw err
    }
  }

  const sessionId = refreshSessionSystem.generateId();
  const accessToken = generateAccessToken({user});
  const refreshToken = generateRefreshToken({user,sessionId});
  const ttl = parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY);
  await refreshSessionSystem.save(user._id, sessionId, refreshToken);

  await emailService.sendVerificationEmail({
    to: user.email,
    name: user.userName,
    userId:user._id
  });


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
  if (email)
    user = await User.findOne({ email }).select("+password")
  else if (userName)
    user = await User.findOne({ userName }).select("+password");

  if(!user) throw new UnauthorizedError("provided identifier not registered");

  if (!user.isEmailVerified) {
    throw new BadRequestError(
      "Please verify your email before logging in",
      {
        userId: user._id,
      }
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new UnauthorizedError("Invalid credentials");

  const sessionId = refreshSessionSystem.generateId();
  const accessToken = generateAccessToken({ user });
  const refreshToken = generateRefreshToken({ user , sessionId });
  const ttl = parseExpiresToSeconds(process.env.JWT_REFRESH_EXPIRES);
  await refreshSessionSystem.save(user._id, sessionId, refreshToken);

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

  const { 
    userId, 
    role, 
    sessionId, 
    baseProfile, 
    productSeller, 
    serviceProvider} = verifyRefreshToken(refreshTokenCookie);

  // 2️⃣ Check Redis for valid session
  const storedToken = await refreshSessionSystem.get(userId, sessionId);

  if (!storedToken)
    throw new UnauthorizedError(
      "Session expired"
    );

  if (storedToken !== refreshTokenCookie)
    throw new UnauthorizedError(
      "Invalid session"
    );

  const user = {
    _id:userId,
    role,
    baseProfile,
    serviceProvider,
    productSeller,
  }

  const newAccessToken = generateAccessToken({ user});

  const newRefreshToken = generateRefreshToken({ user, sessionId });

  const ttl = parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY);
  await refreshSessionSystem.save(userId, sessionId, newRefreshToken);

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
  await refreshSessionSystem.delete(userId, sessionId);
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
  await refreshSessionSystem.deleteAll(userId);
};


export const forgotPasswordService = async (email) => {
  if (!email) throw new BadRequestError("Email is required");
  const user = await User.findOne({ email });
  if (!user) return;
  const userId = user._id.toString();
  await emailService.sendForgotPasswordEmail({
    to: email,
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

  const userId = user._id;

  const count = await otpAttempts.get(userId);

  if ((count ?? 0) >= AUTH_CONFIG.OTP.MAX_ATTEMPTS) {
    throw new OtpTooManyAttemptsError({ userId, count });
  }

  const isValid = await otpStore.verify(userId, otp);

  if (!isValid) {
    await otpAttempts.incr(userId);
    throw new UnauthorizedError("Invalid OTP");
  }

  await  otpStore.delete(userId);
  await otpAttempts.reset(userId);

  const { token } = generateResetToken(userId, email);

  await resetTokenStore.set(userId, token);

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
  const isValid = await resetTokenStore.verify(userId, resetToken);

  if (!isValid) {
    throw new UnauthorizedError("Invalid or expired reset token");
  }

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  user.password = newPassword;
  await user.save();

  await resetTokenStore.delete(userId);
  await refreshSessionSystem.deleteAll(userId);

  return true;
};


export const resendResetOtpService = async (email) => {
  if (!email) throw new BadRequestError("Email required");

  const user = await User.findOne({ email });
  if (!user) throw new NotFoundError("Email not registerred with any account");

  const userId = user._id.toString();

  await otpStore.delete(userId);

  const count = await otpRequests.incr(userId);

  if (count > AUTH_CONFIG.OTP.REQUEST_LIMIT) {
    throw new OtpRequestLimitError({ userId, count });
  }

  const otp = generateOtp();

  await otpStore.set(userId, otp);

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

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found");

  if(!emailVerificationStore.verify(userId,token)){
    throw new UnauthorizedError("Invalid token");
  }

  user.isEmailVerified = true;
  await user.save();
  await emailVerificationStore.delete(userId);
  return true;
};


export const resendVerifyEmailService = async (userId) => {
  console.log()
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User Not found");
  //if (user.isEmailVerified) throw new BadRequestError("Email already verified");
  await emailService.sendVerificationEmail({
    to: user.email,
    name: user.userName,
    userId
  });
};



export const getUserByIdService = async (id) => {
  const user = await User.findById(id);
  return user;
}


export const getMeService = async (id) => {
  const user = await User.findById(id);
  return user;
}
