const router = require("express").Router();
const User = require("../models/user_model");
const bcrypt = require("bcryptjs");
const uniqid = require("uniqid");
const UsersData = require("../usersdata");
const generateToken = require("../generateToken.js");
const noImage =
  "https://res.cloudinary.com/donsjzduw/image/upload/v1647319074/sweoc0ro1mw2nswfg3wc.png";

// REGISTER NEW USER
router.post("/register", (req, res) => {
  const user = ({ username, password, email } = req.body);
  user.password = bcrypt.hashSync(user.password, 8);
  User.createUser({ ...req.body, image: noImage })
    .then((response) => {
      const token = generateToken(response.id);
      // User.getUserBy(response[0])
      //   .then((user) => {
      //     res.status(201).json({
      //       id: user.id,
      //       username: user.username,
      //       email: user.email,
      //       create_at: user.create_at,
      //       image: user.image,
      //       type: "registered",
      // room:null,
      //       token,
      //     });
      //   })
      //   .catch((error) =>
      //     res.status(500).json({ message: "Error getting data" })
      //   );
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
        res.status(500).json({ message: "Error create new user" });
      }
    });
});

// LOGIN USER
router.post("/login", async (req, res) => {
  User.getUserBy({ username: req.body.username })
    .then((user) => {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        const token = generateToken(user.id);
        res.status(200).json({
          id: user.id,
          username: user.username,
          email: user.email,
          create_at: user.create_at,
          image: user.image,
          type: "registered",
          room: null,
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
  const id = uniqid();
  const username = req.body.username;
  const token = generateToken(id);
  User.getUserBy({ username })
    .then((response) => {
      // let isAvailable = false;
      if (response) {
        res.status(409).json({ message: "Username already register" });
      } else {
        const user = checkUserName(username);
        if (user)
          res.status(409).json({ message: "Username already register" });
        else {
          res.status(200).json({
            id,
            username,
            image: noImage,
            type: "guest",
            room: null,
            token,
          });
        }
      }
    })
    .catch((error) => res.status(500).json({ message: "error getting data" }));
});

// GET USERS LIST
router.get("/userslist", (req, res) => {
  res.status(200).json(UsersData.users);
});

// GET USER
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const user = UsersData.users.filter((user) => user.id == id);
  res.status(200).json(user[0]);
  // User.getUserBy({ id }).then((response) => {
  //   res.status(200).json({
  //     id: response.id,
  //     username: response.username,
  //     email: response.email,
  //     create_at: response.create_at,
  //     type: "registered",
  //     image: response.image,
  //   });
  // });
});

// ********************************** UPDATE USER *************************
router.put("/:id", (req, res) => {
  const { id } = req.params;
});

// ********************************* UPDATE USER IMAGE **********************
router.put("/image/:id", (req, res) => {
  const { id } = req.params;
  console.log(id);
});

// USER LOGOUT
router.post("/logout", (req, res) => {
  UsersData.setUserDisId(req.body.id);
  res.status(200).json({ message: "User Logout" });
});

const checkUserName = (name) =>
  UsersData.users.find((u) => u.username.toLowerCase() === name.toLowerCase());

module.exports = router;
