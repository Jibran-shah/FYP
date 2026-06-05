import { verifyAccessToken } from "../utils/token.utils.js";
import { UnauthorizedError, ForbiddenError } from "../errors/index.js";

/**
 * Protect middleware (ID-based version)
 */
export const protect = ({
  requireBaseProfile = false,
  requireProductSeller = false,
  requireServiceProvider = false
} = {}) => {
  
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
        baseProfile: payload.baseProfile || null,
        productSeller: payload.productSeller || null,
        serviceProvider: payload.serviceProvider || null
      };

      /* ======================
         GUARDS
      ====================== */

      if (requireBaseProfile && !req.user.baseProfile) {
        return next(new ForbiddenError("Base profile not complete"));
      }

      if (requireProductSeller && !req.user.productSeller) {
        return next(new ForbiddenError("Not a product seller"));
      }

      if (requireServiceProvider && !req.user.serviceProvider) {
        return next(new ForbiddenError("Not a service provider"));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Role-based authorization middleware
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ForbiddenError("Access forbidden: insufficient permissions")
      );
    }
    next();
  };
};