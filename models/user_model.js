import db from "../database/dbConfig.js";

// *********************** UPDATE IMAGE *************************
const updateImage = async (userid, image_id, image) => {
  const { id } = await db("images")
    .update({ image: image.url, public_id: image.public_id })
    .where({ id: image_id });
  return getUserById({ id: userid });
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
  return getUserById(id[0]);
};

// *********************** GET USER BY ID *************************
const getUserById = (data) => {
  return db("users")
    .where("users.id", data.id)
    .join("images", "users.image_id", "images.id")
    .select(
      "users.id",
      "users.create_at",
      "users.fullName",
      "users.email",
      "users.password",
      "users.image_id",
      "images.image",
      "images.public_id"
    )
    .first();
};

// *********************** GET USER BY *************************
const getUserBy = (data) => {
  // return db("users").where({ "users.fullName": data.username }).first();
  return db("users")
    .where("users.email", data.email)
    .join("images", "users.image_id", "images.id")
    .select(
      "users.id",
      "users.create_at",
      "users.fullName",
      "users.email",
      "users.password",
      "users.image_id",
      "users.bio",
      // "users.isAdmin",
      "images.image",
      "images.public_id"
    )
    .first();
};

// *********************** UPDATE USER *************************
const updateUser = async (id, data) => {
  const user = await db("users").update(data).where({ id });
  return getUserById({ id });
};

// *********************** GET IMAGE *************************
const getImage = (id) => {
  return db("images").where({ id }).first();
};

const getAllUsers = async () => {
  const users = await db("users");
  return users;
};

// *********************** SEND FRIEND REQUEST *************************
const sendFriendRequest = (data) => {
  return db("friendRequest").insert(
    {
      userSendRequest: data.userid,
      userRecieveRequest: data.friendrequest,
    },
    "id"
  );
};

// *********************** CHECK FRIEND REQUEST *************************
const checkFriendRequest = (data) => {
  return db("friendRequest").where(data).first()
};

// *********************** GET ALL IMAGES *************************
const getAllImages = () => {
  return db("images");
};

export default {
  createUser,
  getUserBy,
  getAllUsers,
  updateUser,
  updateImage,
  getUserById,
  getAllImages,
  getImage,
  addImage,
  sendFriendRequest,
  checkFriendRequest,
};
