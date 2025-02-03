import express from "express";
import setupMiddleware from "./setupMiddleware.js";
import users from "../routes/users.js";
import message from "../routes/message.js";

const app = express();

setupMiddleware(app);

app.use("/api/users", users);
app.use("/api/auth/message", message);

export default app;
