import {
  logoutService,
  logoutAllService,
  register,
  refreshTokenService,
  login,
  verifyEmailService,
  resendVerifyEmailService,
  forgotPasswordService,
  resendResetOtpService,
  verifyResetOtpService,
  resetPasswordService,
  getUserByIdService,
  getMeService
} from "./auth.service.js";

import { setCookie, clearCookie } from "../../utils/cookie.js";
import { parseExpiresToSeconds } from "../../utils/token.utils.js";
import {
  InvalidTokenError,
  UnauthorizedError
} from "../../errors/index.js";
import { AUTH_CONFIG } from "../../config/auth.config.js";

/* =========================================================
   REGISTER
========================================================= */
export const registerUser = async (req, res) => {
  const { userName, email, password } = req.validated?.body;

  const { user, accessToken, refreshToken } = await register(
    userName,
    email,
    password
  );

  setCookie(
    res,
    AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME,
    refreshToken,
    parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY)
  );

  setCookie(
    res,
    AUTH_CONFIG.ACCESS_TOKEN.COOKIE_NAME,
    accessToken,
    parseExpiresToSeconds(AUTH_CONFIG.ACCESS_TOKEN.EXPIRY)
  );

  res.status(201).json({
    success: true,
    message: "Registration successful",
    data: {
      user: {
        userId: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    }
  });
};

/* =========================================================
   LOGIN
========================================================= */
export const loginUser = async (req, res) => {
  const { userName, email, password } = req.validated?.body;

  const { user, accessToken, refreshToken } = await login(
    userName,
    email,
    password
  );

  setCookie(
    res,
    AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME,
    refreshToken,
    parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY)
  );

  setCookie(
    res,
    AUTH_CONFIG.ACCESS_TOKEN.COOKIE_NAME,
    accessToken,
    parseExpiresToSeconds(AUTH_CONFIG.ACCESS_TOKEN.EXPIRY)
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        userId: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        baseProfile: user.baseProfile,
        serviceProvider: user.serviceProvider,
        productSeller: user.productSeller
      }
    }
  });
};

/* =========================================================
   GET ME (SESSION SOURCE OF TRUTH)
========================================================= */
export const getMe = async (req, res) => {
  const user = await getMeService(req.user.id)
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated"
    });
  }

  res.status(200).json({
    success: true,
    message: "Session active",
    data: {
      user: {
        id: user.id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        baseProfile: user.baseProfile,
        serviceProvider: user.serviceProvider,
        productSeller: user.productSeller
      }
    }
  });
};

/* =========================================================
   REFRESH TOKEN
========================================================= */
export const refreshToken = async (req, res) => {
  const refreshTokenCookie = req.cookies.refreshToken;

  console.log("refresh")

  if (!refreshTokenCookie) {
    throw new UnauthorizedError("Refresh token missing");
  }

  const { accessToken, refreshToken } = await refreshTokenService(
    refreshTokenCookie
  );

  setCookie(
    res,
    AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME,
    refreshToken,
    parseExpiresToSeconds(AUTH_CONFIG.REFRESH_TOKEN.EXPIRY)
  );

  setCookie(
    res,
    AUTH_CONFIG.ACCESS_TOKEN.COOKIE_NAME,
    accessToken,
    parseExpiresToSeconds(AUTH_CONFIG.ACCESS_TOKEN.EXPIRY)
  );

  res.status(200).json({
    success: true,
    message: "Token refreshed"
  });
};

/* =========================================================
   LOGOUT
========================================================= */
export const logout = async (req, res) => {
  const refreshTokenCookie = req.cookies.refreshToken;

  if (!refreshTokenCookie) {
    throw new InvalidTokenError("No refresh token found");
  }

  await logoutService(refreshTokenCookie);

  clearCookie(res, AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME);
  clearCookie(res, AUTH_CONFIG.ACCESS_TOKEN.COOKIE_NAME);

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
};

/* =========================================================
   LOGOUT ALL
========================================================= */
export const logoutAll = async (req, res) => {
  const refreshTokenCookie = req.cookies.refreshToken;

  if (!refreshTokenCookie) {
    throw new InvalidTokenError("No refresh token found");
  }

  await logoutAllService(refreshTokenCookie);

  clearCookie(res, AUTH_CONFIG.REFRESH_TOKEN.COOKIE_NAME);
  clearCookie(res, AUTH_CONFIG.ACCESS_TOKEN.COOKIE_NAME);

  res.status(200).json({
    success: true,
    message: "Logged out from all devices"
  });
};

/* =========================================================
   FORGOT PASSWORD
========================================================= */
export const forgotPassword = async (req, res) => {
  const { email } = req.validated?.body;

  await forgotPasswordService(email);

  res.status(200).json({
    success: true,
    message: "OTP sent to email"
  });
};

/* =========================================================
   VERIFY RESET OTP
========================================================= */
export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.validated?.body;

  const { resetToken } = await verifyResetOtpService(email, otp);

  setCookie(
    res,
    AUTH_CONFIG.RESET_TOKEN.COOKIE_NAME,
    resetToken,
    parseExpiresToSeconds(AUTH_CONFIG.RESET_TOKEN.EXPIRY)
  );

  res.status(200).json({
    success: true,
    message: "OTP verified"
  });
};

/* =========================================================
   RESET PASSWORD
========================================================= */
export const resetPassword = async (req, res) => {
  const resetToken = req.cookies?.resetToken;
  const { newPassword } = req.validated?.body;

  if (!resetToken) {
    throw new InvalidTokenError("Reset token missing");
  }

  await resetPasswordService(resetToken, newPassword);

  clearCookie(res, AUTH_CONFIG.RESET_TOKEN.COOKIE_NAME);

  res.status(200).json({
    success: true,
    message: "Password reset successful"
  });
};

/* =========================================================
   RESEND RESET OTP
========================================================= */
export const resendResetOtp = async (req, res) => {
  const { email } = req.validated?.body;

  await resendResetOtpService(email);

  res.status(200).json({
    success: true,
    message: "OTP resent"
  });
};

/* =========================================================
   VERIFY EMAIL
========================================================= */
export const verifyEmail = async (req, res) => {
  const { userId, token } = req.validated?.query;

  if (!token) {
    throw new InvalidTokenError("Verification token missing");
  }

  await verifyEmailService(userId, token);

  res.status(200).json({
    success: true,
    message: "Email verified"
  });
};

/* =========================================================
   RESEND VERIFY EMAIL
========================================================= */
export const resendVerifyEmail = async (req, res) => {
  const userId = req?.user?.id;

  await resendVerifyEmailService(userId);

  res.status(200).json({
    success: true,
    message: "Verification email sent"
  });
};


export const getUserById = async (req,res) =>{

  const {id} = req.validated?.params;

  console.log(id)
  const user = await getUserByIdService(id);

  console.log(user)

  res.status(200).json({
    success:true,
    data:{
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        baseProfile: user.baseProfile,
        serviceProvider: user.serviceProvider,
        productSeller: user.productSeller
      }
    }
  })
}