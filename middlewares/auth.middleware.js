import { verifyAccessToken } from "../utils/index.js";
import { UnauthorizedError, ForbiddenError } from "../errors/index.js";

/**
 * Middleware to protect routes
 * Reads access token from Authorization header: Bearer <token>
 * Attaches decoded payload to req.user
 */


//TODO change it so users with no profile are forced to create profile


export const protect = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token)
    throw new UnauthorizedError("Access token missing");

  // Verify token
  const payload = verifyAccessToken(token);

  // Attach user info to request
  req.user = {
    id: payload.userId,
    role: payload.role,
    profileStatus: payload.profileStatus
  };

  if (req.user.profileStatus === "INCOMPLETE") {
    throw new ForbiddenError("Complete your profile first");
  }

  next();
};



/**
 * Role-based authorization middleware
 * Usage: restrictTo("admin") or restrictTo("admin", "moderator")
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError("Access forbidden: insufficient permissions");
    }
    next();
  };
};
