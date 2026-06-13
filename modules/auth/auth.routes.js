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
  resendVerifyEmail,
  getMe,
  getUserById
} from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { 
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendResetOtpSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resendVerifyEmailSchema,
  paramIdSchema
} from "./auth.validation.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { protect } from "../../middlewares/protect.middleware.js";

const router = express.Router();

/**
 * GET /auth/me
 * Returns current authenticated user
 */
router.get("/me", protect(), asyncHandler(getMe));



router.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(forgotPassword));

router.post("/verify-reset-otp", validate(verifyResetOtpSchema), asyncHandler(verifyResetOtp));

router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(resetPassword));

router.post("/resend-reset-otp", validate(resendResetOtpSchema), asyncHandler(resendResetOtp));

router.get("/verify-email", validate(verifyEmailSchema, "query"), asyncHandler(verifyEmail));

router.post("/resend-verify-email", protect(), asyncHandler(resendVerifyEmail));

// Register
router.post("/register", validate(registerSchema), asyncHandler(registerUser));

// Login
router.post("/login", validate(loginSchema), asyncHandler(loginUser));

// Logout
router.post("/logout", protect(), asyncHandler(logout));

// Logout All
router.post("/logout-all", protect(), asyncHandler(logoutAll));

// Refresh token
router.post("/refresh-token", asyncHandler(refreshToken));

router.get("/:id", protect(), validate(paramIdSchema,"params"), asyncHandler(getUserById));

export default router;