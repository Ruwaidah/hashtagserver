/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("roomslist", (tb) => {
    tb.increments();
    tb.timestamp("create_at").defaultTo(knex.fn.now());
    tb.string("roomname", 50).notNullable().unique();
    tb.integer("numberofusers", 500).notNullable();
    tb.integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("roomslist");
};
