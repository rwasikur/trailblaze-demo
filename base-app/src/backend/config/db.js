const { Sequelize } = require('sequelize');

const isPostgres = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');

const sequelize = isPostgres
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            ssl: process.env.DB_SSL === 'false' ? false : { require: true, rejectUnauthorized: false }
        },
        pool: { max: 30, min: 5, acquire: 60000, idle: 10000 }
    })
    : new Sequelize({
        dialect: 'sqlite',
        storage: '/tmp/trailblaze.sqlite',
        logging: false
    });

const connectDB = async (retries = 5, delay = 5000) => {
    while (retries > 0) {
        try {
            await sequelize.authenticate();
            console.log('PostgreSQL Connected via Sequelize');
            // Sync models. In production this should be handled by migrations
            await sequelize.sync({ alter: true });
            console.log('PostgreSQL Models synced');
            return;
        } catch (err) {
            console.error(`Error connecting to PostgreSQL: ${err.message}. Retries left: ${retries - 1}`);
            retries -= 1;
            if (retries === 0) {
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

module.exports = { sequelize, connectDB };
