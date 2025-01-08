import express from "express";
import Rooms from "../models/rooms_model.js";

const router = express.Router();

// CREATE NEW ROOM
router.post("/", (req, res) => {
  console.log(req.body);
});

// GET ALL ROOMS
router.get("/", (req, res) => {
  Rooms.getRooms()
    .then((response) => res.status(200).json(response))
    .catch((error) => {
      res.status(500).json({ message: "Error Getting Data" });
    });
});

// GET ROOM BY ID
router.get("/:roomid", (req, res) => {
  const { roomid } = req.params;
  Rooms.getRoomBy({ id: Number(roomid) })
    .then((response) => {
      if (!response) {
        res.status(404).json({ message: "Room Not Found" });
      } else res.status(200).json(response);
    })
    .catch((error) => {
      res.status(500).json({ message: "error getting data" });
    });
});

export default router;
