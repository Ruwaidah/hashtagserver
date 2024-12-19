import express from "express";
import authentication from "../api/auth.middleware.js";
const router = express.Router();

router.post("/", authentication, (req, res) => {
  console.log("auth", req.body);
});

export default router;
