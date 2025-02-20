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
    // console.log("reconnect", id, socket.id);
    socketIds[id] = socket.id;
  });

  socket.on("FRIEND_REQUEST_SENT", (data) => {
    // console.log(data);
    io.to(socketIds[data.userRecieveRequest]).emit(
      "FRIEND_REQUEST_RECIEVED",
      {
        message: `${data.userSendRequest.firstName} ${data.userSendRequest.lastName} send you friend request`,
      }
      // {message: "User sent you friend request"}
    );
  });

  socket.on("APPROVE_FRIEND_REQUEST", (data) => {
    console.log(data);
    io.to(socketIds[data.userSendRequest]).emit(
      "FRIEND_REQUEST_APPROVED",
      {
        message: `${data.friend.firstName} ${data.friend.lastName} approve your friend request`,
      }
      // {message: "User sent you friend request"}
    );
  });

  socket.on("CANCEL_FRIEND_REQUEST", (data) => {
    io.to(socketIds[data.userRecieveRequest]).emit(
      "FRIEND_REQUEST_CANCEL"
      // {message: "User sent you friend request"}
    );
  });

  // ************************************* REJECT FRIEND REQUEST *************************************
  socket.on("REJECT_FIEND_REQUEST", (data) => {
    io.to(socketIds[data.userSendRequest]).emit(
      "FRIEND_REQUEST_REJECTED",
      data.userRecieveRequest
    );
  });

  socket.on("SEND_MESSAGE", (msg) => {
    if (socketIds[msg.data.receiverId]) {
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
