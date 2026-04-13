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

import { validate } from "../../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { protect } from "../../middlewares/auth.middleware.js";


const router = express.Router();

// Register
router.post("/register", validate(registerSchema), asyncHandler(registerUser));

// Login
router.post("/login", validate(loginSchema), asyncHandler(loginUser));

// Logout
router.post("/logout", protect, asyncHandler(logout));

// Logout All
router.post("/logout-all", protect, asyncHandler(logoutAll));

// Refresh token
router.get("/refresh-token", protect, asyncHandler(refreshToken));

// Forgot Password
router.post("/forgot-password", asyncHandler(forgotPassword));

// Verify Reset OTP
router.post("/verify-reset-otp", asyncHandler(verifyResetOtp));

// Reset Password
router.post("/reset-password", asyncHandler(resetPassword));

// Resend Reset OTP
router.post("/resend-reset-otp", asyncHandler(resendResetOtp));

router.get("/verify-email", asyncHandler(verifyEmail));

router.post("/resend-verify-email", asyncHandler(resendVerifyEmail));

export default router;