/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function up(knex) {
  return knex.schema.createTable("message", (tb) => {
    tb.increments();
    tb.integer("senderId")
      .notNullable()
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users");
    tb.integer("receiverId")
      .notNullable()
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users");
    tb.string("text", 255);
    tb.timestamp("create_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function down(knex) {
  return knex.schema.dropTableIfExists("message").dropTableIfExists("users");
}

module.exports = { down, up };
