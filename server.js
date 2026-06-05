import http from "http";
import app from "./app.js";
import { initSocket } from "./realtime/socket.js";

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

const server = http.createServer(app);

// attach websocket layer
initSocket(server);

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});