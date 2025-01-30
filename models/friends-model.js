import db from "../database/dbConfig.js";

const getAllFriendsList = async (data) => {
  const friends1 = await db("friends")
    .where({ user_id: data.id })
    .join("users", "friends.friend_id", "users.id")
    .join("images", "users.image_id", "images.id")
    .select(
      "friends.id",
      "friends.friend_id as userId",
      "users.firstName",
      "users.lastName",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    );

  const friends2 = await db("friends")
    .where({ friend_id: data.id })
    .join("users", "friends.user_id", "users.id")
    .join("images", "users.image_id", "images.id")
    .select(
      "friends.id",
      "friends.user_id as userId",
      "users.firstName",
      "users.lastName",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    );

  return [...friends1, ...friends2];
};

const findFriend = (data) => db("users").where(data);

// ************************** DELETE FRIEND  ******************************
const deleteFriend = async (data) => {
  const user = await db("friends")
    .where({ user_id: data.user_id })
    .orWhere({ friend_id: data.user_id })
    .del();
    return getAllFriendsList({id: data.user_id})
};

export default {
  getAllFriendsList,
  findFriend,
  deleteFriend,
};
