const cleaner = require("knex-cleaner");

function seed(knex) {
  return cleaner.clean(knex, {
    mode: "truncate",
    ignoreTables: ["knex_migrations", "knex_migrations_lock"]
  });
};

module.exports = {seed}