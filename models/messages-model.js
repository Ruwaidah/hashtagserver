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
  const [id] = await db("message").insert(data, "id");

  if (!msgConnect) {
    // const createId = uniqid();
    const newMsg1 = await db("message_connect").insert(
      { userId: data.senderId, friendId: data.receiverId },
      "id"
    );
    const newMsg2 = await db("message_connect").insert(
      { userId: data.receiverId, friendId: data.senderId },
      "id"
    );
  }
  //   return getMessagesBetweenUsers({
  //     userid: data.senderId,
  //     friendid: data.receiverId,
  //   });
  // }
  //  else
  // return getMsgById(id);
  return getMessagesBetweenUsers({
    userid: data.senderId,
    friendid: data.receiverId,
  });
};

// *********************** GET ALL PRIVATE MESSAGE BETWEEN TWO USER *************************
const getMessagesBetweenUsers = async (data) => {
  const isConnected = await db("message_connect")
    .where({ userId: data.userid, friendId: data.friendid })
    .join("users", "message_connect.friendId", "users.id")
    .join("images", "users.image_id", "images.id")
    .select(
      "message_connect.id as connectId",
      "message_connect.friendId as id",
      // "message_connect.last_read_msg_id",
      "users.firstName",
      "users.lastName",
      "users.username",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    )
    .first();
  if (!isConnected) {
    return null;
    // {
    //   connectId: isConnected.connectId,
    //   friend: isConnected,
    //   messages: [],
    // };
  } else {
    const msgBetweenUserAndFriend = await db("message")
      .where({ receiverId: data.userid, senderId: data.friendid })
      .orWhere({ receiverId: data.friendid, senderId: data.userid });
    const numberOfMsgUnread1 = msgBetweenUserAndFriend.filter(
      (msg) => msg.isRead === false && msg.senderId == data.userid
    );
    const numberOfMsgUnread2 = msgBetweenUserAndFriend.filter(
      (msg) => msg.isRead === false && msg.senderId == data.friendid
    );
    return {
      connectId: isConnected.connectId,
      friend: isConnected,
      numberOfMsgUnread: numberOfMsgUnread2.length,
      // numberOfMsgUnread: {
      //   numberOfMsgUnread1: numberOfMsgUnread1.length,
      //   numberOfMsgUnread2: numberOfMsgUnread2.length,
      // },
      messages: msgBetweenUserAndFriend,
    };
  }
};

// *********************** GET ALL MESSAGES LIST FOR USER *************************
const getAllMessagesList = async (id) => {
  const textedUsersIds = await db("message_connect").where({ userId: id });
  return textedUsersIds;
};
const getmsgsForSocket = async (data) => {
  const msg = await db("message")
    .where("message.id", data.id)
    .join("users", "message.senderId", "users.id")
    .join("images", "users.image_id", "images.id")
    .select(
      "message.id",
      "message.senderId",
      "message.isRead",
      "users.firstName",
      "users.lastName",
      "users.username",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    )
    .first();
  return msg;
};

// ************************** OPEN UNREAD MESSAGE ******************************
const openReadMessage = async (data) => {
  return db("message")
    .where({ receiverId: data.userId, senderId: data.friendId })
    // .orWhere({ receiverId: data.friendId, senderId: data.userId })
    .update({ isRead: true });
};

export default {
  getMsgById,
  sendMessage,
  getMessagesBetweenUsers,
  getAllMessagesList,
  getmsgsForSocket,
  openReadMessage,
};
