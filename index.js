const app = require("./api/server.js");
const socketIo = require("socket.io");
const http = require("http");
const UserState = require("./usersdata.js");

require("dotenv").config();

const server = http.createServer(app);

const io = socketIo(server);

io.on("connection", (socket) => {
  socket.on("userjoinchat", (data) => {
    const sendDataToClient = {};
    const isDuplicateName = checkUserName(data.name);
    sendDataToClient.isDuplicateName = isDuplicateName ? true : false;
    sendDataToClient.message = isDuplicateName
      ? "Name already Taken"
      : "Welcome To HashTag";
    if (!isDuplicateName) {
      userActivity(socket.id, data.name, data.room);
    }
    console.log(UserState.users);
    socket.emit("admin", sendDataToClient);
  });

  socket.on("joinroom", (joinroom) => {
    console.log("joinroom", joinroom);
    socket.emit("ADMIN", { message: "Welcome To HashTag" });
    socket.broadcast.emit("welcomeuser", { message: "user join room" });
  });
});

const checkUserName = (name) =>
  UserState.users.find((u) => u.name.toLowerCase() === name.toLowerCase());

const userActivity = (id, name, room) => {
  const user = { id, name, room };
  UserState.setUsers([
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
