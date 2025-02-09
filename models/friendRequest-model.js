import db from "../database/dbConfig.js";
import User from "./user_model.js";

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
  const id = await db("friendRequest").where(data).del();
  return db("friends").insert(
    {
      user_id: data.userSendRequest,
      friend_id: data.userRecieveRequest,
    },
    "id"
  );
};

// ************************** GET ALL FRIEND REQUEST FOR USER *******************************
const getAllFriendRequestForUser = async (userId) => {
  const friendReq1 = await db("friendRequest")
    .where({ userSendRequest: userId })
    .join("users", "friendRequest.userRecieveRequest", "users.id")
    .join("images", "users.image_id", "images.id")
    .select(
      "friendRequest.id as id",
      "friendRequest.userRecieveRequest as userRecieveRequest",
      "friendRequest.userSendRequest as userSendRequest",
      "users.firstName",
      "users.lastName",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    );

  const friendReq2 = await db("friendRequest")
    .where({ userRecieveRequest: userId })
    .join("users", "friendRequest.userSendRequest", "users.id")
    .join("images", "users.image_id", "images.id")
    .select(
      "friendRequest.id as id",
      "friendRequest.userRecieveRequest as userRecieveRequest",
      "friendRequest.userSendRequest as userSendRequest",
      // "users.id as userId",
      "users.firstName",
      "users.lastName",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    );

  return [...friendReq1, ...friendReq2];
};

// ************************** CANCEL FRIEND REQUEST *******************************
const rejectFriendRequest = async (data) => {
  const user = await db("friendRequest").where(data).del();
  return getAllFriendRequestForUser(data.userSendRequest);
};

export default {
  getAllFriendRequestForUser,
  checkFriendRequest,
  sendFriendRequest,
  rejectFriendRequest,
  approveFriendRequest,
};
