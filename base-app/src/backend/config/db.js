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
        if (isPostgres) {
            await sequelize.sync({ alter: true });
        } else {
            await sequelize.sync();
        }
        console.log('Database models synced');

        // Auto-seed if database is empty (essential for Vercel demo)
        const Car = require('../models/Car');
        const count = await Car.count();
        if (count === 0) {
            console.log('Database is empty. Auto-seeding public cars and demo data...');
            const { seedPublic } = require('../scripts/seed_public');
            await seedPublic();
            console.log('Auto-seeding complete!');
        }
    } catch (err) {
        console.warn(`DB connection warning: ${err.message}. Backend running in serverless mode.`);
    }
};

module.exports = { sequelize, connectDB };
