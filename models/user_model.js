const db = require("../database/dbConfig");

const createUser = (data) => {
  return db("users").insert(data, "id");
};

const getUserBy = (data) => {
  return db("users").where(data).first();
};

module.exports = { createUser, getUserBy };
