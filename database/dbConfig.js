

import knex from "knex";
import knexConfig from "../knexfile.js";

const env = process.env.NODE_ENV || "development"; // Render should be production
console.log("KNEX ENV:", env); // TEMP: to confirm in Render logs

export default knex(knexConfig[env]);