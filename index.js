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
  // socket.on("checkIn", (data) => {
  //   socket.emit("userEnter", { isAvailable: false, data });
  //   User.getUserBy({ username: data.username })
  //     .then((response) => {
  //       let isAvailable = false;
  //       if (response) {
  //         isAvailable = true;
  //       } else {
  //         const user = checkUserName(data.username);
  //         isAvailable = user ? true : false;
  //         if (user) {
  //           addNewUser(data);
  //           io.emit("GET_ALL_USERS", getAllUsers());
  //         }
  //       }
  //       socket.emit("userEnter", { isAvailable, data });
  //     })
  //     .catch((error) => console.log("error", error));
  // });

  socket.on("USER_ENTER_CHAT", (data) => {
    addNewUser(data);
    io.emit("GET_ALL_USERS", getAllUsers());
  });

  // USER ENTER CHAT
  // socket.on("USER_ENTERED_CHAT", (data) => {
  //   addNewUser(data);
  //   io.emit("GET_ALL_USERS", getAllUsers());
  //   // socket.emit("SEND_USER", getUserByUsername(data.username));
  //   // socket.emit("GET_USER", getUserById(socket.id));
  // });

  socket.on("GET_USERS_LIST", (data) => {
    io.emit("GET_ALL_USERS", getAllUsers());
  });

  // USER ENTER ROOM
  // socket.on("joinroom", ({ username, room, type }) => {
  // socket.join(room);
  // socket.emit("ADMIN", {
  //   user: { username: "Admin", image: process.env.IMAGE_BOT },
  //   message: { message: "Welcome To HashTag", time: timeData() },
  // });
  // socket.broadcast.to(room).emit("welcomeuser", {
  //   user: { username: "Admin", image: process.env.IMAGE_BOT },
  //   message: { message: `${username} join ${room}`, time: timeData() },
  // });
  // });

  // USER ENTER ROOM
  socket.on("USER_ENTER_ROOM", (data) => {
    const room = data.user.room;
    // if (data.user.room) {
    //   socket.leave(data.user.room);
    //   socket.broadcast.to(data.user.room).emit("BOT_LEFT_ROOM", {
    //     sender: {
    //       username: "Bot",
    //       image: process.env.IMAGE_BO,
    //     },
    //     message: `${data.user.username} left ${data.user.room}`,
    //     time: timeData(),
    //   });
    // }
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
    //  --------------------------------------------------------------------
    // socket.emit("USER_ENTER_THE_ROOM", getUserById(data.user.id));
  });

  // USER LEFT ROOM
  socket.on("USER_LEFT_ROOM", (user) => {
    socket.leave(user.room);
    userLeftRoom(user.id);
    io.emit("GET_ALL_USERS", getAllUsers());
    // socket.emit("GET_USER", getUserById(data.id));
    socket.broadcast.to(user.room).emit("BOT_LEFT_ROOM", {
      sender: { username: "Bot", image: process.env.IMAGE_BOT },
      message: `${user.username} left ${user.room}`,
      time: timeData(),
    });
  });

  // ************************** USER CHANGE IMAGE
  socket.on("USER_CHANGE_IMAGE", (data) => {
    // console.log(data);
    const user = getUserById(data.id)[0];
    user.image = data.img;
    addNewUser(user);
    io.emit("GET_ALL_USERS", getAllUsers());
  });

  // USER SENT MESSAGE
  // socket.on("userSentMsg", (data) => {
  socket.on("USER_SEND_MESSAGE", (data) => {
    io.to(data.user.room).emit("MESSAGE_SENT", {
      sender: { username: data.user.username, image: data.user.image },
      message: data.message,
      time: timeData(),
    });
  });

  // USER LOGOUT
  // socket.on("logout", (data) => {
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

  socket.on("disconnect", () => {
    const user = getUserById(socket.id);
    if (user[0] && user[0].room) {
      socket.leave(user[0].room);
      socket.broadcast.to(user[0].room).emit("userleftroom", {
        sender: { username: "Bot", image: process.env.IMAGE_BOT },
        message: `${user[0].username} left ${user[0].room}`,
        time: timeData(),
      });
    }
    userlogout(socket.id);
    io.emit("GET_ALL_USERS", getAllUsers());
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

const getUserById = (id) => {
  return UserState.users.filter((user) => user.id === id);
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
