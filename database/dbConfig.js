import knex from "knex";
import knexConfig from "../knexfile.js";

const env = process.env.NODE_ENV || "development";
console.log("KNEX ENV:", env);

export default knex(knexConfig[env]);