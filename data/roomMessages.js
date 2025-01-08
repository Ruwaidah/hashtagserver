import uniqid from "uniqid";
import UserState from "../usersdata.js";

const upDateMsgs = {
  roomMessages: {},
  privateMessages: {},
  addNewMsg: function (newMsg, id) {
    if (!this.roomMessages[id]) this.roomMessages[id] = [];
    this.roomMessages[id] = [...this.roomMessages[id], newMsg];
  },
  addNewPrivateMessage: function (data, time) {
    const userData = {};
    const msgId = data.msgId ? data.msgId : uniqid();
    if (!this.privateMessages[msgId]) {
      this.privateMessages[msgId] = [];
      UserState.users.map((user) => {
        if (user.id === data.sendTo.id) {
          user.privatMsgsId = [
            ...user.privatMsgsId,
            { msgId, isDeleted: false },
          ];
          userData.sendTo = user.privatMsgsId;
        } else if (user.id === data.sendFrom.id) {
          user.privatMsgsId = [
            ...user.privatMsgsId,
            { msgId, isDeleted: false },
          ];
          userData.sendFrom = user.privatMsgsId;
        }
      });
    }
    this.privateMessages[msgId] = [
      ...this.privateMessages[msgId],
      { ...data, time },
    ];

    return { msgData: { [msgId]: this.privateMessages[msgId] }, ...userData };
  },
  clearMessages: function (userId) {
    this.roomMessages[userId] = [];
  },
};

export default upDateMsgs;

// ...messages,{
//   sendFrom: data.sendFrom,
//   sendTo: data.sendTo,
//   message: data.message,
//   time,
// },
