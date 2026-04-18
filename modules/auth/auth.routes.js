import express from "express";
import { 
  registerUser, 
  loginUser, 
  refreshToken, 
  logout, 
  logoutAll, 
  forgotPassword, 
  verifyResetOtp, 
  resetPassword, 
  resendResetOtp,
  verifyEmail,
  resendVerifyEmail
} from "./auth.controller.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { 
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendResetOtpSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resendVerifyEmailSchema
} from "./auth.validation.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(forgotPassword));

router.post("/verify-reset-otp", validate(verifyResetOtpSchema), asyncHandler(verifyResetOtp));

router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(resetPassword));

router.post("/resend-reset-otp", validate(resendResetOtpSchema), asyncHandler(resendResetOtp));

router.get("/verify-email", validate(verifyEmailSchema, "query"), asyncHandler(verifyEmail));

router.post("/resend-verify-email", protect({ isProfileCompleteCheck: false }), validate(resendVerifyEmailSchema), asyncHandler(resendVerifyEmail));

// Register
router.post("/register", validate(registerSchema), asyncHandler(registerUser));

// Login
router.post("/login", validate(loginSchema), asyncHandler(loginUser));

// Logout
router.post("/logout", protect({ isProfileCompleteCheck: false }), asyncHandler(logout));

// Logout All
router.post("/logout-all", protect({ isProfileCompleteCheck: false }), asyncHandler(logoutAll));

// Refresh token
router.get("/refresh-token", protect({ isProfileCompleteCheck: false }), asyncHandler(refreshToken));

export default router;