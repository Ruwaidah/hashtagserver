const UserState = {
  users: [],
  userdisconnectId: null,
  setUsers: function (newUsersArray) {
    this.users = newUsersArray;
    return this.users;
  },
  setUserDisId: function (id) {
    this.userdisconnectId = id;
  },
};

export default UserState;
