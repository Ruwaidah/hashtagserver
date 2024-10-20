const app = require("./api/server.js");
const socketIo = require("socket.io");
const http = require("http");
const UserState = require("./usersdata.js");
const User = require("./models/user_model.js");

require("dotenv").config();

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.URL,
  },
});

io.on("connection", (socket) => {
  console.log("socket", typeof socket.id, socket.id);
  socket.on("RECONNECT", (data) => {
    console.log("reconnect", data);
    const user = getUserById(data);
    user.socketId = socket.id;
    addNewUser(user);
    io.emit("GET_ALL_USERS", getAllUsers());
  });
  socket.on("USER_ENTER_CHAT", (data) => {
    addNewUser({ ...data, socketId: socket.id });
    io.emit("GET_ALL_USERS", getAllUsers());
  });
  socket.on("GET_USERS_LIST", (data) => {
    io.emit("GET_ALL_USERS", getAllUsers());
  });

  // USER ENTER ROOM
  socket.on("USER_ENTER_ROOM", (data) => {
    const room = data.user.room;
    userEnterRoom(data.user.id, room);
    io.emit("GET_ALL_USERS", getAllUsers());
    socket.join(room);
    socket.emit("BOT_WELCOME_MESSAGE", {
      type: "welcome",
      sender: { username: "Bot", image: process.env.IMAGE_BOT },
      message: "Welcome To HashTag",
      time: timeData(),
    });
    socket.broadcast.to(room).emit("BOT_USER_JOINED", {
      sender: { username: "Bot", image: process.env.IMAGE_BOT },
      message: `${data.user.username} join ${room}`,
      time: timeData(),
    });
  });

  // ************************** USER LEFT ROOM
  socket.on("USER_LEFT_ROOM", (user) => {
    socket.leave(user.room);
    userLeftRoom(user.id);
    io.emit("GET_ALL_USERS", getAllUsers());
    socket.broadcast.to(user.room).emit("BOT_LEFT_ROOM", {
      sender: { username: "Bot", image: process.env.IMAGE_BOT },
      message: `${user.username} left ${user.room}`,
      time: timeData(),
    });
  });

  // ************************** USER KICKED FROM ROOM
  socket.on("USER_KICK_FROM_ROOM", (user) => {
    // socket.leave(user.room);
    // io.emit("GET_ALL_USERS", getAllUsers());
    socket
      .to(user.user.socketId)
      .emit("YOU_KICKED_OUT", { message: "you are out" });
    socket.emit("BOT_ADMIN_KICKED_USER", {
      sender: { username: "Bot", image: process.env.IMAGE_BOT },
      message: `${user.user.username} kicked from ${user.user.room} By ${user.admin.username}`,
      time: timeData(),
    });
    socket.broadcast.to(user.user.room).emit("BOT_USER_KICKED", {
      sender: { username: "Bot", image: process.env.IMAGE_BOT },
      message: `${user.user.username} kicked from ${user.user.room} By ${user.admin.username}`,
      time: timeData(),
    });
    userLeftRoom(user.user.id);
    io.emit("GET_ALL_USERS", getAllUsers());
    // socket.broadcast.to(user.room).emit("BOT_LEFT_ROOM", {
    //   sender: { username: "Bot", image: process.env.IMAGE_BOT },
    //   message: `${user.username} kicked from ${user.room}`,
    //   time: timeData(),
    // });
  });

  // ************************** USER CHANGE IMAGE
  socket.on("USER_CHANGE_IMAGE", (data) => {
    const user = getUserById(data.id)[0];
    user.image = data.img;
    addNewUser(user);
    io.emit("GET_ALL_USERS", getAllUsers());
  });

  // ************************** USER UPDATE USER
  socket.on("USER_UPDATE_USER", (user) => {
    io.emit("GET_ALL_USERS", getAllUsers());
  });

  // USER SENT MESSAGE
  socket.on("USER_SEND_MESSAGE", (data) => {
    io.to(data.user.room).emit("MESSAGE_SENT", {
      sender: { username: data.user.username, image: data.user.image },
      message: data.message,
      time: timeData(),
    });
  });

  // **************************** SEND PRIVATE MESSAGE ***********************
  socket.on("USER_SEND_PRIVATE_MSG", (data) => {
    console.log("data", data);
    // const sendTo = UserState.users.find((u) => u.id === data.sendTo);
    // console.log("sendTo",typeof sendTo.socketId, sendTo.socketId);
    // const sendFrom = UserState.users.find((u) => u.id === data.sendFrom.id);
    // console.log("sendFrom",typeof sendFrom.socketId, sendTo.socketId);
    socket.to(data.sendTo.socketId).emit("RECEIVE_PRIVATE_MSG", {
      message: data.message,
      sendTo: data.sendTo,
      sendFrom: data.sendFrom,
    });
  });

  //
  socket.on("USER_RECEIVE_PRIVATE_MSG", (data) => {});

  // **************************** USER LOGOUT ****************************
  socket.on("USER_LOGOUT", (data) => {
    userlogout(data.id);
    if (data.room) {
      socket.leave(data.room);
      socket.broadcast.to(data.room).emit("BOT_LEFT_ROOM", {
        sender: { username: "Bot", image: process.env.IMAGE_BOT },
        message: `${data.username} left ${data.room}`,
        time: timeData(),
      });
    }
    io.emit("GET_ALL_USERS", getAllUsers());
  });

  socket.on("disconnect", (data) => {
    console.log(data);
    const user = getUserBySocketId(socket.id);
    // if (user[0] && user[0].room) {
    //   socket.leave(user[0].room);
    //   socket.broadcast.to(user[0].room).emit("userleftroom", {
    //     sender: { username: "Bot", image: process.env.IMAGE_BOT },
    //     message: `${user[0].username} left ${user[0].room}`,
    //     time: timeData(),
    //   });
    // }
    console.log("disconnect", user);
    // userlogout(socket.id);
    // io.emit("GET_ALL_USERS", getAllUsers());
  });
});

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.status(200).json("WE LIVE");
});

server.listen(PORT, () => {
  console.log(`\n======= SERVER LISTENING ON PORT ${PORT} ========\n`);
});

const checkUserName = (name) =>
  UserState.users.find((u) => u.username.toLowerCase() === name.toLowerCase());

// add new user to chat list
const addNewUser = (data) => {
  return UserState.setUsers([
    ...UserState.users.filter((user) => user.id !== data.id),
    data,
  ]);
};

// GET ALL USER
const getAllUsers = () => {
  return UserState.users;
};

// const getUserByUsername = (username) => {
//   return UserState.users.filter((user) => user.username === username);
// };

// *************************** GET USER BY ID
const getUserById = (id) => {
  console.log(
    "id",
    typeof UserState.users[0].id,
    typeof id,
    UserState.users[0].id === id
  );
  return UserState.users.filter((user) => user.id == id)[0];
};

// ************************** USER RE CONNECT
// const userReconnect = (id) => {
//   return UserState.setUsers([...UserState.users.filter(user => user.id !== id), ])
// }

// *************************** GET USER BY SOCKET ID
const getUserBySocketId = (id) => {
  return UserState.users.filter((user) => user.socketId === id);
};
// USER ENTER ROOM
const userEnterRoom = (id, room) => {
  return UserState.users.map((user) => {
    if (user.id === id) user.room = room;
  });
};

// USER LEFT ROOM
const userLeftRoom = (id) => {
  return UserState.users.map((user) => {
    if (user.id === id) user.room = null;
  });
};

// GET USERS IN ROOM
const getUsersinRoom = (room) => {
  return UserState.users.filter((user) => user.room === room);
};

// USER LOGOUT
const userlogout = (id) => {
  return UserState.setUsers([
    ...UserState.users.filter((user) => user.id !== id),
  ]);
};

// TIME
const timeData = () => {
  return new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date());
};
