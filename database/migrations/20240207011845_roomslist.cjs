/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function up(knex) {
  return knex.schema.createTable("groupslist", (tb) => {
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
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function down(knex) {
  return knex.schema.dropTableIfExists("groupslist");
}

module.exports = { up, down };
