const upDateMsgs = {
  roomMessages: {},
  addNewMsg: function (newMsg, id) {
    if (!this.roomMessages[id]) this.roomMessages[id] = [];
    this.roomMessages[id] = [...this.roomMessages[id], newMsg];
  },
  clearMessages: function (userId) {
    this.roomMessages[userId] = [];
  },
};

module.exports = upDateMsgs;
