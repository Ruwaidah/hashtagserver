const db = require("../database/dbConfig");

const createUser = (data) => {
  return db("users").insert(data, "id");
};

const getUserBy = (data) => {
  console.log("database",data)
  return db("users").where(data).first();
};

const getAllUsers = async () => {
  const users = await db("users");
  return users;
};

module.exports = { createUser, getUserBy, getAllUsers };
