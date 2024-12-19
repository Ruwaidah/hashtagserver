import db from "../database/dbConfig.js";

const getAllFriendsList = (data) => {
  return db("friends").where(data);
};

const findFriend = (data) => db("users").where(data);

export default {
  getAllFriendsList,
  findFriend,
};
