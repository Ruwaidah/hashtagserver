import knex from "knex";
import knexConfig from "../knexfile.js"

const enviroment = process.env.DB_ENV;
export default knex(knexConfig[enviroment]);
