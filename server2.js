import http from "http";
import app from "./app.js";
import { initSocket } from "./realtime/socket.js";

const PORT = 5001;

const server = http.createServer(app);

// attach websocket layer
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});