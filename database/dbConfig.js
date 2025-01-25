import knex from "knex";
import knexConfig from "../knexfile.js"

const enviroment = process.env.DB_ENV;
// const enviroment = "production"
export default knex(knexConfig[enviroment]);
