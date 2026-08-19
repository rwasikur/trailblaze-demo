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

const connectDB = async (retries = 2, delay = 1000) => {
    while (retries > 0) {
        try {
            await sequelize.authenticate();
            console.log('Database connected via Sequelize');
            await sequelize.sync({ alter: true });
            console.log('Database models synced');
            return;
        } catch (err) {
            console.error(`DB connection error: ${err.message}. Retries left: ${retries - 1}`);
            retries -= 1;
            if (retries === 0) {
                throw new Error(`Failed to connect to database: ${err.message}`);
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
};

module.exports = { sequelize, connectDB };
