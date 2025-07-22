import db from "../database/dbConfig.js";

const getAllFriendsList = async (data) => {
  const friends1 = await db("friends")
    .where({ user_id: data.id })
    .join("users", "friends.friend_id", "users.id")
    .join("images", "users.image_id", "images.id")
    .select(
      "friends.id",
      "friends.friend_id as friendId",
      "users.firstName",
      "users.lastName",
      "users.username",
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
      "friends.user_id as friendId",
      "users.firstName",
      "users.lastName",
      "users.username",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    );

  return [...friends1, ...friends2];
};

const findFriend = (data) => db("users").where(data);

// ************************** IS FRIEND  ******************************
const isFriend = (data) => {
  return db("friends")
    .where({ user_id: data.userid, friend_id: data.friendId })
    .orWhere({ user_id: data.friendId, friend_id: data.userid })
    .first();
};

// ************************** DELETE FRIEND  ******************************
const deleteFriend = async (data) => {
  const user = await db("friends")
    .where({ user_id: data.user_id })
    .orWhere({ friend_id: data.user_id })
    .del();
  return getAllFriendsList({ id: data.user_id });
};

// ********************************** SEARCH USER BY USERNAME **********************************
const searchUserByUsername = async (data) => {
  console.log(data);
  const friendReq = await db("friendRequest");
  const user = await db("users")
    .where("users.username", data.username)
    .join("images", "users.image_id", "images.id")
    .select(
      "users.id",
      "users.create_at",
      "users.firstName",
      "users.lastName",
      "users.username",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    )
    .first();
  if (user) {
    const friend = await db("friends")
      .where({ user_id: data.userid, friend_id: user.id })
      .orWhere({ user_id: user.id, friend_id: data.userid })
      .first();
    const friendReq = await db("friendRequest")
      .where({
        userSendRequest: data.userid,
        userRecieveRequest: user.id,
      })
      .orWhere({
        userRecieveRequest: data.userid,
        userSendRequest: user.id,
      })
      .first();
    return {
      ...user,
      friendReq: friendReq ? friendReq : null,
      friend: friend ? true : false,
    };
  } else return null;
};

export default {
  getAllFriendsList,
  findFriend,
  deleteFriend,
  isFriend,
  searchUserByUsername,
};
