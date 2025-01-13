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
  // User.getAllUsers().then((data) => console.log(data));
  User.loginUserByEmail({ email: req.body.email, id: null })
    .then((user) => {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        const token = generateToken(user.id);
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
          userRecieveRequest: user.userRecieveRequest,
          userSendRequest: user.userSendRequest,
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
        fullName: user.fullName,
        email: user.email,
        create_at: user.create_at,
        image_id: user.image_id,
        public_id: user.public_id,
        image: user.image,
        bio: user.bio,
        userRecieveRequest: user.userRecieveRequest,
        userSendRequest: user.userSendRequest,
      });
    })
    .catch((errer) => res.status(500).json({ message: "Error Geting User" }));
  // const user = UsersData.users.filter((user) => user.id == id);
  // res.status(200).json(user[0]);
});

// ********************************** UPDATE USER **********************************
router.put("/updateuser/:id", protectRoute, (req, res) => {
  const { id } = req.params;
  User.updateUser(id, req.body)
    .then((response) => {
      FriendRequest.getAllFriendRequestForUser(id).then((data) => {
        res.status(200).json({ ...response, friendRequest: data });
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
        // FriendRequest.checkFriendRequest({
        //   userSendRequest: req.query.userid,
        //   userRecieveRequest: response.id,
        // })
        //   .then((data) => {
        // res.status(200).json({
        //   fullName: response.fullName,
        //   bio: response.bio,
        //   email: response.email,
        //   image: response.image,
        //   create_at: response.create_at,
        //   id: response.id,
        //   image_id: response.image_id,
        //   public_id: response.public_id,
        //   friendRequest: response.friendReq ? response.friendReq : null,
        // });
        // })
        // .catch((error) => res.status(500).json({ message: "error data" }));
      } else {
        res.status(200).json(null);
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
          fullName: response.fullName,
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
      //   fullName: response.fullName,
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
  console.log(req.query);
  FriendRequest.approveFriendRequest({
    userSendRequest: req.query.usersendrequest,
    userRecieveRequest: req.query.userrecieverequest,
  })
    .then((response) =>
      res.status(200).json({ message: "Friend Request Cancel" })
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
      res.status(200).json({ message: "Friend Request Cancel" });
    })
    .catch((error) => {
      res.status(500).json({ message: "Error in Data" });
    });
});

// ************************** CANCEL FRIEND REQUEST ******************************
router.delete("/cancelrequest", (req, res) => {
  FriendRequest.rejectFriendRequest({
    userSendRequest: req.query.userSendRequest,
    userRecieveRequest: req.query.userRecieveRequest,
  })
    .then((response) => {
      res.status(200).json({ message: "Friend Request Cancel" });
    })
    .catch((error) => {
      res.status(500).json({ message: "Error in Data" });
    });
});

// ********************************** GET FRIENDS LIST **********************************
router.get("/friendslist/:id", (req, res) => {
  console.log(req.params)
  Friends.getAllFriendsList(req.params)
    .then((response) => res.status(200).json(response))
    .catch((error) =>
      res.status(500).json({ message: "Error Getting Friends List" })
    );
});

// ************************** CANCEL FRIEND REQUEST *******************************
router.delete("/sendrequest", (req, res) => {
  FriendRequest.rejectFriendRequest({
    userRecieveRequest: req.query.userid,
    userSendRequest: req.query.friendrequest,
  })
    .then((response) =>
      res
        .status(200)
        .json({ friendRequest: response, message: "Friend Request Canceled" })
    )
    .catch((error) => res.status(500).json({ message: "Error Adding User" }));
});

// ************************** DELETE FRIEND  ******************************
router.delete("/deletefriend", (req, res) => {
  console.log(req.query);
  // Friends.deleteFriend({user_id: ,friend_id: })
});

// ********************************** USER LOGOUT **********************************
router.post("/logout", (req, res) => {
  UserDate.setUserDisId(req.body.id);
  res.status(200).json({ message: "User Logout" });
});

const checkUserName = (name) =>
  UserDate.users.find((u) => u.username.toLowerCase() === name.toLowerCase());

export default router;
