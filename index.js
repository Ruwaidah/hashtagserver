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
  socket.on("userjoinchat", (data) => {
    User.getUserBy({ username: data.username })
      .then((response) => {
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

  socket.on("joinroom", (joinroom) => {
    socket.emit("ADMIN", { message: "Welcome To HashTag" });
    socket.broadcast.emit("welcomeuser", {
      message: `${joinroom.user} join ${joinroom.room}`,
    });
  });
  socket.on("USER_ENTERED_CHAT", (data) => {
    console.log("data", data);
    addNewUser(socket.id, data.username, data.type);
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
  UserState.setUsers([
    ...UserState.users.filter((user) => user.id !== id),
    user,
  ]);
};

// GET ALL USERS
const getAllUsers = () => {
  return UserState.users;
};

// GET USERS IN ROOM
const getUsersinRoom = (room) => {
  return UserState.users.filter((user) => user.room === room);
};

// TIME
const timeData = () => {
  return new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date());
};
