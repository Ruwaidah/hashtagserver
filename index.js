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
  socket.on("guestCheck", (data) => {
    console.log("data", data);
    User.getUserBy({ username: data.username })
      .then((response) => {
        let isDuplicateName = false;
        if (response) {
          isDuplicateName = true;
        } else {
          const user = checkUserName(data.username);
          isDuplicateName = user ? true : false;
        }
        socket.emit("guestEnter", { isDuplicateName, data });
      })
      .catch((error) => console.log("error", error));
  });

  // USER ENTER CHAT
  socket.on("USER_ENTERED_CHAT", (data) => {
    addNewUser(socket.id, data.username, data.type, data.image);
    io.emit("GET_ALL_USERS", getAllUsers());
    // socket.emit("SEND_USER", getUserByUsername(data.username));
    socket.emit("GET_USER", getUserById(socket.id));
  });

  // USER ENTER ROOM
  socket.on("joinroom", ({ username, room, type }) => {
    console.log("join room");
    socket.join(room);
    socket.emit("ADMIN", {
      user: { username: "Admin", image: process.env.IMAGE_BOT },
      message: { message: "Welcome To HashTag", time: timeData() },
    });
    socket.broadcast.to(room).emit("welcomeuser", {
      user: { username: "Admin", image: process.env.IMAGE_BOT },
      message: { message: `${username} join ${room}`, time: timeData() },
    });
  });

  // USER ENTER ROOM
  socket.on("USER_ENTER_ROOM", (data) => {
    console.log("USER_ENTER_ROOM", data);
    userEnterRoom(socket.id, data.roomname);
    io.emit("GET_ALL_USERS", getAllUsers());
    socket.emit("USER_ENTER_THE_ROOM", getUserById(socket.id));
  });

  // USER LEFT ROOM
  socket.on("userleftroom", (data) => {
    console.log("left room", data);
    socket.leave(data.user.room);
    userLeftRoom(socket.id);
    io.emit("GET_ALL_USERS", getAllUsers());
    socket.emit("GET_USER", getUserById(socket.id));
    socket.broadcast.to(data.user.room).emit("userleftroom", {
      user: { username: "Admin", image: process.env.IMAGE_BOT },
      message: {
        message: `${data.user.username} left ${data.user.room}`,
        time: timeData(),
      },
    });
  });

  // USER SENT MESSAGE
  socket.on("userSentMsg", (data) => {
    io.to(data.user.room).emit("userSentMsg", {user:data.user, message: {message: data.message, time: timeData()}});
  });

  // USER LOGOUT
  socket.on("logout", (data) => {
    userlogout(data.socketId);
    io.emit("GET_ALL_USERS", getAllUsers());
  });

  socket.on("disconnect", (data) => {
    console.log("dis", socket.id);
    const user = getUserById(socket.id);
    console.log("user", user[0]);
    if (user[0] && user[0].room) {
      console.log("sefnsfns");
      socket.leave(user[0].room);
      socket.broadcast.to(user[0].room).emit("userleftroom", {
        user: { username: "Admin", image: process.env.IMAGE_BOT },
        message: {
          message: `${user[0].username} left ${user[0].room}`,
          time: timeData(),
        },
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

const addNewUser = (id, username, type, image) => {
  const user = { id, username, type, room: null, image };
  return UserState.setUsers([
    ...UserState.users.filter((user) => user.username !== username),
    user,
  ]);
};

// GET ALL USERS
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
