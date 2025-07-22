import express from "express";
import authentication from "../api/auth.middleware.js";
import Messages from "../models/messages-model.js";
const router = express.Router();

// *********************** SAVE MESSAGE *************************
router.post("/", authentication, (req, res) => {
  Messages.sendMessage(req.body)
    .then((response) => res.status(200).json(response))
    .catch((error) => {
      res.status(500).json({ message: "Error Sending Message" });
    });
});

// *********************** GET ALL PRIVATE MESSAGE BETWEEN TWO USER *************************
router.get("/", authentication, (req, res) => {
  console.log(req.query)
  Messages.getMessagesBetweenUsers(req.query)
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error Getting Data" });
    });
});

// *********************** GET ALL MESSAGES LIST FOR USER *************************
router.get("/listmessages", authentication, (req, res) => {
  console.log(req.query)
  Messages.getAllMessagesList(req.query.userid)
    .then((users) => {
      console.log(users)
      let data = {};
      let totalUnreadMsgs = 0;
      const length = users.length;
      users.map(async (user, index) => {
        const da = await Messages.getMessagesBetweenUsers({
          userid: req.query.userid,
          friendid: user.friendId,
        })
          .then((msgs) => {
            console.log(msgs)
            data[user.friendId] = msgs;
            totalUnreadMsgs = totalUnreadMsgs + msgs.numberOfMsgUnread;
            if (Object.keys(data).length === users.length) {
              res.status(200).json({ data, totalUnreadMsgs });
            } else return;
          })
          .catch((error) =>{
            console.log(error)
            res.status(500).json({ message: "Error Getting Data" })}
          );
      });
      if (length < 1) res.status(200).json({});
    })
    .catch((error) => res.status(500).json({ message: "Error Getting Data" }));
});

// ************************** OPEN UNREAD MESSAGE ******************************
router.put("/openmessages", authentication, (req, res) => {
  Messages.openReadMessage(req.body)
    .then((data) => {
      res.status(200).json({ message: "read message" });
    })
    .catch((error) => {
      res.status(500).json({ message: "Error Getting Data" });
    });
});

export default router;
