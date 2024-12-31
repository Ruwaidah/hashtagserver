import db from "../database/dbConfig.js";
import User from "./user_model.js";

const getAllFriendRequestForUser = (userId) => {
  console.log(userId);
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
  const id = await db("friendRequest").insert(
    {
      userSendRequest: data.userid,
      userRecieveRequest: data.friendrequest,
    },
    "id"
  );
  return User.getUserById({ id: data.friendrequest });
};

// ************************** CANCEL FRIEND REQUEST *******************************
const cancelFriendRequest = async (data) => {
  const id = await db("friendRequest").where(data).del();
  return getAllFriendRequestForUser(data.userRecieveRequest);
};

export default {
  getAllFriendRequestForUser,
  checkFriendRequest,
  sendFriendRequest,
  cancelFriendRequest,
};
