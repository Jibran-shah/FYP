import { UnauthorizedError, ForbiddenError } from "../../errors/index.js";

/*
=====================================================
BASE AUTH GUARD
=====================================================
*/
export const requireAuth = (socket) => {
  if (!socket.user?.id) {
    throw new UnauthorizedError("Authentication required");
  }
};

/*
=====================================================
ROLE GUARDS
=====================================================
*/
export const requireRole = (roles = []) => {
  return (socket) => {
    requireAuth(socket);

    if (!roles.includes(socket.user.role)) {
      throw new ForbiddenError("Insufficient permissions");
    }
  };
};

/*
=====================================================
PROFILE GUARDS
=====================================================
*/
export const requireBaseProfile = (socket) => {
  requireAuth(socket);

  if (!socket.user.baseProfile) {
    throw new ForbiddenError("Base profile required");
  }
};

export const requireSellerProfile = (socket) => {
  requireAuth(socket);

  if (!socket.user.productSeller) {
    throw new ForbiddenError("Product seller profile required");
  }
};

export const requireServiceProviderProfile = (socket) => {
  requireAuth(socket);

  if (!socket.user.serviceProvider) {
    throw new ForbiddenError("Service provider profile required");
  }
};

/*
=====================================================
COMBINED GUARDS
=====================================================
*/
export const requireAnyProfile = (socket) => {
  requireAuth(socket);

  if (
    !socket.user.baseProfile &&
    !socket.user.productSeller &&
    !socket.user.serviceProvider
  ) {
    throw new ForbiddenError("User profile required");
  }
};

export const requireSellerOrProvider = (socket) => {
  requireAuth(socket);

  if (
    !socket.user.productSeller &&
    !socket.user.serviceProvider
  ) {
    throw new ForbiddenError(
      "Seller or service provider profile required"
    );
  }
};

/*
=====================================================
HELPER
=====================================================
*/
export const combineGuards = (...guards) => {
  return (socket) => {
    for (const guard of guards) {
      guard(socket);
    }
  };
};