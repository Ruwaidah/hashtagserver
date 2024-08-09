const UserState = {
  users: [],
  userdisconnectId: null,
  setUsers: function (newUsersArray) {
    this.users = newUsersArray;
  },
  setUserDisId: function (id) {
    this.userdisconnectId = id;
  },
};

module.exports = UserState;
