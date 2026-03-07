const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://trailblaze:trailblazepass@postgres:5432/trailblaze', {
    dialect: 'postgres',
    logging: false, // Set to console.log to see SQL
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Connected via Sequelize');

        // Sync models. In production this should be handled by migrations
        await sequelize.sync({ alter: true });
        console.log('PostgreSQL Models synced');
    } catch (err) {
        console.error(`Error connecting to PostgreSQL: ${err.message}`);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
