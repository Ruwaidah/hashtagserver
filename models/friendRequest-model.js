import db from "../database/dbConfig.js";
import User from "./user_model.js";

const getAllFriendRequestForUser = (userId) => {
  return db("friendRequest")
    .where({ userRecieveRequest: userId })
    .join("users", "friendRequest.userSendRequest", "users.id")
    .join("images", "users.image_id", "images.id")
    .select(
      "fullName",
      "users.id",
      "email",
      "bio",
      "images.image",
      "images.public_id"
    );
};

// *********************** CHECK FRIEND REQUEST *************************
const checkFriendRequest = (data) => {
  return db("friendRequest").where(data).first();
};

// *********************** SEND FRIEND REQUEST *************************
const sendFriendRequest = async (data) => {
  const id = await db("friendRequest").insert(data, "id");
  return db("friendRequest").where(data).first();
  // return User.loginUserByEmail({ id: data.friendrequest, email: null });
};

// *********************** APPROVE FRIEND REQUEST *************************
const approveFriendRequest = async (data) => {
  console.log(data)
  const id = await db("friendRequest").where(data).del();
  console.log("id",id)
  return db("friends").insert(
    {
      user_id: data.userSendRequest,
      friend_id: data.userRecieveRequest,
    },
    "id"
  );
};

// ************************** CANCEL FRIEND REQUEST *******************************
const rejectFriendRequest = async (data) => {
  const user = await db("friendRequest").where(data).del();
  return user;
};



export default {
  getAllFriendRequestForUser,
  checkFriendRequest,
  sendFriendRequest,
  rejectFriendRequest,
  approveFriendRequest,
};
