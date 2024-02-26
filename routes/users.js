const router = require("express").Router();
const User = require("../models/user_model");
const bcrypt = require("bcryptjs");
const UserState = require("../usersdata");
const generateToken = require("../generateToken.js");

// REGISTER NEW USER
router.post("/register", (req, res) => {
  const user = ({ username, password, email } = req.body);
  user.password = bcrypt.hashSync(user.password, 8);
  User.createUser(req.body)
    .then((response) => {
      console.log("respo", user.password);
      const token = generateToken(response.id);
      User.getUserBy(response[0])
        .then((user) => {
          res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            create_at: user.create_at,
            token,
          });
        })
        .catch((error) =>
          res.status(500).json({ message: "Error getting data" })
        );
    })
    .catch((error) => {
      if (error.code === "23505") {
        const regex = new RegExp(
          `${req.body.username}|${req.body.email}|=|Key|[().]`,
          "g"
        );
        const msg = error.detail.replace(regex, "");
        res.status(500).json({ message: msg });
      } else {
        res.status(500).json({ message: "Error create new data" });
      }
    });
});

// LOGIN USER
router.post("/login", (req, res) => {
  console.log(req.body);
  User.getUserBy({ username: req.body.username })
    .then((user) => {
      console.log(response);
      if (bcrypt.compareSync(response.password, req.body.password)) {
        const token = generateToken(response.id);
        res.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
          create_at: user.create_at,
          token,
        });
      } else {
        res.status(401).json({ message: "Invalid Email or Password" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Invalid Email or Password" });
    });
});


// GET USER
router.get("/:userid", (req, res) => {
  console.log(req.query)
})

module.exports = router;
