const router = require("express").Router();
const UserState = require("../usersdata");

router.post("/", (req, res) => {
  console.log(req.body);
});

module.exports = router;
