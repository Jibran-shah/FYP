const socketWrapper = (handler, guards = []) => {
  return async function (data = {}) {
    const socket = this;

    try {

      // --------------------------------
      // CONNECTION READY CHECK
      // --------------------------------
      if (socket.data.ready === false) {
        socket.emit("connection.not_ready");
        return;
      }

      // --------------------------------
      // BASIC PAYLOAD VALIDATION
      // --------------------------------
      if (typeof data !== "object" || data === null) {
        throw Object.assign(
          new Error("Invalid payload"),
          { code: "INVALID_PAYLOAD" }
        );
      }

      // --------------------------------
      // RUN GUARDS
      // --------------------------------
      for (const guard of guards) {
        await guard(socket, data);
      }

      // --------------------------------
      // MAIN HANDLER
      // --------------------------------
      await handler(socket, data);

    } catch (err) {

      console.error("Socket error:", err);

      socket.emit("socket.error", {
        code: err.code || "INTERNAL_ERROR",
        message: "Something went wrong"
      });
    }
  };
};

export const onEvent = (
  socket,
  event,
  guards = [],
  handler
) => {
  socket.on(
    event,
    socketWrapper(handler, guards)
  );
};