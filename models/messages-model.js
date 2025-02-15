import db from "../database/dbConfig.js";
import uniqid from "uniqid";

// *********************** GET MESSAGE BY ID *************************
const getMsgById = async (id) => {
  return db("message").where(id).first();
};

// *********************** SEND MESSAGE *************************
const sendMessage = async (data) => {
  const msgConnect = await db("message_connect")
    .where({
      userId: data.senderId,
      friendId: data.receiverId,
    })
    .first();
  if (!msgConnect) {
    const createId = uniqid();
    const newMsg1 = await db("message_connect").insert(
      { userId: data.senderId, friendId: data.receiverId },
      "id"
    );
    const newMsg2 = await db("message_connect").insert(
      { userId: data.receiverId, friendId: data.senderId },
      "id"
    );
  }
  const [id] = await db("message").insert(data, "id");
  return getMsgById(id);
  // return db("message").insert({ connectId: id[0], text: data.text }, "id");
};

// senderId: user.id,
// receiverId: searchFriend.id,
// text: data.msg,
// msged: privateMessages.message ? false : true,

// *********************** GET ALL PRIVATE MESSAGE BETWEEN TWO USER *************************
const getMessagesBetweenUsers = async (data) => {
  const isConnected = await db("message_connect")
    .where({ userId: data.userid, friendId: data.friendid })
    .join("users", "message_connect.friendId", "users.id")
    .join("images", "users.image_id", "images.id")
    .select(
      "message_connect.id as connectId",
      "message_connect.friendId as id",
      "users.firstName",
      "users.lastName",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    )
    .first();
  if (!isConnected) {
    return { friend: isConnected, messages: [] };
  } else {
    const msgBetweenUserAndFriend = await db("message")
      .where({ receiverId: data.userid, senderId: data.friendid })
      .orWhere({ receiverId: data.friendid, senderId: data.userid });

    return {
      connectId: isConnected.connectId,
      friend: isConnected,
      messages: msgBetweenUserAndFriend,
    };
  }
  //   .where({ receiverId: data.userid, senderId: data.friendid })
  //   .orWhere({ receiverId: data.friendid, senderId: data.userid });
};

// *********************** GET ALL MESSAGES LIST FOR USER *************************
const getAllMessagesList = async (id) => {
  const textedUsersIds = await db("message_connect")
    // .join("users", "message.receiverId", "users.id")
    .where({ userId: id });
  // .join("users", "message_connect.friendId", "users.id")
  // .join("images", "users.image_id", "images.id")
  // .select(
  //   "message_connect.id",
  //   "message_connect.friendId as friendId",
  //   "users.firstName",
  //   "users.lastName",
  //   "users.bio",
  //   "users.image_id",
  //   "images.image",
  //   "images.public_id"
  // );
  return textedUsersIds;
  // const allData = textedUsersIds.map(async (user) => {
  //   const messages = await getMessagesBetweenUsers({
  //     userid: id,
  //     friendid: user.friendId,
  //   });
  //   return [...allMsgs, { friend: user, messages }];
  // });
  // return allData;
};

// .join("images", function () {
//   return this.on("images.id", "users.image_id");
// });

const getmsgsForSocket = async (data) => {
  const msg = await db("message")
    .where("message.id", data.id)
    .join("users", "message.senderId", "users.id")
    .join("images", "users.image_id", "images.id")
    .select(
      "message.id",
      "message.senderId",
      "users.firstName",
      "users.lastName",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    )
    .first();
  // const user = await db("users")
  //   .where({ id: msg.senderId })
  //   .join("images", "users.image_id", "images.id")
  //   .first();

  return msg;
};

export default {
  getMsgById,
  sendMessage,
  getMessagesBetweenUsers,
  getAllMessagesList,
  getmsgsForSocket,
};
