const db = require("../database/dbConfig");

// *********************** UPDATE IMAGE *************************
const updateImage = async (image_id, image) => {
  const { id } = await db("images")
    .update({ image: image.url, public_id: image.public_id })
    .where({ id: image_id });
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
  console.log(id);
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
      "users.username",
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
  // return db("users").where({ "users.username": data.username }).first();
  return db("users")
    .where("users.username", data.username)
    .join("images", "users.image_id", "images.id")
    .select(
      "users.id",
      "users.create_at",
      "users.username",
      "users.email",
      "users.password",
      "users.image_id",
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

// *********************** GET ALL IMAGES *************************
const getAllImages = () => {
  return db("images");
};

module.exports = {
  createUser,
  getUserBy,
  getAllUsers,
  updateUser,
  updateImage,
  getUserById,
  getAllImages,
  getImage,
  addImage,
};
