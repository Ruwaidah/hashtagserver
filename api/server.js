const express = require("express");
const middleware = require("./setupMiddleware.js");
const users = require("../routes/users.js")
const rooms = require("../routes/rooms.js")

const app = express();

middleware(app);

app.use("/api/users", users)
app.use("/api/rooms", rooms)

module.exports = app;
