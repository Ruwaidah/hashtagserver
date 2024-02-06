const express = require("express");
const middleware = require("./setupMiddleware.js");
const users = require("../routes/users.js")

const app = express();

middleware(app);

app.use("/api/users", users)

module.exports = app;
