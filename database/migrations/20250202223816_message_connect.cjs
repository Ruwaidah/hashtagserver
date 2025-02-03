/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function up(knex) {
  return knex.schema.createTable("message_connect", (tb) => {
    tb.increments();
    tb.integer("userId")
      .notNullable()
      .unsigned()
      .references("id")
      .inTable("users");
    tb.integer("friendId")
      .notNullable()
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users");
    tb.timestamp("create_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function down(knex) {
  return knex.schema.dropTableIfExists("message").dropTableIfExists("message_connect");
}

module.exports = { down, up };
