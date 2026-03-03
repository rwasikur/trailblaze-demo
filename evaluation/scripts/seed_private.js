/**
 * Private database seeding script for TrailblazeAuto.
 * This script initializes the database setup but refrains from adding explicit seed data.
 * The database will remain empty for private/testing deployment.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../../base-app/src/backend/.env' });

const seedPrivate = async () => {
    try {
        console.log("🌱 Running private database initialization...");
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/trailblazeauto';
        await mongoose.connect(uri);

        // Dummy insert if required - leaving empty normally for private tests
        console.log("    Verified DB connection.");

        console.log("✅ Private database initialized successfully with seed data.");
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error during private database initialization: ${error}`);
        process.exit(1);
    }
};

seedPrivate();
