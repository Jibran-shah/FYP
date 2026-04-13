import { 
  logoutService, 
  logoutAllService, 
  register,
  refreshTokenService,
  login,
  verifyEmailService,          // ✅ added
  resendVerifyEmailService,     // ✅ added
  forgotPasswordService,
  resendResetOtpService,
  verifyResetOtpService,
  resetPasswordService
} from "./auth.service.js";

import { 
  setCookie,
  clearCookie,
  parseExpiresToSeconds,
} from "../../utils/index.js";

import { InvalidTokenError, UnauthorizedError } from "../../errors/index.js";


/**
 * Register User Controller
 */
export const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  const { user, accessToken, refreshToken } = await register(userName, email, password);

  const refreshTtlSeconds = parseExpiresToSeconds(process.env.JWT_REFRESH_EXPIRES);
  setCookie(res, "refreshToken", refreshToken, refreshTtlSeconds);

  const accessTtlSeconds = parseExpiresToSeconds(process.env.JWT_ACCESS_EXPIRES);
  setCookie(res, "accessToken", accessToken, accessTtlSeconds);

  res.status(201).json({
    success: true,
    message: "User registered successfully. Please verify your email.", // ✅ updated message
    data: {
      userId:user._id,
      userName,
      email: user.email,
      role: user.role
    },
  });
};


/**
 * Login User Controller
 */
export const loginUser = async (req, res) => {
  const { userName, email, password } = req.body;

  const { user, accessToken, refreshToken } = await login(userName, email, password);

  const refreshTtlSeconds = parseExpiresToSeconds(process.env.JWT_REFRESH_EXPIRES);
  setCookie(res, "refreshToken", refreshToken, refreshTtlSeconds);

  const accessTtlSeconds = parseExpiresToSeconds(process.env.JWT_ACCESS_EXPIRES);
  setCookie(res, "accessToken", accessToken, accessTtlSeconds);

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: {
      userName,
      email: user.email,
      role: user.role
    },
  });
};



/**
 * Refresh access token controller
 */
export const refreshToken = async (req, res) => {
  const refreshTokenCookie = req.cookies.refreshToken;

  if (!refreshTokenCookie) throw new UnauthorizedError("Refresh token missing");

  const { accessToken, refreshToken } = await refreshTokenService(refreshTokenCookie);

  const refreshTtlSeconds = parseExpiresToSeconds(process.env.JWT_REFRESH_EXPIRES);
  setCookie(res, "refreshToken", refreshToken, refreshTtlSeconds);

  const accessTtlSeconds = parseExpiresToSeconds(process.env.JWT_ACCESS_EXPIRES);
  setCookie(res, "accessToken", accessToken, accessTtlSeconds);

  res.json({
    success: true,
    message: "Token refreshed successfully"
  });
};



/**
 * Logout current session
 */
export const logout = async (req, res) => {
  const refreshTokenCookie = req.cookies.refreshToken;
  if (!refreshTokenCookie) throw new InvalidTokenError("No refresh token found");

  await logoutService(refreshTokenCookie);

  clearCookie(res, "refreshToken");
  clearCookie(res, "accessToken");

  res.json({ success: true, message: "Logged out from current session" });
};


/**
 * Logout all devices
 */
export const logoutAll = async (req, res) => {
  const refreshTokenCookie = req.cookies.refreshToken;

  if (!refreshTokenCookie) throw new InvalidTokenError("No refresh token found");

  await logoutAllService(refreshTokenCookie);

  clearCookie(res, "refreshToken");
  clearCookie(res, "accessToken");

  res.json({ success: true, message: "Logged out from all devices" });
};


/**
 * Send otp for changing password
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  await forgotPasswordService(email);

  res.status(200).json({
    success: true,
    message: "OTP sent to email",
  });
};


export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  const { resetToken } = await verifyResetOtpService(email, otp);

  const resetTtlSeconds = parseExpiresToSeconds(process.env.JWT_RESET_EXPIRES)
  setCookie(res, "resetToken", resetToken, resetTtlSeconds);

  res.status(200).json({
    success: true,
    message: "OTP verified successfully"
  });
};


export const resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;

  await resetPasswordService(resetToken, newPassword);

  res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
};


export const resendResetOtp = async (req, res) => {
  const { email } = req.body;

  await resendResetOtpService(email);

  res.status(200).json({
    success: true,
    message: "OTP resent successfully",
  });
};




/**
 * Verify Email Controller (via token link)
 * Example: GET /verify-email?token=abc123
 */
export const verifyEmail = async (req, res) => {
  const { userId,token } = req.query;

  if (!token) {
    throw new InvalidTokenError("Verification token missing");
  }

  await verifyEmailService(userId, token);

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
};



/**
 * Resend Verification Email
 */
export const resendVerifyEmail = async (req, res) => {
  const { userId } = req.body;

  await resendVerifyEmailService(userId);

  res.status(200).json({
    success: true,
    message: "Verification email resent successfully",
  });
};