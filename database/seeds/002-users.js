const bcrypt = require("bcryptjs");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  const password = bcrypt.hashSync("12345678", 8);
  await knex("users").del();
  await knex("users").insert([
    {
      username: "owner",
      email: "owner@gmail.com",
      password: password,
      isAdmin: true,
      image_id: "1",
    },
    {
      username: "test1",
      email: "test1@gmail.com",
      password: "12345678",
      isAdmin: false,
      image_id: "1",
      // public_id: process.env.IMAGE_PUBLIC_ID,
      // image: process.env.NO_IMAGE,
    },
    {
      username: "test2",
      email: "test2@gmail.com",
      password: "12345678",
      isAdmin: false,
      image_id: "1",
    },
    {
      username: "test3",
      email: "test3@gmail.com",
      password: "12345678",
      isAdmin: false,
      image_id: "1",
    },
  ]);
};
