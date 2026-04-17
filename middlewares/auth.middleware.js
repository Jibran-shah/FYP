import { verifyAccessToken } from "../utils/token.utils.js";
import { UnauthorizedError, ForbiddenError } from "../errors/index.js";

/**
 * Middleware to protect routes
 * Reads access token from Authorization header: Bearer <token>
 * Attaches decoded payload to req.user
 */


//TODO change it so users with no profile are forced to create profile

export const protect = (options = {}) => {
  
  const { isProfileCompleteCheck = true } = options;

  return (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) throw new UnauthorizedError("Access token missing");

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
      throw new ForbiddenError("Complete your profile first");
    }

    next();
  };
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
