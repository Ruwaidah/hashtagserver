const uniqid = require("uniqid");
const UserState = require("../usersdata.js");

const upDateMsgs = {
  roomMessages: {},
  privateMessages: {},
  addNewMsg: function (newMsg, id) {
    console.log("new msg", newMsg);
    if (!this.roomMessages[id]) this.roomMessages[id] = [];
    this.roomMessages[id] = [...this.roomMessages[id], newMsg];
  },
  addNewPrivateMessage: function (data, time) {
    console.log(data.id);
    console.log(uniqid());
    const userData = {};
    const msgId = data.msgId ? data.msgId : uniqid();
    console.log("data", msgId);
    console.log("this.privateMessages[msgId]", this.privateMessages[msgId]);
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

module.exports = upDateMsgs;

// ...messages,{
//   sendFrom: data.sendFrom,
//   sendTo: data.sendTo,
//   message: data.message,
//   time,
// },
