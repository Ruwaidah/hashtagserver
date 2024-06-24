const router = require("express").Router();
const User = require("../models/user_model");
const bcrypt = require("bcryptjs");
const UserState = require("../usersdata");
const generateToken = require("../generateToken.js");
const noImage =
  "https://res.cloudinary.com/donsjzduw/image/upload/v1647319074/sweoc0ro1mw2nswfg3wc.png";

// REGISTER NEW USER
router.post("/register", (req, res) => {
  const user = ({ username, password, email } = req.body);
  console.log(user)
  user.password = bcrypt.hashSync(user.password, 8);
  User.createUser({ ...req.body, image: noImage })
    .then((response) => {
      const token = generateToken(response.id);
      User.getUserBy(response[0])
        .then((user) => {
          console.log(user);
          res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            create_at: user.create_at,
            image: user.image,
            type: "registered",
            token,
          });
        })
        .catch((error) =>
          res.status(500).json({ message: "Error getting data" })
        );
    })
    .catch((error) => {
      console.log(error);
      if (error.code === "23505") {
        const regex = new RegExp(
          `${req.body.username}|${req.body.email}|=|Key|[().]`,
          "g"
        );
        const msg = error.detail.replace(regex, "");
        res.status(500).json({ message: msg });
      } else {
        console.log(error);
        res.status(500).json({ message: "Error create new data" });
      }
    });
});

// LOGIN USER
router.post("/login", async (req, res) => {
  User.getUserBy({ username: req.body.username })
    .then((user) => {
      console.log(user);
      if (bcrypt.compareSync(req.body.password, user.password)) {
        const token = generateToken(user.id);
        res.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
          create_at: user.create_at,
          image: user.image,
          type: "registered",
          token,
        });
      } else {
        res.status(401).json({ message: "Invalid Username or Password" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Invalid Username or Password" });
    });
});

// GUEST ENTER
router.post("/guest", (req, res) => {
  console.log(re.body)
  const token = generateToken(req.body.socketId);
  res.status(200).json({
    socketId: req.body.socketId,
    username: req.body.username,
    image: noImage,
    type: "guest",
    token,
  });
});

// GET USER
router.get("/:userid", (req, res) => {
  const { userid } = req.params;
  User.getUserBy({ id: userid }).then((response) => {
    res.status(200).json({
      id: response.id,
      username: response.username,
      email: response.email,
      create_at: response.create_at,
      type: "registered",
      image: response.image,
    });
  });
});

module.exports = router;
