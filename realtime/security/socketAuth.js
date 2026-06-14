import cookie from "cookie";
import { verifyAccessToken } from "../../utils/token.utils.js";

export const socketAuth = (socket, next) => {
  try {
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token && socket.handshake.headers?.cookie) {
      const parsed = cookie.parse(socket.handshake.headers.cookie);
      token = parsed.accessToken || parsed.token;
    }

    if (!token || typeof token !== "string") {
      const err = new Error("Unauthorized");
      err.data = { code: "AUTH_FAILED" };
      return next(err);
    }

    const payload = verifyAccessToken(token);

    if (!payload?.userId) {
      const err = new Error("Unauthorized");
      err.data = { code: "INVALID_TOKEN" };
      return next(err);
    }


    socket.data.user = {
      id: payload.userId,
      role: payload.role,
      baseProfile: payload.baseProfile || null,
      productSeller: payload.productSeller || null,
      serviceProvider: payload.serviceProvider || null
    };

    console.log(socket.data.user)

    next();

  } catch (err) {
    const error = new Error("Unauthorized");
    error.data = { code: "AUTH_FAILED" };
    return next(error);
  }
};