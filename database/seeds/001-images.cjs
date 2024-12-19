/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
async function seed(knex) {
  // Deletes ALL existing entries
  await knex("images").del();
  await knex("images").insert([
    {
      id: 1,
      public_id: process.env.IMAGE_PUBLIC_ID,
      image: process.env.NO_IMAGE,
    },
  ]);
}

module.exports = { seed };
