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
  Messages.getMessagesBetweenUsers(req.query)
    .then((response) => {
      // console.log(response)
      // if (!response) res.status(200).json({ message: "No Message Found" });
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error Getting Data" });
    });
});

// *********************** GET ALL MESSAGES LIST FOR USER *************************
router.get("/listmessages", authentication, (req, res) => {
  Messages.getAllMessagesList(req.query.userid)
    .then((users) => {
      // let messages = [];
      let data = {};
      const length = users.length;
      users.map(async (user, index) => {
        const da = await Messages.getMessagesBetweenUsers({
          userid: req.query.userid,
          friendid: user.friendId,
        })
          .then((msgs) => {
            data[user.friendId] = msgs;
            // messages = [...messages, { ...msgs, messageId: user.id }];
            // if (index === length - 1) {
            if (Object.keys(data).length === users.length) {
              res.status(200).json(data);
            } else return;
          })
          .catch((error) =>
            res.status(500).json({ message: "Error Getting Data" })
          );
      });
      if (length < 1) res.status(200).json([]);
    })
    .catch((error) => res.status(500).json({ message: "Error Getting Data" }));
});

export default router;
