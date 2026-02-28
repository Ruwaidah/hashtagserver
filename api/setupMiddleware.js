import express from "express";
import cors from "cors";
import helmet from "helmet";

const setupMiddleware = (server) => {
  server.use(helmet());
  server.use(cors());
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
};

export default setupMiddleware;