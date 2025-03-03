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
      .references("id")
      .inTable("users");
    tb.integer("receiverId")
      .notNullable()
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users");
    tb.string("text", 255);
    tb.boolean("isRead").defaultTo(false);
    tb.timestamp("create_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function down(knex) {
  return knex.schema.dropTableIfExists("message");
}

module.exports = { down, up };
