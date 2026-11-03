import dbConfig from "../db.config.js";
import { Sequelize } from "sequelize";
import User from "./user.js";

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    operatorsAliases: 0,
    omitNull: true,
    logging: false,
    dialectOptions: {
        keepAlive: true
    },
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
        evict: dbConfig.pool.evict || 10000
    }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = User(sequelize);

export default db;
