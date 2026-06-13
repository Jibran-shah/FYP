import cookie from "cookie";
import { verifyAccessToken } from "../../utils/token.utils.js";

export const socketAuth = (socket, next) => {
  try {
    let token = null;

    // =========================
    // 1. PRIORITY: AUTH FIRST (best practice)
    // =========================
    token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    // =========================
    // 2. COOKIE FALLBACK
    // =========================
    if (!token && socket.handshake.headers?.cookie) {
      const parsed = cookie.parse(socket.handshake.headers.cookie);
      token = parsed.accessToken || parsed.token;
    }

    // =========================
    // 3. VALIDATION
    // =========================
    if (!token || typeof token !== "string") {
      return next(new Error("Unauthorized"));
    }

    // normalize bearer
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    const payload = verifyAccessToken(token);

    if (!payload?.userId) {
      return next(new Error("Unauthorized"));
    }

    // =========================
    // 4. ATTACH USER
    // =========================
    socket.user = {
      id: payload.userId,
      role: payload.role,
      baseProfile: payload.baseProfile || null,
      productSeller: payload.productSeller || null,
      serviceProvider: payload.serviceProvider || null
    };

    // ⚠️ avoid logging full user in production
    // console.log("AUTH SUCCESS:", socket.user.id);

    return next();

  } catch (err) {
    console.error("SOCKET AUTH ERROR:", err.message);
    return next(new Error("Unauthorized"));
  }
};