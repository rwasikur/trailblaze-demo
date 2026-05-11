const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://trailblaze:trailblazepass@postgres:5432/trailblaze', {
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL
    pool: {
        max: 30,
        min: 5,
        acquire: 60000,
        idle: 10000
    }
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
