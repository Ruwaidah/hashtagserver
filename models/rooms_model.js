const db = require("../database/dbConfig.js");

const getRooms = () =>
  db("roomslist")
    .join("users", "roomslist.user_id", "users.id")
    .select(
      "roomslist.id",
      "username",
      "roomname",
      "numberofusers",
      "roomslist.create_at",
      "user_id"
    );
module.exports = { getRooms };
