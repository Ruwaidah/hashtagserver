import express, { response } from "express";
import User from "../models/user_model.js";
import bcrypt from "bcryptjs";
import UserDate from "../usersdata.js";
import generateToken from "../generateToken.js";
import uplaodImg from "./imageUpload.js";
import UserState from "../usersdata.js";
import Friends from "../models/friends-model.js";
import FriendRequest from "../models/friendRequest-model.js";

const router = express.Router();

// ********************************** REGISTER NEW USER ******************************
router.post("/register", (req, res) => {
  const user = ({ fullName, password, email } = req.body);
  user.password = bcrypt.hashSync(user.password, 8);
  User.createUser({ ...req.body, image_id: 1 })
    .then((response) => {
      const token = generateToken(response.id);
      res.status(201).json({
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        create_at: response.create_at,
        image_id: response.image_id,
        public_id: response.public_id,
        image: response.image,
        bio: response.bio,
        token,
      });
    })
    .catch((error) => {
      if (error.code === "23505") {
        const regex = new RegExp(
          `${req.body.fullname}|${req.body.email}|=|Key|[().]`,
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
  console.log("login", req.body);
  // User.getAllUsers().then((data) => console.log(data));
  User.getUserBy({ email: req.body.email })
    .then((user) => {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        const token = generateToken(user.id);
        FriendRequest.getAllFriendRequestForUser(user.id)
          .then((data) => {
            res.status(200).json({
              id: user.id,
              fullName: user.fullName,
              email: user.email,
              create_at: user.create_at,
              image_id: user.image_id,
              public_id: user.public_id,
              image: user.image,
              bio: user.bio,
              token,
              friendRequest: data,
            });
          })
          .catch((error) =>
            res.status(500).json({ message: "error getting User" })
          );
      } else {
        res.status(401).json({ message: "Invalid Email or Password" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Invalid Email or Password" });
    });
});

// ********************************** GET USERS LIST **********************************
// router.get("/userslist", (req, res) => {
//   res.status(200).json(UsersData.users);
// });

// ********************************** GET USER **********************************
router.get("/getUser/:id", (req, res) => {
  console.log("getid");
  const { id } = req.params;
  User.getUserById({ id })
    .then((response) => {
      FriendRequest.getAllFriendRequestForUser(id)
        .then((data) => {
          res.status(200).json({ ...response, friendRequest: data });
        })
        .catch((error) => console.log(error));
    })
    .catch((errer) => res.status(500).json({ message: "Error Geting User" }));
  // const user = UsersData.users.filter((user) => user.id == id);
  // res.status(200).json(user[0]);
});

// ********************************** UPDATE USER **********************************
router.put("/:id", (req, res) => {
  const { id } = req.params;
  console.log("update", req.body);
  const isUpdate = true;
  console.log("update", id);
  User.updateUser(id, req.body)
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Unable Update User" });
    });
  // if (req.query.type === "registered") {
  //   User.getUserBy({ username: req.body.username }).then((data) => {
  //     if (data && id !== data.id) {
  //       // res.status(409).json({ message: "Please Chose a diffrent Name" });
  //       isUpdate = false;
  //     }
  //   });
  // }
  // const user = UsersData.users.filter(
  //   (user) => user.username == req.body.username && user.id != id
  // );

  // if (user.length > 0 || !isUpdate) {
  //   res.status(409).json({ message: "Please Choose a diffrent Name"});
  // }

  // const currentUser = UsersData.users.filter((user) => user.id == id);

  // if (req.query.type === "registered") {
  //   User.userUpdate({ id }, req.body);
  // }
  // currentUser[0].bio = req.body.bio;
  // currentUser[0].username = req.body.username;
  // UsersData.setUsers([
  //   ...UsersData.users.filter((u) => u.id !== id),
  //   currentUser[0],
  // ]);

  // res.status(200).json({ message: "User Updated", user: currentUser[0] });
});

// ********************************* UPDATE USER IMAGE **********************************
router.put("/image/:id", (req, res) => {
  const id = req.params;
  User.getUserById(id)
    .then(async (data) => {
      const image = await uplaodImg.imageupload(req.files);
      if (data.image_id == 1) {
        User.addImage(data.id, image)
          .then((response) => {
            res.status(200).json(response);
          })
          .catch((error) => {
            res.status(500).json({ message: "Error Upload Image" });
          });
      } else {
        uplaodImg
          .deleteImage(data.public_id)
          .then((response) => {
            User.updateImage(data.id, data.image_id, image)
              .then((userUpdate) => {
                res.status(200).json(userUpdate);
              })
              .catch((error) => {
                res.status(500).json({ message: "Error Upload Image" });
              });
          })
          .catch((error) => {
            res.status(500).json({ message: "Error Upload Image" });
          });
      }
    })
    .catch((erro) => {
      res.status(500).json({ message: "Error upload Image" });
    });
});

// ********************************** FIND FRIEND **********************************
router.post("/findfriend", (req, res) => {
  console.log("find new friend", req.body);

  User.getUserBy(req.body)
    .then((response) => {
      console.log(response);
      if (response) {
        User.checkFriendRequest({
          userSendRequest: req.query.userid,
          userRecieveRequest: response.id,
        })
          .then((data) => {
            console.log(data);
            res.status(200).json({
              fullName: response.fullName,
              bio: response.bio,
              email: response.email,
              image: response.image,
              create_at: response.create_at,
              id: response.id,
              image_id: response.image_id,
              public_id: response.public_id,
              friendRequest: data ? data : null,
            });
          })
          .catch((error) => {
            console.log(error);
            res.status(500).json({ message: "error data" });
          });
      } else {
        res.status(200).json(null);
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Unable Getting Data" });
    });
});

// ********************************** GET FRIENDS LIST **********************************
router.get("/friendslist/:id", (req, res) => {
  console.log("GET FRIENDS ", req.query, req.params);
  Friends.getAllFriendsList(req.params)
    .then((response) => res.status(200).json(response))
    .catch((error) =>
      res.status(500).json({ message: "Error Getting Friends List" })
    );
});

// ************************** SEND FRIEND REQUEST ******************************
router.get("/sendrequest", (req, res) => {
  console.log("req.query", req.query);
  User.sendFriendRequest({
    userid: req.query.userid,
    friendrequest: req.query.friendrequest,
  })
    .then((response) => {
      console.log("response", response);
      res.status(200).json({ message: "Request Sent" });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "error data" });
    });
});

// ********************************** USER LOGOUT **********************************
router.post("/logout", (req, res) => {
  UserDate.setUserDisId(req.body.id);
  res.status(200).json({ message: "User Logout" });
});

const checkUserName = (name) =>
  UserDate.users.find((u) => u.username.toLowerCase() === name.toLowerCase());

export default router;
