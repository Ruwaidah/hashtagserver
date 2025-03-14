import db from "../database/dbConfig.js";
import Friend from "./friendRequest-model.js";

// *********************** UPDATE IMAGE *************************
const updateImage = async (userid, image_id, image) => {
  const { id } = await db("images")
    .update({ image: image.url, public_id: image.public_id })
    .where({ id: image_id });
  return getUserBy({ id: userid, text: null });
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
  data.email = data.email.toLowerCase();
  const [id] = await db("users").insert(data, "id");
  return getUserBy({ id: id.id, text: null });
};

// ****************************** CHECK USERNAME AVAILABILITY ***********************************
const checkusername = (data) => {
  return db("users").where(data).first();
};

// *********************** LOGIN USER BY EMAIL *************************
const getUserBy = async (data) => {
  // console.log(data)
  const user = await db("users")
    .where("users.email", data.text)
    .orWhere("users.username", data.text)
    .orWhere("users.id", data.id)
    .join("images", "users.image_id", "images.id")
    .select(
      "users.id",
      "users.create_at",
      "users.firstName",
      "users.lastName",
      "users.username",
      "users.email",
      "users.password",
      "users.image_id",
      "users.bio",
      "images.image",
      "images.public_id"
    )
    .first();
  if (user) {
    const friendReq = await Friend.getAllFriendRequestForUser(user.id);
    return { ...user, friendReq };
  } else return null;
};


// *********************** FIND USER *************************
const findUser = async (data) => {
  return db("users")
    .where({ username: data.username })
    .orWhere({ email: data.email })
    .first();
};

// *********************** SEARCH FOR USER ***********************
const searchForUser = async (data) => {
  const user = await db("users")
    .where("users.email", data.text)
    .orWhere("users.id", data.searchUserId)
    .orWhere("users.username", data.text)
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
    return {
      ...user,
      friendReq: friendReq ? friendReq : {},
      friend: friend ? true : false,
    };
  } else return null;
};

// *********************** UPDATE USER *************************
const updateUser = async (id, data) => {
  const user = await db("users").update(data).where({ id });
  return getUserBy({ id, text: null });
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
      "users.firstName",
      "users.lastName",
      "users.username",
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
  findUser,
  createUser,
  getUserBy,
  getAllUsers,
  updateUser,
  updateImage,
  getAllImages,
  getImage,
  addImage,
  getFriendById,
  searchForUser,
  checkusername,
};
