/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("groupslist").del();
  await knex("groupslist").insert([
    { id: 1, roomname: "Group1", numberofusers: 50, user_id: 1 },
    { id: 2, roomname: "Group2", numberofusers: 50, user_id: 1 },
    { id: 3, roomname: "Group3", numberofusers: 50, user_id: 1 },
  ]);
};
