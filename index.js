import app from "./api/server.js";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { registerSocketHandlers } from "./sockets/register.js";
import db from "./database/dbConfig.js";
import dns from "node:dns"

dns.setDefaultResultOrder("ipv4first");

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.URL },
});

registerSocketHandlers(io);

app.get("/", (req, res) => {
  res.status(200).send("API is running");
});


app.get("/api/dbcheck", async (req, res) => {
  try {
    await db.raw("select 1");
    res.json({ ok: true });
  } catch (e) {
    console.error("DBCHECK:", e);
    res.status(500).json({ ok: false, message: e.message, code: e.code });
  }
});


server.listen(process.env.PORT, () => {
  console.log(`SERVER LISTENING ON ${process.env.PORT}`);
});
