/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function up(knex) {
  return knex.schema.createTable("friends", (tb) => {
    tb.increments();
    tb.timestamp("create_at").defaultTo(knex.fn.now());
    tb.integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users");
    tb.integer("friend_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function down(knex) {
  return knex.schema.dropTableIfExists("friends");
}

module.exports = { down, up };
