const router = require("express").Router();
const Rooms = require("../models/rooms_model");

// CREATE NEW ROOM
router.post("/", (req, res) => {
  console.log(req.body);
});

// GET ALL ROOMS
router.get("/", (req, res) => {
  Rooms.getRooms()
    .then((response) => res.status(200).json(response))
    .catch((error) => {
        res.status(500).json({ message: "Error Getting Data" })});
});

module.exports = router;
