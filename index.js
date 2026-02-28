import app from "./api/server.js";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { registerSocketHandlers } from "./sockets/register.js";

dotenv.config();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.URL },
});

registerSocketHandlers(io);

app.get("/", (req, res) => res.status(200).send("Hashtagserver is running"));
app.get("/api/health", (req, res) => res.status(200).json({ ok: true }));

app.get("/api/dbcheck", async (req,res) => {
  try { await db.raw("select 1"); res.json({ok:true}); }
  catch(e){ console.error(e); res.status(500).json({ok:false}); }
});

server.listen(process.env.PORT, () => {
  console.log(`SERVER LISTENING ON ${process.env.PORT}`);
});
