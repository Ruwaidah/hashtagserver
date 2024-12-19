/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
async function seed(knex) {
  // Deletes ALL existing entries
  await knex("groupslist").del();
  await knex("groupslist").insert([
    { id: 1, roomname: "Room Chat 1", numberofusers: 50, user_id: 1 },
    { id: 2, roomname: "Room Chat 2", numberofusers: 50, user_id: 1 },
    { id: 3, roomname: "Room Chat 3", numberofusers: 50, user_id: 1 },
  ]);
}

module.exports = { seed };
