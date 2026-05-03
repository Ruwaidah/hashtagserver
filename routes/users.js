import express, { response } from "express";
import User from "../models/user_model.js";
import bcrypt from "bcryptjs";
import UserDate from "../usersdata.js";
import generateToken from "../generateToken.js";
// import uplaodImg from "./imageUpload.js";
import { imageuploadBuffer } from "./imageUpload.js";
import Friends from "../models/friends-model.js";
import FriendRequest from "../models/friendRequest-model.js";
import protectRoute from "../api/auth.middleware.js";
import nodemailer from "nodemailer";
import randomstring from "randomstring";
import multer from "multer";
import { OAuth2Client } from "google-auth-library";
import { generateFromEmail, generateUsername } from "unique-username-generator";


const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// ********************************** LOGIN USER WITH GOOGLE ******************************
router.post("/google-login", async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) return res.status(400).json({ message: "Missing access_token" });

    // Get user profile from Google using the access token
    const r = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!r.ok) return res.status(401).json({ message: "Invalid Google token" });

    const profile = await r.json();

    const existing = await User.getUserBy({ text: profile.email, id: null });

    if (existing) {
      const token = generateToken(existing.id);
      return res.status(200).json({ ...existing, token });
    }

    // create user
    const username = generateUsername("", 6, 10);

    const imageId = await User.addNewImage({
      image: profile.picture,
      public_id: profile.sub,
    });

    const created = await User.createUser({
      firstName: profile.given_name,
      lastName: profile.family_name,
      username,
      email: profile.email,
      password: profile.sub,
      image_id: imageId[0].id,
    });

    const token = generateToken(created.id);
    return res.status(201).json({ ...created, token });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Registration failed." });
  }
});



// ********************************** REGISTER NEW USER ******************************
router.post("/register", (req, res) => {
  const user = req.body;
  user.username = user.username.toLowerCase();
  user.email = user.email.toLowerCase();
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
            res.status(500).json({ message: "Error create new user" });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ message: "Error create new user" });
    });
});

// ********************************** LOGIN USER **********************************
router.post("/login", async (req, res) => {
  console.log(req.body)
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
        res.status(401).json({ message: "invalid Email or Password" });
      }
    })
    .catch((error) => {
      console.log(error)
      res.status(500).json({ message: "Invalidd Email or Password" });
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
    const mail_configs = {
      from: process.env.EMAIL,
      to: recipient_email,
      subject: "Your Connect reset code",
      html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background:#0b1220;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;border-radius:18px;overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding:22px 22px 14px;background:linear-gradient(180deg,#0f1a33 0%, #0b1220 100%);border:1px solid rgba(255,255,255,0.08);border-bottom:none;">
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;border-radius:12px;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.25);display:inline-block;"></div>
                <div style="color:#ffffff;font-weight:700;font-size:16px;letter-spacing:0.3px;">
                  Connect
                </div>
              </div>
              <div style="margin-top:12px;color:#ffffff;font-size:20px;font-weight:700;">
                Reset your password
              </div>
              <div style="margin-top:6px;color:rgba(255,255,255,0.72);font-size:13px;line-height:1.4;">
                Use the code below to reset your password. This code expires soon for your security.
              </div>
            </td>
          </tr>

          <!-- Card Body -->
          <tr>
            <td style="padding:18px 22px 22px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-top:none;">
              
              <!-- OTP Box -->
              <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);border-radius:16px;padding:16px;">
                <div style="color:rgba(255,255,255,0.75);font-size:12px;">
                  Your 4-digit code
                </div>

                <div style="margin-top:10px;text-align:center;">
                  <div style="
                    display:inline-block;
                    padding:14px 18px;
                    border-radius:14px;
                    background:rgba(56,189,248,0.10);
                    border:1px solid rgba(56,189,248,0.25);
                    color:#ffffff;
                    font-size:28px;
                    font-weight:800;
                    letter-spacing:10px;
                    line-height:1;
                  ">
                    ${OTP}
                  </div>
                </div>

                <div style="margin-top:12px;color:rgba(255,255,255,0.65);font-size:12px;line-height:1.4;text-align:center;">
                  If you didn’t request this, you can safely ignore this email.
                </div>
              </div>

              <!-- Safety note -->
              <div style="margin-top:14px;color:rgba(255,255,255,0.60);font-size:12px;line-height:1.5;">
                <b style="color:rgba(255,255,255,0.80);">Security tip:</b>
                Never share this code with anyone. Connect staff will never ask for it.
              </div>

              <!-- Footer -->
              <div style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.50);font-size:11px;line-height:1.4;">
                Sent to <span style="color:rgba(255,255,255,0.75);">${recipient_email}</span><br/>
                © ${new Date().getFullYear()} Connect
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    };
    return transporter.sendMail(mail_configs, (error, info) => {
      if (error) {
        return error;
      } else {
        res.status(200).json({
          email: recipient_email,
          hashedOtp: bcrypt.hashSync(OTP, 10),
        });
      }
    });
  });
};

router.post("/send_recovery_email", async (req, res) => {
  const otp = generateOTP();
  sendEmail(req.body.email, otp, res);
});

// **************************** VERIFY OTP ***********************************
router.post("/verify_otp", (req, res) => {
  if (
    req.body.hashedOtp &&
    bcrypt.compareSync(req.body.data, req.body.hashedOtp)
  ) {
    res.status(200).json({ message: "Successfully" });
  } else if (!req.body.hashedOtp) {
    res.status(401).json({ message: "Wrong Code" });
  } else {
    res.status(401).json({ message: "Wrong Code" });
  }
});

// **************************** FORGET PASSWORD ***********************************
router.post("/forget_password", (req, res) => {
  const data = req.body;
  data.password = bcrypt.hashSync(data.password, 8);
  User.changePassword({
    email: data.email.toLowerCase(),
    password: data.password,
  })
    .then((response) =>
      res.status(200).json({ message: "Update Successfully" })
    )
    .catch((error) => res.status(500).json({ message: "Error Getting Data" }));
});

// *********************** CHANGE PASSWORD *************************
router.post("/change-password/:userid", (req, res) => {
  User.getUserById({ id: req.params.userid })
    .then((user) => {
      if (bcrypt.compareSync(req.body.oldPas, user.password)) {
        if (bcrypt.compareSync(req.body.newPsw, user.password)) {
          res.status(401).json({
            message: "New password can't be the same as old password",
          });
        } else {
          User.changePassword({
            password: bcrypt.hashSync(req.body.newPsw, 8),
            email: user.email,
          })
            .then((response) =>
              res.status(200).json({ message: "Password Changed" })
            )
            .catch((error) => {
              res
                .status(500)
                .json({ message: "Error changing password, Please try again" });
            });
        }
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: "Error changing password, Please try again" });
    });
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
    .catch((errer) => res.status(500).json({ message: "Error Getting Data" }));
});

// ****************************** CHECK USERNAME AVAILABILITY ***********************************
router.post("/checkusername", (req, res) => {
  const { username } = req.body;
  if (username.length < 3) {
    res.status(401).json({ isUsernameAvailable: false });
  } else if (username.length > 10) {
    res.status(401).json({ isUsernameAvailable: false });
  } else {
    User.checkusername({ username })
      .then((response) => {
        if (response) res.status(401).json({ isUsernameAvailable: false });
        else res.status(200).json({ isUsernameAvailable: true });
      })
      .catch((error) => res.status(500).json({ message: "Error in Data" }));
  }
});


// ****************************** CHECK EMAIL AVAILABILITY ***********************************
router.post("/checkemail", (req, res) => {
  const { email } = req.body;
  const validateEmail = (email) => {
    return email.toLowerCase().match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };
  if (validateEmail(email)) {
    User.checkusername({ email })
      .then((response) => {
        if (response) res.status(401).json({ isEmailAvailable: false });
        else res.status(200).json({ isEmailAvailable: true });
      })
      .catch((error) => res.status(500).json({ message: "Error in Data" }));
  } else {
    res.status(401).json({ isEmailAvailable: false });
  }
});

// ********************************** UPDATE USER **********************************
router.put("/updateuser/:id", protectRoute, upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userUpdate = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        bio: req.body.bio,
      };

      const imageId = Number(req.body.image_id);
      const oldPublicId = req.body.public_id;

      // If image uploaded:
      if (req.file) {
        const uploaded = await imageuploadBuffer(req.file.buffer);
        const imageData = {
          image: uploaded.secure_url,
          public_id: uploaded.public_id,
        };

        // if user had default image row id=1, create a new image and attach
        if (imageId === 1) {
          await User.addImage(id, imageData)
        } else {
          // delete old image
          await uplaodImg.deleteImage(oldPublicId);
          await User.updateImage(id, imageId, imageData);
        }
      }
      const user = await User.updateUser(id, userUpdate);

      return res.status(200).json({
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
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Unable Update User" });
    }
  }
);


// ********************************** UPDATE USER PASSWORD **********************************
router.put("/updateuser-password/:id", protectRoute, (req, res) => {
  const { id } = req.params;
  User.getUserById({ id }).then(response => {
    if (bcrypt.compareSync(req.body.password, response.password)) {
      if (bcrypt.compareSync(req.body.newPassword, response.password)) {
        res.status(401).json({ message: "New password must be different from your current password." });
      }
      else {
        const newPassword = bcrypt.hashSync(req.body.newPassword, 8);
        User.updateUser(id, { password: newPassword }).then(user => {
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
        }).catch(err => res.status(500).json({ message: "Unable Update User" }))
      }
    } else {
      res.status(401).json({ message: "Wrong Password" });
    }

  }).catch(error => console.log(error))

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

// ********************************** SEARCH USER BY USERNAME **********************************
router.post("/findfriend", (req, res) => {
  console.log("Rwtw", req.body)
  Friends.searchUserByUsername({
    username: req.body.username,
    userid: req.query.userid,
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
  console.log("Ewfwef ")
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
      res
        .status(200)
        .json({
          message: "Friend Request Sent",
          response: response[0],
          friendReq: response[1],
        });
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
