import app from "./api/server.js";
import dotenv from "dotenv";
import { Server } from "socket.io";
import http from "http";

const socketIds = {};

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.URL,
  },
});

io.on("connection", (socket) => {
  socket.on("reconnect", (id) => {
    socketIds[id] = socket.id;
  });

  // ************************** SEND FRIEND REQUEST ******************************
  socket.on("FRIEND_REQUEST_SENT", (data) => {
    io.to(socketIds[data.userRecieveRequest]).emit("FRIEND_REQUEST_RECIEVED", {
      data: {
        userSendRequest: data.userSendRequest.id,
        userRecieveRequest: data.userRecieveRequest,
      },

      message: `${data.userSendRequest.firstName} ${data.userSendRequest.lastName} send you friend request`,
    });
  });

  // ************************** APPROVE FRIEND REQUEST ******************************
  socket.on("APPROVE_FRIEND_REQUEST", (data) => {
    io.to(socketIds[data.userSendRequest]).emit("FRIEND_REQUEST_APPROVED", {
      userRecieveRequest: data.userRecieveRequest,
      message: `${data.friend.firstName} ${data.friend.lastName} approve your friend request`,
    });
  });

  // ************************** CANCEL FRIEND REQUEST ******************************
  socket.on("CANCEL_FRIEND_REQUEST", (data) => {
    io.to(socketIds[data.userRecieveRequest]).emit("FRIEND_REQUEST_CANCEL", {
      userSendRequest: 2,
      userRecieveRequest: 1,
    });
  });

  // ************************************* REJECT FRIEND REQUEST *************************************
  socket.on("REJECT_FIEND_REQUEST", (data) => {
    console.log("FRIEND_REQUEST_REJECTED", data);
    io.to(socketIds[data.userSendRequest]).emit(
      "FRIEND_REQUEST_REJECTED",
      data.userRecieveRequest
    );
  });

  // ************************** DELETE FRIEND  ******************************
  socket.on("DELETE_FRIEND", (data) => {
    console.log("DELETE_FRIEND", data);
    io.to(socketIds[data.id]).emit("FRIEND_DELETED", data);
  });

  socket.on("SEND_MESSAGE", (msg) => {
    if (socketIds[msg.data.receiverId]) {
      io.to(socketIds[msg.data.receiverId]).emit("MESSAGE_RECEIVE", msg);
      io.to(socketIds[msg.data.receiverId]).emit("IS_MESSAGE_READ", msg);
    }
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
