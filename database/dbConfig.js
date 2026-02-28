import knex from "knex";
import knexConfig from "../knexfile.js";

const env = process.env.NODE_ENV || "development"; // Render should be "production"
const config = knexConfig[env];

if (!config) {
  throw new Error(
    `Invalid knex environment: ${env}. Available: ${Object.keys(knexConfig).join(", ")}`
  );
}

export default knex(config);