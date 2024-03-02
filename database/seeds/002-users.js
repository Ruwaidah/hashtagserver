/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del()
  await knex('users').insert([
    {id: 1, username: 'test1' , email: "ru00011@gmail.com", password: "12345678" },
    {id: 2, username: 'test2', email: "ru0001661@gmail.com", password: "12345678" },
    {id: 3, username: 'test3', email: "ru0001441@gmail.com", password: "12345678" }
  ]);
};
