/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("roomslist").del();
  await knex("roomslist").insert([
    { id: 1, roomname: "room1", numberofusers: 50, user_id: 1 },
    { id: 2, roomname: "room2", numberofusers: 50, user_id: 1 },
    { id: 3, roomname: "room3", numberofusers: 50, user_id: 1 },
  ]);
};
