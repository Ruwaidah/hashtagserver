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
  console.log("connect");
  socket.on("userjoinchat", (data) => {
    console.log("database", data);
    User.getUserBy({ username: data.username })
      .then((response) => {
        console.log("response", response);
        let isDuplicateName = false;
        const sendDataToClient = {};
        if (response) {
          isDuplicateName = true;
        } else {
          isDuplicateName = checkUserName(data.username);
        }
        sendDataToClient.isDuplicateName = isDuplicateName ? true : false;
        sendDataToClient.message = isDuplicateName
          ? "Name already Taken"
          : null;
        socket.emit("admin", sendDataToClient);
      })
      .catch((error) => console.log("error", error));
  });

  socket.on("joinroom", ({ username, room, type }) => {
    socket.join(room);
    socket.emit("ADMIN", { user: "Admin", message: "Welcome To HashTag" });
    socket.broadcast.to(room).emit("welcomeuser", {
      user: "Admin",
      message: `${username} join ${room}`,
    });
  });
  socket.on("USER_ENTERED_CHAT", (data) => {
    console.log("user enter chat", data);
    addNewUser(socket.id, data.username, data.type);
    io.emit("GET_ALL_USERS", getAllUsers());
    socket.emit("SEND_USER", getUserByUsername(data.username));
  });

  // USER ENTER ROOM
  socket.on("USER_ENTER_ROOM", (data) => {
    console.log(data);
    userEnterRoom(socket.id, data.roomname);
    io.emit("GET_ALL_USERS", getAllUsers());
    socket.emit("USER_ENTER_ROOM", getUserById(socket.id));
  });

  // USER LEFT ROOM
  socket.on("userleftroom", (data) => {
    console.log("left", data, UserState.users);
    socket.leave(data.room);
    userLeftRoom(socket.id);
    io.emit("GET_ALL_USERS", getAllUsers());
    socket.emit("SEND_USER", getUserById(socket.id));
    socket.broadcast.to(data.user.room).emit("userleftroom", {
      user: "Admin",
      message: `${data.user.username} left ${data.user.room}`,
    });
  });

  // USER SENT MESSAGE
  socket.on("userSentMsg", (data) => {
    console.log(data);
    io.to(data.user.room).emit("userSentMsg", data);
  });

  socket.on("disconnect", (data) => {
    console.log("disconnect", socket.id, data);
    userlogout(socket.id);
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

const addNewUser = (id, username, type) => {
  const user = { id, username, type };
  return UserState.setUsers([
    ...UserState.users.filter((user) => user.username !== username),
    user,
  ]);
};

// GET ALL USERS
const getAllUsers = () => {
  return UserState.users;
};

const getUserByUsername = (username) => {
  return UserState.users.filter((user) => user.username === username);
};

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
