import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import helmet from "helmet";

const setupMiddleware = (server) => {
  server.use(
    fileUpload({
      useTempFiles: true,
    })
  );
  server.use(helmet());
  server.use(express.json());
  server.use(cors());
};

export default setupMiddleware;
