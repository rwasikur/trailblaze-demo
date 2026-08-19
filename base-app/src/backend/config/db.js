const { Sequelize } = require('sequelize');

const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

let sequelize;

if (isPostgres) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: process.env.DB_SSL === 'false' ? false : { require: true, rejectUnauthorized: false }
        },
        pool: { max: 30, min: 5, acquire: 60000, idle: 10000 }
    });
} else {
    try {
        const sqlite3 = require('sqlite3');
        sequelize = new Sequelize({
            dialect: 'sqlite',
            dialectModule: sqlite3,
            storage: '/tmp/trailblaze.sqlite',
            logging: false
        });
    } catch (e) {
        console.warn('sqlite3 native module not available in serverless runtime, running in static demo mode');
        sequelize = new Sequelize('sqlite::memory:', { logging: false });
    }
}

const connectDB = async (retries = 2, delay = 1000) => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');
        await sequelize.sync({ alter: true });
        console.log('Database models synced');
    } catch (err) {
        console.warn(`DB connection warning: ${err.message}. Backend running in serverless mode.`);
    }
};

module.exports = { sequelize, connectDB };
