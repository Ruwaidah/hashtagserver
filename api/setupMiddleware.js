const express = require("express");
const cors = require("cors");
const fileupload = require("express-fileupload");
const helmet = require("helmet");

module.exports = (server) => {
  server.use(
    fileupload({
      useTempFiles: true,
    })
  );
  server.use(helmet());
  server.use(express.json());
  server.use(cors());
};
