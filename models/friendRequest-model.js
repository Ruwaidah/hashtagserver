import db from "../database/dbConfig.js";

const getAllFriendRequestForUser = (userId) => {
  console.log(userId);
  return db("friendRequest")
    .where({ userRecieveRequest: userId })
    .join("users", "friendRequest.userSendRequest", "users.id")
    .join("images", "users.image_id", "images.id")
    .select("fullName", "email", "bio", "images.image", "images.public_id");
};

export default { getAllFriendRequestForUser };
