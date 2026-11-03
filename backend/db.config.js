let dbConfig;
export default dbConfig = {
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USER || "postgres",
    PASSWORD: process.env.DB_PASSWORD || "postgres",
    DB: process.env.DB_NAME || "poke_agent",
    PORT: process.env.DB_PORT || 5432,
    dialect: "postgres",
    pool: {
        max: 20,
        min: 0,
        acquire: 10000,
        idle: 10000,
        evict: 10000
    }
};
