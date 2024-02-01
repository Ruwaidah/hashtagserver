const app = require("./api/server.js");
const socketIo = require("socket.io");
const http = require("http");

require("dotenv").config();

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.URL,
  },
});

const UserState = {
  users: [],
  setUsers: function (newUsersArray) {
    this.users = newUsersArray;
  },
};

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("userjoinchat", (data) => {
    console.log("data", data);
    const isDuplicateName = checkUserName(data.name);
    console.log("isDuplicateName", isDuplicateName, UserState.users);
    console.log(UserState.users.length);
    if (isDuplicateName && UserState.users.length > 0) {
      console.log("if");
      socket.emit("duplicate", { message: "Name already Taken" });
    } else {
      console.log("else");
      userActivity(socket.id, data.name, data.room);
      socket.emit("admin", { message: "Welcome To HashTag" });
    }
  });
});

const checkUserName = (name) =>
  UserState.users.find((u) => u.name.toLowerCase() === name.toLowerCase());

const userActivity = (id, name, room) => {
  const user = { id, name, room };
  return UserState.setUsers([
    ...UserState.users.filter((user) => user.id !== id),
    user,
  ]);
};

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.status(200).json("WE LIVE");
});

server.listen(PORT, () => {
  console.log(`\n======= SERVER LISTENING ON PORT ${PORT} ========\n`);
});
