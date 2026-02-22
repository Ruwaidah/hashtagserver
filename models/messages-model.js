import db from "../database/dbConfig.js";
import Friend from "./friends-model.js";
import User from "./user_model.js";
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
    const newMsg1 = await db("message_connect").insert(
      { userId: data.senderId, friendId: data.receiverId },
      "id"
    );
    const newMsg2 = await db("message_connect").insert(
      { userId: data.receiverId, friendId: data.senderId },
      "id"
    );
  }

  return db("message").where(id).first();
  // return getMessagesBetweenUsers({
  //   userid: data.senderId,
  //   friendid: data.receiverId,
  // });
};

// *********************** GET ALL PRIVATE MESSAGE BETWEEN TWO USER *************************
const getMessagesBetweenUsers = async (data) => {
  const { userid, friendid } = data;

  const areFriend = await Friend.isFriend({
    userid,
    friendId: friendid,
  });

  const friend = await User.getFriendById({
    friendid,
    userid,
  });

  const isConnected = await db("message_connect")
    .where({ userId: userid, friendId: friendid })
    .join("users", "message_connect.friendId", "users.id")
    .leftJoin("images", "users.image_id", "images.id")
    .select(
      "message_connect.id as connectId",
      "message_connect.friendId as id",
      "users.firstName",
      "users.lastName",
      "users.username",
      "users.bio",
      "users.image_id",
      "images.image",
      "images.public_id"
    )
    .first();

  const messages = await db("message")
    .whereRaw(
      `("receiverId" = ? AND "senderId" = ?) OR ("receiverId" = ? AND "senderId" = ?)`,
      [userid, friendid, friendid, userid]
    )
    .orderBy("create_at", "asc");

  const unreadRow = await db("message")
    .count("* as unread")
    .whereRaw(
      `"receiverId" = ? AND "senderId" = ? AND "isRead" = false`,
      [userid, friendid]
    )
    .first();

  const numberOfMsgUnread = Number(unreadRow?.unread || 0);

  return {
    connectId: isConnected ? isConnected.connectId : null,
    friend,
    numberOfMsgUnread,
    messages,
    areFriend: !!areFriend,
  };
};




const createMessage = async ({ senderId, receiverId, text }) => {
  const [row] = await db("message")
    .insert({ senderId, receiverId, text, isRead: false })
    .returning(["id", "senderId", "receiverId", "text", "isRead", "create_at"]);
  return row;
};




// *********************** GET ALL MESSAGES LIST FOR USER *************************
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



// *********************** GET ALL MESSAGES LIST FOR USER *************************
const getMessagesList = async (userId) => {
  const uid = Number(userId);
  if (!Number.isInteger(uid)) throw new Error("Invalid userId");

  const friendIdCaseSql = `CASE WHEN m."senderId" = ${uid} THEN m."receiverId" ELSE m."senderId" END`;

  // subquery: last message id per friendId
  const lastMsgSub = db("message as m")
    .where((q) => q.where("m.senderId", uid).orWhere("m.receiverId", uid))
    .select(db.raw(`${friendIdCaseSql} as "friendId"`))
    .max({ lastMsgId: "m.id" })
    .groupByRaw(friendIdCaseSql)
    .as("lm");

  // rows: friend info + last message
  const rows = await db("users as u")
    .join(lastMsgSub, "lm.friendId", "u.id")
    .leftJoin("images as img", "u.image_id", "img.id")
    .leftJoin("message as lastm", "lastm.id", "lm.lastMsgId")
    .select(
      db.raw(`u.id as "friendId"`),
      "u.firstName",
      "u.lastName",
      "u.username",
      "u.bio",
      "u.image_id",
      "img.image as image",
      "img.public_id",
      "lastm.text as lastText",
      "lastm.create_at as lastCreateAt",
      db.raw(`lastm."senderId" as "lastSenderId"`)
    )
    .orderBy("lastm.create_at", "desc");

  // unread count
  const unreadRows = await db("message as m")
    .select(db.raw(`m."senderId" as "friendId"`))
    .count("* as unread")
    .where("m.receiverId", uid) 
    .andWhere("m.isRead", false)
    .groupBy("m.senderId");

  const unreadMap = Object.fromEntries(
    unreadRows.map((r) => [String(r.friendId), Number(r.unread)])
  );

  const data = {};
  let totalUnreadMsgs = 0;

  rows.forEach((r) => {
    const unread = unreadMap[String(r.friendId)] || 0;
    totalUnreadMsgs += unread;

    data[r.friendId] = {
      friend: {
        id: r.friendId,
        firstName: r.firstName,
        lastName: r.lastName,
        username: r.username,
        bio: r.bio,
        image: r.image,
        image_id: r.image_id,
        public_id: r.public_id,
      },
      numberOfMsgUnread: unread,
      messages: r.lastText
        ? [{ text: r.lastText, create_at: r.lastCreateAt, senderId: r.lastSenderId }]
        : [],
    };
  });

  return { data, totalUnreadMsgs };
};



// ************************** OPEN UNREAD MESSAGE ******************************
const openReadMessage = async ({ userId, friendId }) => {
  return db("message")
    .where({ receiverId: userId, senderId: friendId, isRead: false })
    .update({ isRead: true });
};


export default {
  getMsgById,
  sendMessage,
  getMessagesBetweenUsers,
  getMessagesList,
  createMessage,
  getmsgsForSocket,
  openReadMessage,
};
