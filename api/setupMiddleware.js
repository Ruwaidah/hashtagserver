import express from "express";
import cors from "cors";
import helmet from "helmet";


const allowedOrigins = [
  "https://message-app-ukya.onrender.com",
  "http://localhost:5173",
];




const setupMiddleware = (server) => {
  server.use(helmet());
  server.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error("Not allowed by CORS"));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
};

server.options("*", cors());

export default setupMiddleware;