const router = require("express").Router();
const User = require("../models/user_model");
const bcrypt = require("bcryptjs");
const uniqid = require("uniqid");
const UsersData = require("../usersdata");
const generateToken = require("../generateToken.js");
const uplaodImg = require("./imageUpload.js");
const { response } = require("../api/server.js");

// ********************************** REGISTER NEW USER **********************************
router.post("/register", (req, res) => {
  const user = ({ username, password, email } = req.body);
  user.password = bcrypt.hashSync(user.password, 8);
  User.createUser({ ...req.body, image_id: 1 })
    .then((response) => {
      const token = generateToken(response.id);
      res.status(201).json({
        id: response.id,
        username: response.username,
        email: response.email,
        create_at: response.create_at,
        image_id: response.image_id,
        public_id: response.public_id,
        image: response.image,
        type: "registered",
        room: null,
        token,
      });
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

// ********************************** LOGIN USER **********************************
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
          image_id: user.image_id,
          public_id: user.public_id,
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

// ********************************** GUEST ENTER **********************************
router.post("/guest", (req, res) => {
  const id = uniqid();
  const username = req.body.username;
  const token = generateToken(id);
  User.getUserBy({ username })
    .then((response) => {
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
            public_id: process.env.IMAGE_PUBLIC_ID,
            image: process.env.NO_IMAGE,
            type: "guest",
            room: null,
            token,
          });
        }
      }
    })
    .catch((error) => res.status(500).json({ message: "error getting data" }));
});

// ********************************** GET USERS LIST **********************************
// router.get("/userslist", (req, res) => {
//   res.status(200).json(UsersData.users);
// });

// ********************************** GET USER **********************************
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

// ********************************** UPDATE USER **********************************
// router.put("/:id", (req, res) => {
//   const { id } = req.params;
// });

// ********************************* UPDATE USER IMAGE **********************************
router.put("/image/:id", (req, res) => {
  const id = req.params;
  // User.updateUser(id, { image: req.files });
  // res.status(200).json();
  console.log(id);
  User.getUserById(id)
    .then(async (data) => {
      console.log(data);
      const image = await uplaodImg.imageupload(req.files);
      console.log(image);
      if (data.image_id == 1) {
        console.log("yes");
        User.addImage(data.id, image)
          .then((response) => {
            console.log(response);
            res.status(200).json(response);
          })
          .catch((error) =>
            res.status(500).json({ message: "Error Upload Image" })
          );
      } else {
        console.log("no");
        uplaodImg
          .deleteImage(data.public_id)
          .then((response) => {
            User.updateImage(data.id, data.image_id, image)
              .then((userUpdate) => {
                res.status(200).json(userUpdate);
              })
              .catch((error) =>
                res.status(500).json({ message: "Error Upload Image" })
              );
          })
          .catch((error) =>
            res.status(500).json({ message: "Error Upload Image" })
          );
      }
      // if (data.public_id !== process.env.IMAGE_PUBLIC_ID) deletePhoto = true;
      // uplaodImg
      //   .imageupload({
      //     imagePublicId: data.public_id,
      //     file: req.files,
      //     deletePhoto,
      //   })
      //   .then((image) => {
      //     User.updateImage({
      //       deletePhoto,
      //       publicId: image.public_id,
      //       image: image.url,
      //       userId: data.id,
      //       imageId: data.image_id,
      //     })
      //       .then((updateUser) => {
      //         res
      //           .status(200)
      //           .json({ user: updateUser, message: "Image Changed" });
      //       })
      //       .catch((er) => {
      //         res.status(500).json({ message: "error update user" });
      //       });
      //   })
      //   .catch((error) => {
      //     res.status(500).json({ message: "Error Upload Image" });
      //   });
    })
    .catch((erro) => {
      res.status(500).json({ message: "Error upload Image" });
    });
  // uplaodImg
  //   .imageupload(null, req.files, false)
  //   .then((image) => {
  //   })
  //   .catch((error) =>
  //     res.status(500).json({ message: "error changing image" })
  //   );
});

// ********************************** USER LOGOUT **********************************
router.post("/logout", (req, res) => {
  UsersData.setUserDisId(req.body.id);
  res.status(200).json({ message: "User Logout" });
});

const checkUserName = (name) =>
  UsersData.users.find((u) => u.username.toLowerCase() === name.toLowerCase());

module.exports = router;
