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
  return db("friendRequest").insert(data, "id");
  // return User.loginUserByEmail({ id: data.friendrequest, email: null });
};

// ************************** CANCEL FRIEND REQUEST *******************************
const rejectFriendRequest = async (data) => {
  const user = db("friendRequest").where(data).del()
  console.log("user", user);
  return user;
};

export default {
  getAllFriendRequestForUser,
  checkFriendRequest,
  sendFriendRequest,
  rejectFriendRequest,
};
