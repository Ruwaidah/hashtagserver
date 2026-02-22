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
      res.status(200).json(response);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error Getting Data" });
    });
});

// *********************** GET ALL MESSAGES LIST FOR USER *************************
router.get("/listmessages", authentication, async (req, res) => {
  try {
    const userId = req.query.userid;
    const result = await Messages.getMessagesList(userId);
    console.log(result)
    return res.status(200).json(result);
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: "Error Getting Data" });
  }
});



// ************************** OPEN UNREAD MESSAGE ******************************
router.put("/openmessages", authentication, async (req, res) => {
  try {
    const updatedCount = await Messages.openReadMessage(req.body);
    res.status(200).json({ updatedCount });
  } catch (err) {
    res.status(500).json({ message: "Error Getting Data" });
  }
});


export default router;
