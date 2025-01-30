import express, { response, Router } from "express";
import User from "../models/user_model.js";
import bcrypt from "bcryptjs";
import UserDate from "../usersdata.js";
import generateToken from "../generateToken.js";
import uplaodImg from "./imageUpload.js";
import UserState from "../usersdata.js";
import Friends from "../models/friends-model.js";
import FriendRequest from "../models/friendRequest-model.js";
import { error } from "console";
import protectRoute from "../api/auth.middleware.js";

const router = express.Router();

// ********************************** REGISTER NEW USER ******************************
router.post("/register", (req, res) => {
  const user = ({ firstName, lastName, password, email } = req.body);
  user.password = bcrypt.hashSync(user.password, 8);
  User.createUser({ ...req.body, image_id: 1 })
    .then((response) => {
      const token = generateToken(response.id);
      res.status(201).json({
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
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
      // if (error.code === "23505") {
      //   const regex = new RegExp(
      //     `${req.body.firstName}|${req.body.email}|=|Key|[().]`,
      //     "g"
      //   );
      //   const msg = error.detail.replace(regex, "");
      //   res.status(500).json({ message: msg });
      // } else {
      res.status(500).json({ message: "Error create new user" });
      // }
    });
});

// ********************************** LOGIN USER **********************************
router.post("/login", async (req, res) => {
  // User.getAllUsers().then((data) => console.log(data));
  User.loginUserByEmail({ email: req.body.email.toLowerCase(), id: null })
    .then((user) => {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        const token = generateToken(user.id);
        res.status(200).json({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          create_at: user.create_at,
          image_id: user.image_id,
          public_id: user.public_id,
          image: user.image,
          bio: user.bio,
          token,
          friendReq: user.friendReq,
        });
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
router.get("/getuser/:id", protectRoute, (req, res) => {
  const { id } = req.params;
  User.loginUserByEmail({ id, email: null })
    .then((user) => {
      res.status(200).json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        create_at: user.create_at,
        image_id: user.image_id,
        public_id: user.public_id,
        image: user.image,
        bio: user.bio,
        friendReq: user.friendReq,
      });
    })
    .catch((errer) => console.log(errer));
  // const user = UsersData.users.filter((user) => user.id == id);
  // res.status(200).json(user[0]);
});

// ********************************** UPDATE USER **********************************
router.put("/updateuser/:id", protectRoute, (req, res) => {
  const { id } = req.params;
  User.updateUser(id, req.body)
    .then((user) => {
      res.status(200).json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        create_at: user.create_at,
        image_id: user.image_id,
        public_id: user.public_id,
        image: user.image,
        bio: user.bio,
        friendReq: user.friendReq,
      });
    })
    .catch((error) => {
      res.status(500).json({ message: "Unable Update User" });
    });
});

// ********************************* UPDATE USER IMAGE **********************************
router.put("/image", async (req, res) => {
  const data = req.query;
  const image = await uplaodImg.imageupload(req.files);
  if (data.imageid == 1) {
    User.addImage(data.userid, image)
      .then((response) => {
        res.status(200).json({ message: "Update Successfully" });
      })
      .catch((error) => {
        res.status(500).json({ message: "Error Upload Image" });
      });
  } else {
    uplaodImg.deleteImage(data.publicimageid).then((response) => {
      User.updateImage(data.userid, data.imageid, image)
        .then((userUpdate) => {
          res.status(200).json({ message: "Update Successfully" });
        })
        .catch((error) => {
          res.status(500).json({ message: "Error Upload Image" });
        });
    });
  }
});

// ********************************** FIND FRIEND **********************************
router.post("/findfriend", (req, res) => {
  // User.searchForUser(req.body, req.query.userid, req.params)
  User.searchForUser({
    email: req.body.email,
    userid: req.query.userid,
    searchUserId: null,
  })
    .then((response) => {
      if (response) {
        res.status(200).json(response);
      } else {
        res.status(200).json({ message: "No Match" });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Unable Getting Data" });
    });
});

// ********************************** GET SEARCHED USER **********************************
router.get("/getsearcheduser/:searcheduser", (req, res) => {
  User.searchForUser({
    searchUserId: req.params.searcheduser,
    userid: req.query.userid,
    email: null,
  })
    .then((response) => {
      if (response) {
        res.status(200).json({
          firstName: response.firstName,
          lastName: response.lastName,
          bio: response.bio,
          email: response.email,
          image: response.image,
          create_at: response.create_at,
          id: response.id,
          image_id: response.image_id,
          public_id: response.public_id,
          friendReq: response.friendReq,
          friend: response.friend,
        });
      } else res.status(200).json({ message: "No User Found" });
    })
    .catch((error) => {
      res.status(500).json({ message: "Error Getting Data" });
    });
});

// ************************** SEND FRIEND REQUEST ******************************
router.post("/sendrequest", (req, res) => {
  FriendRequest.sendFriendRequest(req.body)
    .then((response) => {
      res.status(200).json({ message: "Friend Request Sent", response });
      // res.status(200).json({
      //   bio: response.bio,
      //   email: response.email,
      //   image: response.image,
      //   create_at: response.create_at,
      //   id: response.id,
      //   image_id: response.image_id,
      //   public_id: response.public_id,
      //   friendRequest: data ? data : null,
      // });
    })
    .catch((error) => {
      res.status(500).json({ message: "error data" });
    });
});

// ************************** APPROVE FRIEND REQUEST ******************************
router.get("/acceptfriendrequest", (req, res) => {
  console.log("req.query", req.query);
  FriendRequest.approveFriendRequest({
    userSendRequest: req.query.usersendrequest,
    userRecieveRequest: req.query.userrecieverequest,
  })
    .then((response) =>
      res.status(200).json({ message: "Friend Request Approve" })
    )
    .catch((error) => res.status(500).json({ message: "Error in Data" }));
});

// ************************** REJECT FRIEND REQUEST ******************************
router.delete("/rejectfriendrequest", (req, res) => {
  FriendRequest.rejectFriendRequest({
    userSendRequest: req.query.usersendrequest,
    userRecieveRequest: req.query.userrecieverequest,
  })
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Error in Data" });
    });
});

// ************************** CANCEL FRIEND REQUEST ******************************
router.delete("/cancelrequest", (req, res) => {
  console.log("cancel");
  FriendRequest.rejectFriendRequest({
    userSendRequest: req.query.userSendRequest,
    userRecieveRequest: req.query.userRecieveRequest,
  })
    .then((response) => {
      // console.log(response)
      res.status(200).json(response);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ message: "Error in Data" });
    });
});

// ********************************** GET FRIENDS LIST **********************************
router.get("/friendslist/:id", (req, res) => {
  console.log(req.params);
  Friends.getAllFriendsList(req.params)
    .then((response) => res.status(200).json(response))
    .catch((error) =>
      res.status(500).json({ message: "Error Getting Friends List" })
    );
});

// ************************** DELETE FRIEND  ******************************
router.delete("/deletefriend", (req, res) => {
  console.log(req.query);
  Friends.deleteFriend({
    user_id: req.query.userid,
    friend_id: req.query.searchFriend,
  })
    .then((response) => res.status(200).json(response))
    .catch((error) => res.status(500).json({ message: "Error Getting Data" }));
});

// ********************************** USER LOGOUT **********************************
router.post("/logout", (req, res) => {
  UserDate.setUserDisId(req.body.id);
  res.status(200).json({ message: "User Logout" });
});

const checkUserName = (name) =>
  UserDate.users.find((u) => u.username.toLowerCase() === name.toLowerCase());

export default router;
