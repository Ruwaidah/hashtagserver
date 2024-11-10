const db = require("../database/dbConfig.js");

const getRooms = () =>
  db("groupslist")
    .join("users", "groupslist.user_id", "users.id")
    .select(
      "groupslist.id",
      "username",
      "roomname",
      "numberofusers",
      "groupslist.create_at",
      "user_id"
    );

const getRoomBy = (data) => {
  return db("groupslist")
    .where({ "groupslist.id": data.id })
    .join("users", "groupslist.user_id", "users.id")
    .select(
      "groupslist.id",
      "username",
      "roomname",
      "numberofusers",
      "groupslist.create_at"
    ).first()
};

module.exports = { getRooms, getRoomBy };
