import { verifyAccessToken } from "../utils/token.utils.js";
import { UnauthorizedError, ForbiddenError } from "../errors/index.js";

/**
 * Middleware to protect routes
 * Reads access token from Authorization header: Bearer <token>
 * Attaches decoded payload to req.user
 */
export const protect = (options = {}) => {
  const { isProfileCompleteCheck = true } = options;

  return (req, res, next) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new UnauthorizedError("Access token missing"));
      }

      const payload = verifyAccessToken(token);

      req.user = {
        id: payload.userId,
        role: payload.role,
        profileStatus: payload.profileStatus
      };

      if (
        isProfileCompleteCheck &&
        req.user.profileStatus === "INCOMPLETE"
      ) {
        return next(new ForbiddenError("Complete your profile first"));
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
};

/**
 * Role-based authorization middleware
 * Usage: restrictTo("admin") or restrictTo("admin", "moderator")
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError("Access forbidden: insufficient permissions"));
    }
    next();
  };
};
