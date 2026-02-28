import app from "./api/server.js";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { registerSocketHandlers } from "./sockets/register.js";
import db from "./database/dbConfig.js";

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.URL },
});

registerSocketHandlers(io);

console.log("DATABASE_URL set?", Boolean(process.env.DATABASE_URL));
console.log("DATABASE_URL host:", process.env.DATABASE_URL?.split("@")?.[1]?.split(":")?.[0]);


app.get("/api/dbcheck", async (req, res) => {
  try {
    await db.raw("select 1");
    return res.json({ ok: true });
  } catch (e) {
    console.error("DBCHECK ERROR FULL:", e);
    return res.status(500).json({
      ok: false,
      message: e.message,
      code: e.code,
      detail: e.detail,
    });
  }
});

server.listen(process.env.PORT, () => {
  console.log(`SERVER LISTENING ON ${process.env.PORT}`);
});
