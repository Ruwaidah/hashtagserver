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
    console.log(data);

    User.getUserBy({ username: data.username })
      .then((response) => {
        console.log("response", response);
        let isDuplicateName = false;
        const sendDataToClient = {};
        if (response) {
          isDuplicateName = true;
          console.log("yes");
        } else {
          console.log("no");
          isDuplicateName = checkUserName(data.username);
        }

        console.log("isDuplicateName", isDuplicateName);
        sendDataToClient.isDuplicateName = isDuplicateName ? true : false;
        sendDataToClient.message = isDuplicateName
          ? "Name already Taken"
          : "Welcome To HashTag";
        if (!isDuplicateName) {
          userActivity(socket.id, data.username, data.room);
        }
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

const userActivity = (id, username, room) => {
  const user = { id, username, room };
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
