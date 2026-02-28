import dotenv from "dotenv";
dotenv.config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  development: {
    client: "postgresql",
    useNullAsDefault: true,
    connection: {
      database: "hashtagserver",
      user: "postgres",
      password: process.env.DEVELOPMENT_DB_PASSWORD,
    },
    pool: {
      min: 0,
      max: 20,
    },
    migrations: {
      directory: "./database/migrations",
    },
    seeds: {
      directory: "./database/seeds",
    },
  },

  staging: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password",
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },

  production: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 0, max: 20 },
    migrations: {
      directory: "./database/migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./database/seeds",
    },
  },
};
