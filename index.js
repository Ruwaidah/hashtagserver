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
  // console.log(socket.id);
  socket.on("userjoinroom", ({ name, room }) => {
    userActivity(socket.id, name, room);
    // console.log(UserState.users);
  });
});

const userActivity = (id, name, room) => {
  const user = { id, name, room };
  console.log("user", user);
  const duplicateName = UserState.users.find(
    (u) => toLowerCase(u.name) === toLowerCase(name)
  );

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

// module.exports = UserState