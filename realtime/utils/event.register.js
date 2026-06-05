const socketWrapper = (handler, guards = []) => {
  return async function (data) {
    const socket = this;

    try {
      for (const guard of guards) {
        guard(socket);
      }

      await handler(socket, data);

    } catch (err) {
      console.error("Socket error:", err.message);

      socket.emit("error", {
        message: err.message || "Something went wrong"
      });
    }
  };
};


export const onEvent = (socket, event, guards, handler) => {
  socket.on(event, socketWrapper(handler, guards).bind(socket));
};