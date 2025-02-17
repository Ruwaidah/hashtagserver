/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function up(knex) {
  return knex.schema.createTable("images", (tb) => {
    tb.increments();
    tb.string("image", 200).notNullable();
    tb.string("public_id", 200).notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function down(knex) {
  return knex.schema.dropTableIfExists("images");
}

module.exports = { up, down };
