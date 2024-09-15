const db = require("../database/dbConfig");

const createUser = async (data) => {
  console.log("dadfesfew", data)
  const id = await db("users").insert(data, "id");
  console.log(id)
  return getUserBy(id[0]);
};

const getUserBy = (data) => {
  console.log(data)
  return db("users").where(data).first();
};

const updateUser = async (id, data) => {
  console.log("update");
  const user = await db("users").update(data).where({ id });
  console.log(user);
};

const getAllUsers = async () => {
  const users = await db("users");
  return users;
};

module.exports = { createUser, getUserBy, getAllUsers, updateUser };
