import app from "./api/server.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import Messages from "./models/messages-model.js";
import http from "http";
import UserState from "./usersdata.js";
import User from "./models/user_model.js";

const socketIds = {};

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
  socket.on("reconnect", (id) => {
    console.log("reconnect", id, socket.id);
    socketIds[id] = socket.id;
  });

  socket.on("SEND_MESSAGE", (msg) => {
    console.log(socketIds);
    console.log(
      "socketIds",
      msg.data.receiverId,
      socketIds[msg.data.receiverId]
    );
    if (socketIds[msg.data.receiverId]) {
      console.log("yes");
      io.to(socketIds[msg.data.receiverId]).emit("MESSAGE_RECEIVE", msg);
    }
    // socket.to(socketIds[msg.data.receiverId]).emit("MESSAGE_RECEIVE", )
    // io.to(msg.privateId).emit("RECEIVER_MESSAGE", msg.data, msg.sender);
  });

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

export default io;
