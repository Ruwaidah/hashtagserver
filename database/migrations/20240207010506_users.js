/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", (tb) => {
    tb.increments();
    tb.timestamp("create_at").defaultTo(knex.fn.now());
    tb.string("username", 50).notNullable().unique();
    tb.string("email", 100).notNullable().unique();
    tb.string("image_url", 255).notNullable();
    tb.string("password", 255).notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("users");
};
