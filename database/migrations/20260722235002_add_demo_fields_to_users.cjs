/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function up(knex) {
    return knex.schema.alterTable("users", (tb) => {
        tb.boolean("is_demo").notNullable().defaultTo(false);
        tb.string("demo_key", 30).unique().defaultTo(null);
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function down(knex) {
    return knex.schema.alterTable("users", (tb) => {
        tb.dropColumn("demo_key");
        tb.dropColumn("is_demo");
    });
}

module.exports = { up, down };