/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function up(knex) {
  return knex.schema
    // .createTable("images", (tb) => {
    //   tb.increments();
    //   tb.string("image", 200).notNullable();
    //   tb.string("public_id", 200).notNullable();
    // })
    .createTable("users", (tb) => {
      tb.increments();
      tb.timestamp("create_at").defaultTo(knex.fn.now());
      tb.string("firstName", 50).notNullable();
      tb.string("lastName", 50).notNullable();
      tb.string("username", 10).notNullable().unique();
      tb.string("email", 100).notNullable().unique();
      tb.string("bio", 200).defaultTo(null);
      tb.string("password", 255).notNullable();
      tb.integer("image_id")
        .notNullable()
        .references("id")
        .inTable("images")
        .onUpdate("CASCADE")
        .onDelete("RESTRICT");
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
function down(knex) {
  return knex.schema.dropTableIfExists("images").dropTableIfExists("users");
}

module.exports = { up, down };
