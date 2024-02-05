const router = require("express").Router();
const UserState = require("../usersdata")


router.get("/:room", (req ,res) => {
    console.log(UserState.users)
    console.log(req.params)

})

module.exports = router;
