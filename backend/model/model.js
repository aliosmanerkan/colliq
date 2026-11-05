import dbConfig from "../db.config.js";
import { Sequelize } from "sequelize";
import User from "./user.js";
import Vault from "./vault.js";
import Card from "./card.js";
import Trade from "./trade.js";

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
db.vault = Vault(sequelize);
db.card = Card(sequelize);
db.trade = Trade(sequelize);

// Relationships
db.vault.hasMany(db.card, { foreignKey: "vault_id", as: "inventory" });
db.card.belongsTo(db.vault, { foreignKey: "vault_id", as: "vault" });

db.vault.hasMany(db.trade, { foreignKey: "vault_a_id", as: "trades_as_a" });
db.vault.hasMany(db.trade, { foreignKey: "vault_b_id", as: "trades_as_b" });

export default db;
