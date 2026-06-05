import cookie from "cookie";
import { verifyAccessToken } from "../../utils/token.utils.js";

export const socketAuth = (socket, next) => {
  try {
    let token = null;

    // =========================
    // 1. COOKIE EXTRACTION
    // =========================
    const cookies = socket.handshake.headers?.cookie;

    if (cookies) {
      const parsed = cookie.parse(cookies);

      token = parsed.accessToken || parsed.token;
    }

    // =========================
    // 2. FALLBACK (AUTH HEADER)
    // =========================
    if (!token) {
      token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];
    }

    // =========================
    // 3. VALIDATION
    // =========================
    if (!token) {
      return next(new Error("No token provided"));
    }

    // remove "Bearer " if client sends it
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    const payload = verifyAccessToken(token);

    if (!payload?.userId) {
      return next(new Error("Invalid token payload"));
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

    console.log("AUTH SUCCESS:", socket.user);

    next();

  } catch (err) {
    console.error("SOCKET AUTH ERROR:", err.message);
    return next(new Error("Socket authentication failed"));
  }
};