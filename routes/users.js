import express, { response } from "express";
import User from "../models/user_model.js";
import bcrypt from "bcryptjs";
import UserDate from "../usersdata.js";
import generateToken from "../generateToken.js";
import uplaodImg from "./imageUpload.js";
import Friends from "../models/friends-model.js";
import FriendRequest from "../models/friendRequest-model.js";
import protectRoute from "../api/auth.middleware.js";
import nodemailer from "nodemailer";
import randomstring from "randomstring";

const router = express.Router();

// ********************************** REGISTER NEW USER ******************************
router.post("/register", (req, res) => {
  const user = req.body;
  user.username = user.username.toLowerCase();
  user.email = user.email.toLowerCase();
  // console.log(user);
  User.findUser({
    username: user.username.toLowerCase(),
    email: user.email.toLowerCase(),
  })
    .then((response2) => {
      if (response2) {
        if (response2.email == user.email)
          res.status(409).json({ message: "Email already taken" });
        else res.status(409).json({ message: "Username already taken" });
      } else {
        user.password = bcrypt.hashSync(user.password, 8);
        User.createUser({ ...req.body, image_id: 1 })
          .then((response) => {
            const token = generateToken(response.id);
            res.status(201).json({
              id: response.id,
              firstName: response.firstName,
              lastName: response.lastName,
              username: response.username,
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
            console.log(error);
            res.status(500).json({ message: "Error create new user" });
          });
      }
    })
    .catch((error) => {
      // console.log(error)
      res.status(500).json({ message: "Error create new user" });
    });
});

// ********************************** LOGIN USER **********************************
router.post("/login", async (req, res) => {
  User.getUserBy({ text: req.body.text.toLowerCase(), id: null })
    .then((user) => {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        const token = generateToken(user.id);
        res.status(200).json({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
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

// *********************** RECOVERY PASSWORD *************************
const sendEmail = (recipient_email, OTP, res) => {
  return new Promise((resolve, reject) => {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });
    console.log("OTP", OTP);
    console.log(process.env.EMAIL, process.env.PASSWORD);
    const mail_configs = {
      from: process.env.EMAIL,
      to: recipient_email,
      subject: "Welcome",
      html: `<!DOCTYPE html>
          <html>
            <head>
            </head>
            <body>
              <div>
                <p>User the code below to reset password ${OTP}</p>
              </div>
            </body>
          </html>`,
    };
    return transporter.sendMail(mail_configs, (error, info) => {
      if (error) {
        console.log(error);
        return error;
      } else {
        console.log("succese");
        res.status(200).json({ hashedOtp: bcrypt.hashSync(OTP, 10) });
      }
    });
  });
};

router.post("/send_recovery_email", async (req, res) => {
  console.log(req.body);
  const otp = generateOTP();
  console.log(otp);
  sendEmail(req.body.email, otp, res);
  // console.log("data", data);
  // .then((response) => {
  //   console.log("response", response);
  //   const hashedOtp = bcrypt.hashSync(otp, 10);
  //   res.status(200).json({ hashedOtp });
  // })
  // .catch((error) => {
  //   console.log("error", error);
  // });
});

// *********************** VERIFY OTP *************************
router.post("/verify_otp", (req, res) => {
  console.log(req.body);
  if (bcrypt.compareSync(req.body.data, req.body.hashedOtp)) {
    res.status(200).json({ message: "Successfully" });
  } else {
    res.status(401).json({ message: "You Entered Wrong Code" });
  }
});

// ********************************** GET USER **********************************
router.get("/getuser/:id", protectRoute, (req, res) => {
  const { id } = req.params;
  User.getUserBy({ id, text: null })
    .then((user) => {
      res.status(200).json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
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
});

// ****************************** CHECK USERNAME AVAILABILITY ***********************************
router.post("/checkusername", (req, res) => {
  const { username } = req.body;
  User.checkusername({ username })
    .then((response) => {
      if (response) res.status(200).json({ message: "Not Available" });
      else res.status(200).json({ message: "Available" });
    })
    .catch((error) => res.status(500).json({ message: "Error in Data" }));
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
        username: user.username,
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
  User.searchForUser({
    text: req.body.text,
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
    text: null,
  })
    .then((response) => {
      if (response) {
        res.status(200).json({
          firstName: response.firstName,
          lastName: response.lastName,
          username: response.username,
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
    })
    .catch((error) => {
      res.status(500).json({ message: "error data" });
    });
});

// ************************** APPROVE FRIEND REQUEST ******************************
router.get("/acceptfriendrequest", (req, res) => {
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
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error in Data" });
    });
});

// ********************************** GET FRIENDS LIST **********************************
router.get("/friendslist/:id", (req, res) => {
  Friends.getAllFriendsList(req.params)
    .then((response) => res.status(200).json(response))
    .catch((error) =>
      res.status(500).json({ message: "Error Getting Friends List" })
    );
});

// ************************** DELETE FRIEND  ******************************
router.delete("/deletefriend", (req, res) => {
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

// ********************************** GENERATE OTP **********************************
const generateOTP = () => {
  return randomstring.generate({ length: 4, charset: "numeric" });
};
