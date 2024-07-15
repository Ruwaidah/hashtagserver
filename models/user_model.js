const db = require("../database/dbConfig");

const createUser = async (data) => {
  const id = await db("users").insert(data, "id").first();
  return getUserBy({ id });
};

const getUserBy = (data) => {
  return db("users").where(data).first();
};

const getAllUsers = async () => {
  const users = await db("users");
  return users;
};

module.exports = { createUser, getUserBy, getAllUsers };
