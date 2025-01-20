import db from "../database/dbConfig.js";
import Friend from "./friendRequest-model.js";

// *********************** UPDATE IMAGE *************************
const updateImage = async (userid, image_id, image) => {
  const { id } = await db("images")
    .update({ image: image.url, public_id: image.public_id })
    .where({ id: image_id });
  return loginUserByEmail({ id: userid, email: null });
};

// *********************** ADD IMAGE *************************
const addImage = async (userid, image) => {
  const id = await db("images").insert(
    { public_id: image.public_id, image: image.url },
    "id"
  );
  return updateUser(userid, { image_id: id[0].id });
};

// *********************** CREATE NEW USER *************************
const createUser = async (data) => {
  const id = await db("users").insert(data, "id");
  return loginUserByEmail({ id: id[0], email: null });
};

// *********************** LOGIN USER BY EMAIL *************************
const loginUserByEmail = async (data) => {
  const user = await db("users")
    .where("users.email", data.email)
    .orWhere("users.id", data.id)
    .join("images", "users.image_id", "images.id")
    .select(
      "users.id",
      "users.create_at",
      "users.fullName",
      "users.email",
      "users.password",
      "users.image_id",
      "users.bio",
      "images.image",
      "images.public_id"
    )
    .first();
  if (user) {
    const friendReq = await Friend.getAllFriendRequestForUser(data.id);
    return { ...user, friendReq };
  } else return null;
};

// *********************** SEARCH FOR USER ***********************
const searchForUser = async (data) => {
  const user = await db("users")
    .where("users.email", data.email)
    .orWhere("users.id", data.searchUserId)
    .join("images", "users.image_id", "images.id")
    .select(
      "users.id",
      "users.create_at",
      "users.fullName",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    )
    .first();
  if (user) {
    const friend = await db("friends")
      .where({ user_id: data.userid, friend_id: data.searchUserId })
      .orWhere({ user_id: data.searchUserId, friend_id: data.userid })
      .first();
    const friendReq = await db("friendRequest")
      .where({
        userSendRequest: data.userid,
        userRecieveRequest: data.searchUserId,
      })
      .orWhere({
        userRecieveRequest: data.userid,
        userSendRequest: data.searchUserId,
      })
      .first();

    // const userRecieveRequest = await db("friendRequest")
    //   .where({
    //     userSendRequest: data.userid,
    //     userRecieveRequest: data.searchUserId,
    //   })
    //   .first();

    // const userSendRequest = await db("friendRequest")
    //   .where({
    //     userRecieveRequest: data.userid,
    //     userSendRequest: data.searchUserId,
    //   })
    //   .first();
    return {
      ...user,
      friendReq: friendReq ? friendReq : {},
      friend: friend ? true : false,
    };
  } else return null;
};

// *********************** GET USER BY ID *************************
const getUserById = async (data) => {
  return db("users")
    .where("users.id", data.id)
    .join("images", "users.image_id", "images.id")
    .select(
      "users.id",
      "users.create_at",
      "users.fullName",
      "users.email",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    )
    .first();
};

// *********************** UPDATE USER *************************
const updateUser = async (id, data) => {
  const user = await db("users").update(data).where({ id });
  return loginUserByEmail({ id, email: null });
};

// *********************** GET IMAGE *************************
const getImage = (id) => {
  return db("images").where({ id }).first();
};

// *********************** GET FRIEND BY ID *************************
const getFriendById = async (data) => {
  const user = await db("users")
    .where("users.id", data.friendid)
    .join("images", "users.image_id", "images.id")
    .select(
      "users.id",
      "users.create_at",
      "users.fullName",
      "users.email",
      "users.image_id",
      "users.bio",
      "images.image",
      "images.public_id"
    )
    .first();
  if (user) {
    const friendReq = await db("friendRequest")
      .where({
        userSendRequest: data.friendid,
        userRecieveRequest: data.userid,
      })
      .orWhere({
        userSendRequest: data.userid,
        userRecieveRequest: data.friendid,
      })
      .first();
    return { ...user, friendReq };
  }
  return null;
};

const getAllUsers = async () => {
  const users = await db("users");
  return users;
};

// *********************** GET ALL IMAGES *************************
const getAllImages = () => {
  return db("images");
};

export default {
  createUser,
  loginUserByEmail,
  getAllUsers,
  updateUser,
  updateImage,
  getUserById,
  getAllImages,
  getImage,
  addImage,
  getFriendById,
  searchForUser,
};
