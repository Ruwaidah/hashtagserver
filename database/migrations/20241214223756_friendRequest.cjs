/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function up(knex) {
  return knex.schema.createTable("friendRequest", (tb) => {
    tb.increments();
    tb.string("create_at").defaultTo(knex.fn.now());
    tb.integer("userSendRequest")
      .notNullable()
      .references("id")
      .inTable("users")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");
    tb.integer("userRecieveRequest")
      .notNullable()
      .references("id")
      .inTable("users")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");
    tb.boolean("isPending").defaultTo(true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function down(knex) {
  return knex.schema.dropTableIfExists("friendRequest");
}

module.exports = { down, up };
