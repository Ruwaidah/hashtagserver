/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("users").del();
  await knex("users").insert([
    {
      username: "test1",
      email: "test1@gmail.com",
      password: "12345678",
      image_id: "1",
      // public_id: process.env.IMAGE_PUBLIC_ID,
      // image: process.env.NO_IMAGE,
    },
    {
      username: "test2",
      email: "test2@gmail.com",
      password: "12345678",
      image_id: "1",
    },
    {
      username: "test3",
      email: "test3@gmail.com",
      password: "12345678",
      image_id: "1",
    },
  ]);
};
