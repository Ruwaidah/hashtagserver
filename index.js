import app from "./api/server.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";
import UserState from "./usersdata.js";
import User from "./models/user_model.js";

dotenv.config();

const server = http.createServer(app);

// const io = socketIo(server, {
//   cors: {
//     origin: process.env.URL,
//   },
// });
const io = new Server(server, {
  cors: {
    origin: process.env.URL,
  },
});

io.on("connection", (socket) => {
  socket.on("disconnect", (data) => {});
});

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.status(200).json("WE LIVE");
});

server.listen(PORT, () => {
  console.log(`\n======= SERVER LISTENING ON PORT ${PORT} ========\n`);
});

// TIME
const timeData = () => {
  return new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date());
};
