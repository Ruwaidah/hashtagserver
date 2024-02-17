const router = require("express").Router();
const User = require("../models/user_model")
const UserState = require("../usersdata");

router.post("/", (req, res) => {
  console.log(req.body);
  User.createUser(req.body).then(response => {
    console.log(response)
    if (response) {

    } else {
      res.status()
    }
  } ).catch(error => {
    if (error.code === "23505") {
      const regex = new RegExp(`${req.body.username}|${req.body.email}|=|Key|[().]`,"g")
      const msg = error.detail.replace(regex, "")
      res.status(500).json({message: msg})
    } else {
      res.status(500).json({message: "Error create new data"})
    }
  })
});

module.exports = router;


