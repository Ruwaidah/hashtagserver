const db = require("../database/dbConfig.js");

const getRooms = () => db("roomslist");

module.exports = { getRooms };
