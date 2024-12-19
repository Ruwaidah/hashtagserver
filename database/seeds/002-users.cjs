const bcrypt = require("bcryptjs");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
async function seed(knex) {
  // Deletes ALL existing entries
  const password = bcrypt.hashSync("12345678", 8);
  await knex("users").del();
  await knex("users").insert([
    {
      fullName: "owner",
      email: "owner@gmail.com",
      password: password,
      image_id: "1",
    },
    {
      fullName: "test1",
      email: "test1@gmail.com",
      password: password,
      image_id: "1",
      // public_id: process.env.IMAGE_PUBLIC_ID,
      // image: process.env.NO_IMAGE,
    },
    {
      fullName: "test2",
      email: "test2@gmail.com",
      password: password,
      image_id: "1",
    },
    {
      fullName: "test3",
      email: "test3@gmail.com",
      password: password,
      image_id: "1",
    },
  ]);
}

module.exports = { seed };
