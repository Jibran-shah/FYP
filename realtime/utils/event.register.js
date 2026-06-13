const socketWrapper = (handler, guards = []) => {
  return async function (data) {
    const socket = this;

    try {
      // -----------------------------
      // RUN GUARDS (SYNC + ASYNC SAFE)
      // -----------------------------
      for (const guard of guards) {
        await guard(socket, data);
      }

      // -----------------------------
      // MAIN HANDLER
      // -----------------------------
      await handler(socket, data);

    } catch (err) {
      console.error("Socket error:", err.message);

      socket.emit("socket.error", {
        message: err.message || "Something went wrong"
      });
    }
  };
};

export const onEvent = (socket, event, guards = [], handler) => {
  socket.on(event, socketWrapper(handler, guards));
};