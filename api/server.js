// const express = require("express");
// const middleware = require("./setupMiddleware.js");
const users = require("../routes/users.js")

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());

// middleware(app);

app.use("/api/users", users)

module.exports = app;
